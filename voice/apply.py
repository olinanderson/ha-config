"""Write voice/spec.yaml and voice/prompt.md into Home Assistant.

Areas, device areas, entity aliases, what Assist may see, the Claude agent's
settings and the voice pipeline all live in HA's .storage, not in YAML, so
this is how they get there from git. It runs inside the HA container, where
aiohttp and PyYAML are at hand:

  ssh hassio@100.80.15.86 'TOKEN=$(sudo cat /config/.gps_filter_token); \
    sudo docker exec -e TOKEN="$TOKEN" homeassistant python3 /config/voice/apply.py [--dry]'

deploy.sh runs it when anything in voice/ changes. Only differences are
written, and each one is printed; --dry prints them without writing.
"""

import asyncio
import json
import os
import sys

import aiohttp
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
HA = "http://localhost:8123"
DRY = "--dry" in sys.argv


async def main() -> None:
    spec = yaml.safe_load(open(os.path.join(HERE, "spec.yaml")))
    headers = {"Authorization": f"Bearer {os.environ['TOKEN']}"}
    problems: list[str] = []

    async with aiohttp.ClientSession() as http, http.ws_connect(
        f"{HA}/api/websocket", max_msg_size=0
    ) as ws:
        await ws.receive_json()
        await ws.send_json({"type": "auth", "access_token": os.environ["TOKEN"]})
        if (await ws.receive_json())["type"] != "auth_ok":
            sys.exit("auth failed")
        msg_id = 0

        async def call(msg: dict) -> object:
            nonlocal msg_id
            msg_id += 1
            await ws.send_json({**msg, "id": msg_id})
            while True:
                r = await ws.receive_json()
                if r.get("id") == msg_id:
                    if not r["success"]:
                        raise RuntimeError(f"{msg['type']}: {r['error']}")
                    return r["result"]

        async def write(what: str, msg: dict) -> object:
            print(("would " if DRY else "") + what)
            return None if DRY else await call(msg)

        # ── Areas ──
        areas = {a["name"]: a for a in await call({"type": "config/area_registry/list"})}
        area_id: dict[str, str] = {}
        for a in spec["areas"]:
            want = {"aliases": sorted(a.get("aliases", [])), "icon": a.get("icon")}
            cur = areas.get(a["name"])
            if cur is None:
                r = await write(f"create area {a['name']}", {"type": "config/area_registry/create", "name": a["name"], **want})
                area_id[a["name"]] = r["area_id"] if r else f"<{a['name']}>"
                continue
            area_id[a["name"]] = cur["area_id"]
            if sorted(cur.get("aliases") or []) != want["aliases"] or cur.get("icon") != want["icon"]:
                await write(f"update area {a['name']}", {"type": "config/area_registry/update", "area_id": cur["area_id"], **want})

        # ── Device areas ──
        by_name: dict[str, list[dict]] = {}
        for d in await call({"type": "config/device_registry/list"}):
            by_name.setdefault(d.get("name_by_user") or d.get("name") or "", []).append(d)
        for name, area in spec.get("devices", {}).items():
            found = by_name.get(name, [])
            if len(found) != 1:
                problems.append(f"device {name!r}: {len(found)} found")
            elif found[0].get("area_id") != area_id[area]:
                await write(f"device {name} -> {area}", {"type": "config/device_registry/update", "device_id": found[0]["id"], "area_id": area_id[area]})

        # ── Entity aliases and areas ──
        expose: dict[str, dict] = {k: v or {} for k, v in spec["expose"].items()}
        entries = await call({"type": "config/entity_registry/get_entries", "entity_ids": list(expose)})
        for eid, want in expose.items():
            entry = entries.get(eid)
            if entry is None:
                problems.append(f"{eid}: not in the entity registry")
                continue
            change = {}
            if "aliases" in want and (entry.get("aliases") or []) != want["aliases"]:
                change["aliases"] = want["aliases"]
            if "area" in want and entry.get("area_id") != area_id[want["area"]]:
                change["area_id"] = area_id[want["area"]]
            if change:
                await write(f"{eid}: {json.dumps(change)}", {"type": "config/entity_registry/update", "entity_id": eid, **change})

        # ── What Assist may see: exactly the spec ──
        exposed = (await call({"type": "homeassistant/expose_entity/list"}))["exposed_entities"]
        now = {e for e, v in exposed.items() if v.get("conversation")}
        for ids, on in ((sorted(set(expose) - now), True), (sorted(now - set(expose)), False)):
            if ids:
                await write(
                    f"{'expose' if on else 'unexpose'} {len(ids)}: {', '.join(ids)}",
                    {"type": "homeassistant/expose_entity", "assistants": ["conversation"], "entity_ids": ids, "should_expose": on},
                )
        if (await call({"type": "homeassistant/expose_new_entities/get", "assistant": "conversation"}))["expose_new"]:
            await write("stop exposing new entities to Assist", {"type": "homeassistant/expose_new_entities/set", "assistant": "conversation", "expose_new": False})

        # ── The Claude agent: walk the subentry's reconfigure flow ──
        if agent := spec.get("agent"):
            entry_id, sub = find_subentry(agent["subentry"])
            want = {
                "prompt": open(os.path.join(HERE, agent["prompt"])).read(),
                "llm_hass_api": ["assist"],
                "recommended": False,
                "chat_model": agent["model"],
                "max_tokens": agent.get("max_tokens", 1024),
                "temperature": agent.get("temperature", 1.0),
                **agent.get("model_options", {}),
            }
            if {k: sub["data"].get(k) for k in want} != want:
                print(("would " if DRY else "") + f"set {agent['subentry']}: {agent['model']} {agent.get('model_options', {})}")
                if not DRY:
                    await run_subentry_flow(http, headers, entry_id, sub["subentry_id"], want)

        # ── The pipeline the Voice PE uses ──
        if pipe := spec.get("pipeline"):
            pipelines = (await call({"type": "assist_pipeline/pipeline/list"}))["pipelines"]
            cur = next(p for p in pipelines if p["name"] == pipe["name"])
            engine = pipe["conversation_engine"]
            if engine.startswith("subentry:"):
                _, sub = find_subentry(engine.split(":", 1)[1])
                engine = next(
                    e["entity_id"]
                    for e in await call({"type": "config/entity_registry/list"})
                    if e.get("config_subentry_id") == sub["subentry_id"] and e["entity_id"].startswith("conversation.")
                )
            want = {**cur, "conversation_engine": engine, "prefer_local_intents": pipe["prefer_local_intents"]}
            if want != cur:
                want["pipeline_id"] = want.pop("id")
                await write(f"pipeline {pipe['name']}: {engine}, prefer_local_intents={pipe['prefer_local_intents']}", {"type": "assist_pipeline/pipeline/update", **want})

    for p in problems:
        print("PROBLEM:", p)
    sys.exit(1 if problems else 0)


def find_subentry(title: str) -> tuple[str, dict]:
    """The Anthropic subentry with this title, read from .storage."""
    store = json.load(open("/config/.storage/core.config_entries"))["data"]["entries"]
    for entry in store:
        if entry["domain"] == "anthropic":
            for sub in entry.get("subentries", []):
                if sub["title"] == title:
                    return entry["entry_id"], sub
    raise SystemExit(f"no Anthropic subentry called {title!r}")


async def run_subentry_flow(http, headers, entry_id: str, subentry_id: str, data: dict) -> None:
    """Answer each form of the reconfigure flow from data (init, advanced, model)."""
    base = f"{HA}/api/config/config_entries/subentries/flow"
    async with http.post(base, headers=headers, json={"handler": [entry_id, "conversation"], "subentry_id": subentry_id}) as r:
        step = await r.json()
    while step.get("type") == "form":
        fields = {f["name"] for f in step["data_schema"]}
        answer = {k: v for k, v in data.items() if k in fields}
        async with http.post(f"{base}/{step['flow_id']}", headers=headers, json=answer) as r:
            step = await r.json()
    if step.get("reason") != "reconfigure_successful":
        raise RuntimeError(f"subentry flow ended with {step}")


asyncio.run(main())

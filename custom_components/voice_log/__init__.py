"""Voice log: each finished Assist run as one line of JSON in vanlife-data/voice_log.jsonl.

A line holds what was heard, who answered (a local sentence or Claude),
Claude's tool calls with their results, the reply and a result flag, so the
requests it can't handle can be found and fixed later (docs/voice-assistant.md,
"Voice log").

HA keeps only the last 10 runs per pipeline, in memory: the debug view under
Settings > Voice assistants. This reads those records every 10 s and appends
the runs that have ended. It only reads them, so if a new HA version changes
their layout the log stops (with an error in HA's log) and voice keeps working.
"""

from __future__ import annotations

from datetime import timedelta
import json
import logging
import os
import re
from typing import Any

from homeassistant.components.assist_pipeline import async_get_pipeline
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.json import json_dumps
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util
from homeassistant.util.json import json_loads

_LOGGER = logging.getLogger(__name__)

DOMAIN = "voice_log"
CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)

# Not in www/: HA serves that at /local/ without login.
LOG_FILE = "vanlife-data/voice_log.jsonl"
MAX_BYTES = 10_000_000  # then the log moves to voice_log.1.jsonl
POLL = timedelta(seconds=10)  # a run is lost only if 10 more start within 10 s

# A reply saying that (part of) the request wasn't done. The first case had
# only successful tool calls: "turn the heater on and set it to 26 on auto"
# got "I can't set it to auto mode", so the reply was the only sign.
UNABLE = re.compile(
    r"\b(can[’']?t|cannot|couldn[’']?t|could not|unable|not able|no way to"
    r"|(isn[’']?t|not) possible|(don[’']?t|doesn[’']?t|not) support"
    r"|don[’']?t (have (a way|access|control|the ability)|know)"
    r"|didn[’']?t (catch|understand)|not sure (what|which|how))\b",
    re.IGNORECASE,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Append each Assist run to the voice log once it has ended."""
    path = hass.config.path(LOG_FILE)
    written: set[str] = set()  # run ids, for as long as HA keeps the run
    broken = False

    async def _write_ended_runs(_: Any = None) -> None:
        nonlocal broken
        if broken:
            return
        try:
            lines = _ended_runs(hass, written)
        except Exception:  # HA changed its debug records: say so once, not every 10 s
            _LOGGER.exception("Voice log stopped: HA's Assist debug records have changed")
            broken = True
            return
        if lines:
            await hass.async_add_executor_job(_append, path, lines)

    async_track_time_interval(hass, _write_ended_runs, POLL, name="voice_log")
    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, _write_ended_runs)
    return True


def _ended_runs(hass: HomeAssistant, written: set[str]) -> list[str]:
    """Log lines for the runs that have ended since the last call."""
    lines: list[str] = []
    kept: set[str] = set()
    for pipeline_id, runs in hass.data["assist_pipeline"].pipeline_debug.items():
        for run_id, run in list(runs.items()):
            kept.add(run_id)
            if run_id in written or not run.events or run.events[-1].type != "run-end":
                continue
            written.add(run_id)
            try:
                # The same dicts the debug view gets over the websocket
                events = json_loads(json_dumps(run.events))
                entry = _summary(_pipeline_name(hass, pipeline_id), events)
            except Exception:  # one odd run must not stop the others
                _LOGGER.exception("Could not log Assist run %s", run_id)
                continue
            lines.append(json.dumps(entry, ensure_ascii=False, default=str))
    written.intersection_update(kept)
    return lines


def _summary(pipeline: str, events: list[dict[str, Any]]) -> dict[str, Any]:
    """One log entry from the events of a finished run."""
    first: dict[str, dict[str, Any]] = {}
    for event in events:
        first.setdefault(event["type"], event)

    def data(event_type: str) -> dict[str, Any]:
        return (first.get(event_type) or {}).get("data") or {}

    def seconds(start: str, end: str) -> float | None:
        if start not in first or end not in first:
            return None
        took = dt_util.parse_datetime(first[end]["timestamp"]) - dt_util.parse_datetime(
            first[start]["timestamp"]
        )
        return round(took.total_seconds(), 1)

    # Claude's tool calls and their results, from the streamed chat log
    tools: dict[str, dict[str, Any]] = {}
    for event in events:
        delta = (event.get("data") or {}).get("chat_log_delta") or {}
        for call in delta.get("tool_calls") or []:
            tools[call["id"]] = {"tool": call["tool_name"], "args": call["tool_args"]}
        if delta.get("role") == "tool_result":
            tool = tools.setdefault(delta["tool_call_id"], {"tool": delta.get("tool_name")})
            tool.update(_tool_outcome(delta.get("tool_result")))

    intent_end = data("intent-end")
    output = intent_end.get("intent_output") or {}
    response = output.get("response") or {}
    reply = ((response.get("speech") or {}).get("plain") or {}).get("speech")
    heard = (data("stt-end").get("stt_output") or {}).get("text") or data(
        "intent-start"
    ).get("intent_input")
    local = intent_end.get("processed_locally")
    targets = (response.get("data") or {}) if local else {}
    error = data("error")

    if error:
        result = "no_speech" if error.get("code") == "stt-no-text-recognized" else "error"
    elif (
        response.get("response_type") == "error"
        or targets.get("failed")
        or any("error" in tool or "failed" in tool for tool in tools.values())
    ):
        result = "failed"
    elif reply and UNABLE.search(reply):
        result = "unable"
    else:
        result = "ok"

    start = first.get("run-start") or events[0]
    entry = {
        "time": dt_util.as_local(dt_util.parse_datetime(start["timestamp"])).isoformat(
            timespec="seconds"
        ),
        "result": result,
        "heard": heard.strip() if heard else None,
        "reply": reply,
        "by": "local" if local else data("intent-start").get("engine"),
        "tools": list(tools.values()) or None,
        "done": _names(targets.get("success")) or None,
        "failed": _names(targets.get("failed")) or None,
        "error": error or None,
        "follow_up": output.get("continue_conversation") or None,
        "seconds": {
            name: took
            for name, took in (
                ("listen", seconds("stt-start", "stt-end")),
                ("think", seconds("intent-start", "intent-end")),
                ("total", seconds("run-start", "run-end")),
            )
            if took is not None
        },
        "input": "voice" if "stt-start" in first else "text",
        "satellite": data("run-start").get("satellite_id"),
        "pipeline": pipeline,
        "conversation_id": data("run-start").get("conversation_id"),
    }
    return {key: value for key, value in entry.items() if value is not None}


def _tool_outcome(result: Any) -> dict[str, Any]:
    """What a tool call did: the entities it acted on, or its error."""
    if not isinstance(result, dict):
        return {"result": _short(result)}
    if "error" in result:  # it raised; HA passes the exception to Claude
        parts = (result["error"], result.get("error_text"))
        return {"error": ": ".join(str(part) for part in parts if part)}
    if result.get("response_type") == "error" or result.get("success") is False:
        return {"error": _short(result)}
    data = result.get("data")
    if isinstance(data, dict) and {"success", "failed"} & data.keys():  # an HA intent
        outcome: dict[str, Any] = {}
        if done := _names(data.get("success")):
            outcome["done"] = done
        if failed := _names(data.get("failed")):
            outcome["failed"] = failed
        return outcome
    if "result" in result:  # GetLiveContext, scripts
        return {"result": _short(result["result"])}
    return {"result": _short(result)}


def _names(targets: Any) -> list[str]:
    """Names of the entities in an intent response's success or failed list."""
    return [t.get("name") or t.get("id") for t in targets or [] if isinstance(t, dict)]


def _short(value: Any, limit: int = 200) -> str:
    """A tool result as text, cut to `limit` characters (GetLiveContext runs long)."""
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, default=str)
    return text if len(text) <= limit else text[:limit] + "…"


def _pipeline_name(hass: HomeAssistant, pipeline_id: str) -> str:
    """The pipeline's name, or its id if it was deleted since."""
    try:
        return async_get_pipeline(hass, pipeline_id).name
    except Exception:  # PipelineNotFound
        return pipeline_id


def _append(path: str, lines: list[str]) -> None:
    """Append lines to the log, after moving a full log to voice_log.1.jsonl."""
    if os.path.exists(path) and os.path.getsize(path) > MAX_BYTES:
        os.replace(path, path.removesuffix(".jsonl") + ".1.jsonl")
    with open(path, "a", encoding="utf-8") as log:
        log.writelines(line + "\n" for line in lines)

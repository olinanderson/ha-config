"""Vanlife Tracker — travel tracking, campsite logging, and route recording for van lifers."""

from __future__ import annotations

import logging
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Any

from homeassistant.components.http import HomeAssistantView
from homeassistant.components.recorder import get_instance
from homeassistant.components.recorder.history import get_significant_states
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.json import json_dumps
from aiohttp import web

from .const import DOMAIN, PLATFORMS, DB_FILE
from .coordinator import VanlifeCoordinator
from .database import VanlifeDatabase
from .services import async_register_services, async_unregister_services

_LOGGER = logging.getLogger(__name__)


class VanlifeGpsTrackView(HomeAssistantView):
    """REST endpoint: GET /api/vanlife_tracker/gps_track?start=<unix>&end=<unix>
    Returns JSON array of {ts, lat, lon} objects from local gps_track DB.
    Falls back to empty list when no data (frontend falls back to HA history).
    No auth required within HA network — same as other local panel APIs."""

    url = "/api/vanlife_tracker/gps_track"
    name = "api:vanlife_tracker:gps_track"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request) -> web.Response:
        try:
            start_ts = float(request.query.get("start", 0))
            end_ts = float(request.query.get("end", 0))
            max_points = int(request.query.get("max_points", 0))
            if end_ts <= 0 or end_ts <= start_ts:
                return web.Response(status=400, text="start and end unix timestamps required")

            # Find first loaded coordinator's DB
            domain_data = self._hass.data.get(DOMAIN, {})
            coordinator: VanlifeCoordinator | None = next(iter(domain_data.values()), None)
            if coordinator is None:
                return web.Response(body="[]", content_type="application/json")

            points = await coordinator.database.async_get_gps_track(start_ts, end_ts, max_points)
            return web.Response(body=json_dumps(points), content_type="application/json")
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("VanlifeGpsTrackView error: %s", err)
            return web.Response(status=500, text=str(err))

    async def post(self, request: web.Request) -> web.Response:
        """Seed gps_track from frontend HA-history fallback data.
        Accepts JSON array of {ts, lat, lon}. INSERT OR IGNORE so idempotent."""
        try:
            domain_data = self._hass.data.get(DOMAIN, {})
            coordinator: VanlifeCoordinator | None = next(iter(domain_data.values()), None)
            if coordinator is None:
                return web.Response(status=503, text="coordinator not ready")

            body = await request.json()
            if not isinstance(body, list) or len(body) == 0:
                return web.Response(status=400, text="expected non-empty JSON array")

            # Cap at 50k points per request to prevent abuse
            points = [
                {"ts": float(p["ts"]), "lat": float(p["lat"]), "lon": float(p["lon"])}
                for p in body[:50000]
                if "ts" in p and "lat" in p and "lon" in p
            ]
            if not points:
                return web.Response(status=400, text="no valid points")

            inserted = await coordinator.database.async_insert_gps_points(points, source="seed")
            _LOGGER.info("GPS track seeded with %d points (%d submitted)", inserted, len(points))
            return web.Response(
                body=json_dumps({"inserted": inserted}),
                content_type="application/json",
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("VanlifeGpsTrackView POST error: %s", err)
            return web.Response(status=500, text=str(err))


FUEL_ENTITY = "sensor.stable_fuel_level"


class VanlifeFuelBackfillView(HomeAssistantView):
    """POST /api/vanlife_tracker/backfill_fuel
    Backfills fuel_pct_arrive and fuel_pct_depart on all stops missing them,
    by looking up HA recorder history for sensor.stable_fuel_level."""

    url = "/api/vanlife_tracker/backfill_fuel"
    name = "api:vanlife_tracker:backfill_fuel"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def post(self, request: web.Request) -> web.Response:
        try:
            domain_data = self._hass.data.get(DOMAIN, {})
            coordinator: VanlifeCoordinator | None = next(iter(domain_data.values()), None)
            if coordinator is None:
                return web.Response(status=503, text="coordinator not ready")

            db = coordinator.database
            all_stops = await db.async_get_stops(limit=10000)
            needs_arrive = [s for s in all_stops if s.get("fuel_pct_arrive") is None and s.get("arrived_at")]
            needs_depart = [s for s in all_stops if s.get("fuel_pct_depart") is None and s.get("departed_at")]

            if not needs_arrive and not needs_depart:
                return web.Response(
                    body=json_dumps({"updated": 0, "message": "all stops already have fuel data"}),
                    content_type="application/json",
                )

            # Find time range we need history for
            all_times = []
            for s in needs_arrive:
                all_times.append(s["arrived_at"])
            for s in needs_depart:
                all_times.append(s["departed_at"])

            earliest = min(datetime.fromisoformat(t) for t in all_times)
            latest = max(datetime.fromisoformat(t) for t in all_times)
            start_dt = earliest - timedelta(hours=1)
            end_dt = latest + timedelta(hours=1)

            if start_dt.tzinfo is None:
                start_dt = start_dt.replace(tzinfo=timezone.utc)
            if end_dt.tzinfo is None:
                end_dt = end_dt.replace(tzinfo=timezone.utc)

            # Query recorder
            history = await get_instance(self._hass).async_add_executor_job(
                get_significant_states,
                self._hass,
                start_dt,
                end_dt,
                [FUEL_ENTITY],
                None,   # filters
                True,   # include_start_time_state
                False,  # significant_changes_only
            )

            fuel_states = history.get(FUEL_ENTITY, [])
            if not fuel_states:
                return web.Response(
                    body=json_dumps({"updated": 0, "message": "no fuel history found in recorder"}),
                    content_type="application/json",
                )

            # Build sorted (unix_ts, pct) list
            fuel_readings: list[tuple[float, float]] = []
            for state in fuel_states:
                try:
                    ts = state.last_changed.timestamp()
                    val = float(state.state)
                    if 0 <= val <= 100:
                        fuel_readings.append((ts, val))
                except (ValueError, TypeError, AttributeError):
                    continue

            fuel_readings.sort(key=lambda x: x[0])
            if not fuel_readings:
                return web.Response(
                    body=json_dumps({"updated": 0, "message": "no valid fuel readings"}),
                    content_type="application/json",
                )

            def find_closest(target_iso: str, max_delta_s: float = 7200) -> float | None:
                try:
                    target_ts = datetime.fromisoformat(target_iso).timestamp()
                except (ValueError, TypeError):
                    return None
                best_val = None
                best_delta = float("inf")
                for ts, val in fuel_readings:
                    delta = abs(ts - target_ts)
                    if delta < best_delta:
                        best_delta = delta
                        best_val = val
                return best_val if best_delta <= max_delta_s else None

            updated = 0
            for stop in needs_arrive:
                val = find_closest(stop["arrived_at"])
                if val is not None:
                    await db.async_update_stop(stop["id"], {"fuel_pct_arrive": val})
                    updated += 1
            for stop in needs_depart:
                val = find_closest(stop["departed_at"])
                if val is not None:
                    await db.async_update_stop(stop["id"], {"fuel_pct_depart": val})
                    updated += 1

            _LOGGER.info("Fuel backfill: %d updates (%d readings, %d stops)", updated, len(fuel_readings), len(all_stops))
            return web.Response(
                body=json_dumps({"updated": updated, "readings": len(fuel_readings), "stops": len(all_stops)}),
                content_type="application/json",
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("VanlifeFuelBackfillView error: %s", err, exc_info=True)
            return web.Response(status=500, text=str(err))


class VanlifeTripsView(HomeAssistantView):
    """REST endpoint: GET /api/vanlife_tracker/trips?start=<unix>&end=<unix>
    Returns pre-computed trips with GPS points and linked stop details."""

    url = "/api/vanlife_tracker/trips"
    name = "api:vanlife_tracker:trips"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request) -> web.Response:
        try:
            start_ts = float(request.query.get("start", 0))
            end_ts = float(request.query.get("end", 0))
            if end_ts <= 0 or end_ts <= start_ts:
                return web.Response(
                    status=400, text="start and end unix timestamps required"
                )

            domain_data = self._hass.data.get(DOMAIN, {})
            coordinator: VanlifeCoordinator | None = next(
                iter(domain_data.values()), None
            )
            if coordinator is None:
                return web.Response(body="[]", content_type="application/json")

            trips = await coordinator.database.async_get_trips(start_ts, end_ts)

            result = []
            for trip in trips:
                t_start = trip["start_ts"]
                t_end = trip["end_ts"] or time.time()

                gps_points = await coordinator.database.async_get_gps_track(
                    t_start, t_end, max_points=2000
                )

                from_stop = None
                to_stop = None
                if trip.get("from_stop_id"):
                    from_stop = await coordinator.database.async_get_stop(
                        trip["from_stop_id"]
                    )
                if trip.get("to_stop_id"):
                    to_stop = await coordinator.database.async_get_stop(
                        trip["to_stop_id"]
                    )

                result.append({
                    "id": trip["id"],
                    "start_ts": trip["start_ts"],
                    "end_ts": trip["end_ts"],
                    "from_stop_id": trip.get("from_stop_id"),
                    "to_stop_id": trip.get("to_stop_id"),
                    "from_stop": from_stop,
                    "to_stop": to_stop,
                    "distance_m": trip.get("distance_m", 0),
                    "duration_s": trip.get("duration_s", 0),
                    "gps_points": gps_points,
                })

            return web.Response(
                body=json_dumps(result), content_type="application/json"
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("VanlifeTripsView error: %s", err)
            return web.Response(status=500, text=str(err))


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up Vanlife Tracker (YAML not supported — config flow only)."""
    hass.data.setdefault(DOMAIN, {})
    hass.http.register_view(VanlifeGpsTrackView(hass))
    hass.http.register_view(VanlifeFuelBackfillView(hass))
    hass.http.register_view(VanlifeTripsView(hass))
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Vanlife Tracker from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Initialize the SQLite database
    db_path = hass.config.path(DB_FILE)
    database = VanlifeDatabase(db_path)
    await database.async_setup()

    # Create the coordinator
    coordinator = VanlifeCoordinator(
        hass=hass,
        config=dict(entry.data),
        database=database,
    )

    # Store coordinator for access by platforms and services
    hass.data[DOMAIN][entry.entry_id] = coordinator

    # Forward to sensor (and device_tracker if we add it later)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register services (idempotent — only registers once)
    await async_register_services(hass)

    # Start the coordinator (entity tracking, Traccar, auto-stop detection)
    try:
        await coordinator.async_start()
    except Exception as err:  # noqa: BLE001
        _LOGGER.error("Vanlife Tracker failed to start coordinator: %s", err, exc_info=True)

    # Listen for options updates
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    _LOGGER.info("Vanlife Tracker loaded successfully")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    coordinator: VanlifeCoordinator = hass.data[DOMAIN].pop(entry.entry_id, None)

    if coordinator:
        await coordinator.async_stop()
        await coordinator.database.async_close()

    # Unload platforms
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    # If no more entries, unregister services
    if not hass.data[DOMAIN]:
        await async_unregister_services(hass)

    return unloaded


async def _async_options_updated(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """Handle options update — reload the integration."""
    await hass.config_entries.async_reload(entry.entry_id)

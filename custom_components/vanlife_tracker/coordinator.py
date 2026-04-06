"""Core coordinator for Vanlife Tracker — manages stops, GPS, and Traccar."""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Any

from homeassistant.core import HomeAssistant, callback, Event, State
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers import aiohttp_client

from .const import (
    DOMAIN,
    CONF_GPS_ENTITY,
    CONF_VEHICLE_MOVING_ENTITY,
    CONF_WEATHER_ENTITY,
    CONF_STOP_DELAY_MINUTES,
    CONF_TRACCAR_ENABLED,
    CONF_TRACCAR_URL,
    CONF_TRACCAR_DEVICE_ID,
    CONF_GEOCODING_ENABLED,
    CONF_GPS_PUBLISH_INTERVAL,
    DEFAULT_STOP_DELAY_MINUTES,
    DEFAULT_GPS_PUBLISH_INTERVAL,
    EVENT_STOP_CREATED,
    EVENT_STOP_DEPARTED,
    EVENT_STOP_UPDATED,
)
from .database import VanlifeDatabase
from .geocoding import async_reverse_geocode
from .traccar_client import TraccarClient

_LOGGER = logging.getLogger(__name__)


class VanlifeCoordinator:
    """Central coordinator that ties together GPS tracking, stop detection, and Traccar."""

    def __init__(
        self,
        hass: HomeAssistant,
        config: dict[str, Any],
        database: VanlifeDatabase,
    ) -> None:
        """Initialize the coordinator."""
        self.hass = hass
        self.config = config
        self.database = database

        # Traccar client (optional)
        self._traccar: TraccarClient | None = None
        if config.get(CONF_TRACCAR_ENABLED):
            self._traccar = TraccarClient(
                base_url=config.get(CONF_TRACCAR_URL, "http://localhost:8082"),
                device_id=config.get(CONF_TRACCAR_DEVICE_ID, "vanlife"),
                session=aiohttp_client.async_get_clientsession(hass),
            )

        # State
        self._stop_timer_handle: asyncio.TimerHandle | None = None
        self._gps_publish_unsub: Any = None
        self._moving_unsub: Any = None
        self._is_moving: bool = False
        self._last_gps_push: float = 0
        self._current_stop: dict[str, Any] | None = None

        # Config
        self._gps_entity = config.get(CONF_GPS_ENTITY, "")
        self._moving_entity = config.get(CONF_VEHICLE_MOVING_ENTITY, "")
        self._weather_entity = config.get(CONF_WEATHER_ENTITY, "")
        self._stop_delay = config.get(
            CONF_STOP_DELAY_MINUTES, DEFAULT_STOP_DELAY_MINUTES
        )
        self._gps_interval = config.get(
            CONF_GPS_PUBLISH_INTERVAL, DEFAULT_GPS_PUBLISH_INTERVAL
        )
        self._geocoding_enabled = config.get(CONF_GEOCODING_ENABLED, True)

    async def async_start(self) -> None:
        """Start tracking — subscribe to entity changes."""
        # Load current stop from DB
        self._current_stop = await self.database.async_get_current_stop()

        # Watch the vehicle_moving entity for state changes
        if self._moving_entity:
            self._moving_unsub = async_track_state_change_event(
                self.hass, [self._moving_entity], self._on_moving_state_change
            )
            # Set initial state
            state = self.hass.states.get(self._moving_entity)
            if state and state.state == "on":
                self._is_moving = True
                self._start_gps_publishing()

        _LOGGER.info(
            "Vanlife Tracker started (GPS: %s, Moving: %s, Traccar: %s)",
            self._gps_entity,
            self._moving_entity,
            "enabled" if self._traccar else "disabled",
        )

    async def async_stop(self) -> None:
        """Stop tracking and clean up."""
        self._cancel_stop_timer()
        self._stop_gps_publishing()
        if self._moving_unsub:
            self._moving_unsub()
        if self._traccar:
            await self._traccar.async_close()

    # ─── Movement detection ───────────────────────────────────

    @callback
    def _on_moving_state_change(self, event: Event) -> None:
        """Handle vehicle moving state changes."""
        new_state: State | None = event.data.get("new_state")
        old_state: State | None = event.data.get("old_state")
        if new_state is None:
            return

        was_moving = self._is_moving
        self._is_moving = new_state.state == "on"

        if self._is_moving and not was_moving:
            # Vehicle started moving
            _LOGGER.debug("Vehicle started moving")
            self._cancel_stop_timer()
            self._start_gps_publishing()
            # Depart from current stop
            self.hass.async_create_task(self._async_handle_departure())

        elif not self._is_moving and was_moving:
            # Vehicle stopped — start the stop detection timer
            _LOGGER.debug(
                "Vehicle stopped — starting %d min timer for auto-stop",
                self._stop_delay,
            )
            self._stop_gps_publishing()
            self._schedule_stop_detection()

    def _schedule_stop_detection(self) -> None:
        """Schedule auto-stop creation after the configured delay."""
        self._cancel_stop_timer()
        self._stop_timer_handle = self.hass.loop.call_later(
            self._stop_delay * 60,
            lambda: self.hass.async_create_task(self._async_create_auto_stop()),
        )

    def _cancel_stop_timer(self) -> None:
        """Cancel pending stop detection timer."""
        if self._stop_timer_handle:
            self._stop_timer_handle.cancel()
            self._stop_timer_handle = None

    # ─── GPS publishing to Traccar ────────────────────────────

    def _start_gps_publishing(self) -> None:
        """Start periodic GPS pushing to Traccar while moving."""
        if not self._traccar or not self._gps_entity:
            return
        if self._gps_publish_unsub:
            return  # Already running

        self._gps_publish_unsub = async_track_time_interval(
            self.hass,
            self._async_push_gps,
            timedelta(seconds=self._gps_interval),
        )
        _LOGGER.debug("Started GPS publishing every %ds", self._gps_interval)

    def _stop_gps_publishing(self) -> None:
        """Stop periodic GPS pushing."""
        if self._gps_publish_unsub:
            self._gps_publish_unsub()
            self._gps_publish_unsub = None
            _LOGGER.debug("Stopped GPS publishing")

    async def _async_push_gps(self, _now: datetime | None = None) -> None:
        """Push current GPS position to Traccar."""
        if not self._traccar or not self._gps_entity:
            return

        state = self.hass.states.get(self._gps_entity)
        if state is None:
            return

        lat = state.attributes.get("latitude")
        lon = state.attributes.get("longitude")
        if lat is None or lon is None:
            return

        altitude = state.attributes.get("altitude", 0) or state.attributes.get("elevation", 0) or 0
        accuracy = state.attributes.get("gps_accuracy", 0) or 0

        # Get speed from WiCAN if available
        speed_state = self.hass.states.get("sensor.wican_speed")
        speed = float(speed_state.state) if speed_state and speed_state.state not in ("unknown", "unavailable") else 0

        await self._traccar.async_send_position(
            lat=float(lat),
            lon=float(lon),
            altitude=float(altitude),
            speed=speed,
            accuracy=float(accuracy),
        )

    # ─── Stop management ──────────────────────────────────────

    async def _async_create_auto_stop(self) -> None:
        """Auto-create a stop when the van has been stationary long enough."""
        # Don't create if vehicle started moving again
        if self._is_moving:
            return

        # Don't create if there's already an active (undeparted) stop
        if self._current_stop and self._current_stop.get("departed_at") is None:
            _LOGGER.debug("Already at a stop, skipping auto-creation")
            return

        gps = self._get_current_gps()
        if not gps:
            _LOGGER.warning("Cannot create auto-stop: no GPS data")
            return

        # Build stop data
        stop_data: dict[str, Any] = {
            "lat": gps["lat"],
            "lon": gps["lon"],
            "elevation": gps.get("elevation", 0),
            "auto_detected": True,
            "arrived_at": (
                datetime.now() - timedelta(minutes=self._stop_delay)
            ).isoformat(),
        }

        # Reverse geocode for nearest town
        if self._geocoding_enabled:
            try:
                session = aiohttp_client.async_get_clientsession(self.hass)
                geo = await async_reverse_geocode(gps["lat"], gps["lon"], session)
                stop_data["nearest_town"] = geo.get("short_name", "")
                stop_data["name"] = geo.get("short_name", "")
            except Exception:  # noqa: BLE001
                _LOGGER.debug("Geocoding failed, using default name")

        # Check if this location matches a named place — takes priority over geocode
        named_place = await self.database.async_find_named_place_at(
            gps["lat"], gps["lon"]
        )
        if named_place:
            stop_data["name"] = named_place["name"]
            stop_data["named_place_id"] = named_place["id"]
            _LOGGER.debug("Matched named place: %s", named_place["name"])

        # Get weather if configured
        if self._weather_entity:
            weather = self.hass.states.get(self._weather_entity)
            if weather:
                stop_data["weather"] = weather.state or ""
                forecasts = weather.attributes.get("forecast", [])
                if forecasts:
                    today = forecasts[0] if forecasts else {}
                    stop_data["temp_high"] = str(today.get("temperature", ""))
                    stop_data["temp_low"] = str(today.get("templow", ""))

        # Create the stop
        self._current_stop = await self.database.async_create_stop(stop_data)

        # Fire HA event
        self.hass.bus.async_fire(EVENT_STOP_CREATED, self._current_stop)
        _LOGGER.info(
            "Auto-detected stop: %s at %.4f, %.4f",
            self._current_stop.get("name"),
            gps["lat"],
            gps["lon"],
        )

    async def _async_handle_departure(self) -> None:
        """Handle vehicle departure from current stop."""
        if self._current_stop and self._current_stop.get("departed_at") is None:
            departed = await self.database.async_depart_current_stop()
            if departed:
                self.hass.bus.async_fire(EVENT_STOP_DEPARTED, departed)
                _LOGGER.info("Departed from: %s", departed.get("name"))
            self._current_stop = None

    def _get_current_gps(self) -> dict[str, float] | None:
        """Get current GPS coordinates from the configured entity."""
        if not self._gps_entity:
            return None

        state = self.hass.states.get(self._gps_entity)
        if state is None:
            return None

        lat = state.attributes.get("latitude")
        lon = state.attributes.get("longitude")
        if lat is None or lon is None:
            return None

        return {
            "lat": float(lat),
            "lon": float(lon),
            "elevation": float(
                state.attributes.get("altitude", 0)
                or state.attributes.get("elevation", 0)
                or 0
            ),
        }

    # ─── Public API (called by services & sensors) ────────────

    async def async_create_stop(self, stop_data: dict[str, Any]) -> dict[str, Any]:
        """Manually create a stop (from service call)."""
        # If no lat/lon provided, use current GPS
        if not stop_data.get("lat") or not stop_data.get("lon"):
            gps = self._get_current_gps()
            if gps:
                stop_data.setdefault("lat", gps["lat"])
                stop_data.setdefault("lon", gps["lon"])
                stop_data.setdefault("elevation", gps.get("elevation", 0))

        # Reverse geocode if no name and geocoding is enabled
        if not stop_data.get("nearest_town") and self._geocoding_enabled:
            lat = stop_data.get("lat", 0)
            lon = stop_data.get("lon", 0)
            if lat and lon:
                try:
                    session = aiohttp_client.async_get_clientsession(self.hass)
                    geo = await async_reverse_geocode(lat, lon, session)
                    stop_data.setdefault("nearest_town", geo.get("short_name", ""))
                    if not stop_data.get("name"):
                        stop_data["name"] = geo.get("short_name", "")
                except Exception:  # noqa: BLE001
                    pass

        # Named place check — overrides geocode name if within radius
        lat = stop_data.get("lat", 0)
        lon = stop_data.get("lon", 0)
        if lat and lon:
            named_place = await self.database.async_find_named_place_at(lat, lon)
            if named_place and not stop_data.get("named_place_id"):
                stop_data["name"] = named_place["name"]
                stop_data["named_place_id"] = named_place["id"]

        # Get weather if available
        if self._weather_entity and not stop_data.get("weather"):
            weather = self.hass.states.get(self._weather_entity)
            if weather:
                stop_data.setdefault("weather", weather.state or "")

        stop = await self.database.async_create_stop(stop_data)
        self._current_stop = stop
        self.hass.bus.async_fire(EVENT_STOP_CREATED, stop)
        return stop

    async def async_update_stop(
        self, stop_id: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Update an existing stop."""
        result = await self.database.async_update_stop(stop_id, updates)
        if result:
            self.hass.bus.async_fire(EVENT_STOP_UPDATED, result)
            if self._current_stop and self._current_stop["id"] == stop_id:
                self._current_stop = result
        return result

    async def async_delete_stop(self, stop_id: str) -> bool:
        """Delete a stop."""
        result = await self.database.async_delete_stop(stop_id)
        if result and self._current_stop and self._current_stop["id"] == stop_id:
            self._current_stop = None
        return result

    async def async_depart_current_stop(self) -> dict[str, Any] | None:
        """Manually depart from the current stop."""
        return await self._async_handle_departure()

    async def async_get_stops(self, **kwargs: Any) -> list[dict[str, Any]]:
        """Get stops with optional filtering."""
        return await self.database.async_get_stops(**kwargs)

    async def async_get_stats(self) -> dict[str, Any]:
        """Get travel statistics."""
        return await self.database.async_get_stats()

    async def async_export_gpx(self) -> str:
        """Export all stops as GPX XML."""
        stops = await self.database.async_get_all_stops_for_export()
        return _build_gpx(stops)

    async def async_get_named_places(self) -> list[dict]:
        """Get all named places."""
        return await self.database.async_get_named_places()

    async def async_create_named_place(self, data: dict) -> dict:
        """Create a named place."""
        return await self.database.async_create_named_place(data)

    async def async_update_named_place(self, place_id: str, updates: dict) -> dict | None:
        """Update a named place."""
        return await self.database.async_update_named_place(place_id, updates)

    async def async_delete_named_place(self, place_id: str) -> bool:
        """Delete a named place."""
        return await self.database.async_delete_named_place(place_id)

    async def async_backfill_stops(
        self,
        start_time: datetime | None = None,
        end_time: datetime | None = None,
        min_stop_minutes: int | None = None,
        stationary_radius_m: float = 100.0,
    ) -> dict[str, Any]:
        """Analyze historical GPS data and create stops for stationary periods."""
        from homeassistant.components.recorder import get_instance
        from homeassistant.components.recorder.history import get_significant_states

        if start_time is None:
            start_time = datetime.now() - timedelta(days=30)
        if end_time is None:
            end_time = datetime.now()
        if min_stop_minutes is None:
            min_stop_minutes = self._stop_delay
        min_stop_seconds = min_stop_minutes * 60

        if not self._gps_entity:
            return {"created": 0, "skipped": 0, "message": "No GPS entity configured"}

        # Fetch GPS history from recorder
        try:
            instance = get_instance(self.hass)
            states_dict = await instance.async_add_executor_job(
                get_significant_states,
                self.hass,
                start_time,
                end_time,
                [self._gps_entity],
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.error("Backfill: failed to fetch history: %s", err)
            return {"created": 0, "skipped": 0, "message": f"History fetch failed: {err}"}

        gps_states = states_dict.get(self._gps_entity, [])
        _LOGGER.debug("Backfill: got %d GPS states", len(gps_states))

        # Extract valid lat/lon points
        points: list[dict[str, Any]] = []
        for state in gps_states:
            lat = state.attributes.get("latitude")
            lon = state.attributes.get("longitude")
            if lat is None or lon is None:
                continue
            try:
                points.append({
                    "lat": float(lat),
                    "lon": float(lon),
                    "ts": state.last_changed.timestamp(),
                    "dt": state.last_changed.replace(tzinfo=None) if state.last_changed.tzinfo else state.last_changed,
                })
            except (ValueError, TypeError):
                continue

        if len(points) < 2:
            return {"created": 0, "skipped": 0, "message": "Insufficient GPS data in range"}

        points.sort(key=lambda p: p["ts"])

        # Load existing stops to avoid duplicates
        existing_stops = await self.database.async_get_stops(limit=500)

        # ── Stationary period detection ──────────────────────
        # Walk points; anchor = reference position for current stationary period.
        # When van moves > stationary_radius_m from anchor, close the period.
        anchor_lat = points[0]["lat"]
        anchor_lon = points[0]["lon"]
        period_start: datetime = points[0]["dt"]
        period_end: datetime = points[0]["dt"]
        stops_created = 0
        stops_skipped = 0

        for p in points[1:]:
            dist = _haversine_m(p["lat"], p["lon"], anchor_lat, anchor_lon)
            if dist <= stationary_radius_m:
                # Still within the stationary zone — extend the period
                period_end = p["dt"]
            else:
                # Van has moved — evaluate the completed period
                duration_s = (period_end - period_start).total_seconds()
                if duration_s >= min_stop_seconds:
                    created = await self._backfill_create_stop(
                        anchor_lat, anchor_lon, period_start, period_end,
                        existing_stops, end_time,
                    )
                    if created:
                        stops_created += 1
                        existing_stops.append(created)
                    else:
                        stops_skipped += 1
                # Reset anchor to new position
                anchor_lat = p["lat"]
                anchor_lon = p["lon"]
                period_start = p["dt"]
                period_end = p["dt"]

        # Evaluate the final period
        duration_s = (period_end - period_start).total_seconds()
        if duration_s >= min_stop_seconds:
            created = await self._backfill_create_stop(
                anchor_lat, anchor_lon, period_start, period_end,
                existing_stops, end_time,
            )
            if created:
                stops_created += 1
            else:
                stops_skipped += 1

        msg = f"Backfill complete: {stops_created} stops created, {stops_skipped} skipped"
        _LOGGER.info(msg)
        self.hass.bus.async_fire(f"{DOMAIN}_backfill_complete", {
            "created": stops_created, "skipped": stops_skipped,
        })
        return {"created": stops_created, "skipped": stops_skipped, "message": msg}

    async def _backfill_create_stop(
        self,
        lat: float,
        lon: float,
        arrived_at: datetime,
        departed_at: datetime,
        existing_stops: list[dict[str, Any]],
        window_end: datetime,
    ) -> dict[str, Any] | None:
        """Create a stop from backfill if no overlapping existing stop is nearby."""
        from datetime import timezone
        # Normalise datetimes to naive UTC for comparison
        def _naive(dt: datetime) -> datetime:
            return dt.replace(tzinfo=None) if dt.tzinfo else dt

        arr = _naive(arrived_at)
        dep = _naive(departed_at)

        for existing in existing_stops:
            d = _haversine_m(lat, lon, existing["lat"], existing["lon"])
            if d >= 200:
                continue
            ex_arr_str = existing.get("arrived_at")
            if not ex_arr_str:
                continue
            ex_arr = _naive(datetime.fromisoformat(ex_arr_str))
            ex_dep_str = existing.get("departed_at")
            ex_dep = _naive(datetime.fromisoformat(ex_dep_str)) if ex_dep_str else _naive(datetime.now())
            # Overlapping time window at nearby location = duplicate
            if arr <= ex_dep and dep >= ex_arr:
                return None

        # Determine if this is the active (still-parked) stop
        w_end = _naive(window_end)
        is_active = dep >= w_end - timedelta(minutes=self._stop_delay * 2)

        stop_data: dict[str, Any] = {
            "lat": lat,
            "lon": lon,
            "arrived_at": arrived_at.isoformat(),
            "auto_detected": True,
        }
        if not is_active:
            stop_data["departed_at"] = departed_at.isoformat()

        # Geocode
        if self._geocoding_enabled:
            try:
                session = aiohttp_client.async_get_clientsession(self.hass)
                geo = await async_reverse_geocode(lat, lon, session)
                stop_data["nearest_town"] = geo.get("short_name", "")
                stop_data["name"] = geo.get("short_name", "")
            except Exception:  # noqa: BLE001
                pass

        # Named place check
        named_place = await self.database.async_find_named_place_at(lat, lon)
        if named_place:
            stop_data["name"] = named_place["name"]

        stop = await self.database.async_create_stop(stop_data)
        self.hass.bus.async_fire(EVENT_STOP_CREATED, stop)
        return stop

    @property
    def current_stop(self) -> dict[str, Any] | None:
        """Return the current (undeparted) stop."""
        return self._current_stop

    @property
    def is_moving(self) -> bool:
        """Return whether the vehicle is currently moving."""
        return self._is_moving


def _build_gpx(stops: list[dict[str, Any]]) -> str:
    """Build a GPX XML string from stops."""
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx version="1.1" creator="VanlifeTracker"',
        '     xmlns="http://www.topografix.com/GPX/1/1">',
        "  <metadata>",
        "    <name>Vanlife Tracker Stops</name>",
        f"    <time>{datetime.now().isoformat()}</time>",
        "  </metadata>",
    ]

    for stop in stops:
        lines.append(
            f'  <wpt lat="{stop["lat"]}" lon="{stop["lon"]}">'
        )
        if stop.get("elevation"):
            lines.append(f"    <ele>{stop['elevation']}</ele>")
        if stop.get("arrived_at"):
            lines.append(f"    <time>{stop['arrived_at']}</time>")
        lines.append(f"    <name>{_xml_escape(stop.get('name', ''))}</name>")
        desc_parts = []
        if stop.get("notes"):
            desc_parts.append(stop["notes"])
        if stop.get("nearest_town"):
            desc_parts.append(f"Near: {stop['nearest_town']}")
        if stop.get("rating"):
            desc_parts.append(f"Rating: {'★' * stop['rating']}")
        if stop.get("category"):
            desc_parts.append(f"Category: {stop['category']}")
        if desc_parts:
            lines.append(
                f"    <desc>{_xml_escape(chr(10).join(desc_parts))}</desc>"
            )
        lines.append("  </wpt>")

    lines.append("</gpx>")
    return "\n".join(lines)


def _xml_escape(text: str) -> str:
    """Escape XML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )

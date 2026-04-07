"""Core coordinator for Vanlife Tracker — manages stops, GPS, and Traccar."""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timedelta, timezone
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
    EVENT_TRIP_CREATED,
    EVENT_TRIP_UPDATED,
)
from .database import VanlifeDatabase, _haversine_m
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
        self._gps_bg_unsub: Any = None  # always-on background GPS recorder
        self._moving_unsub: Any = None
        self._is_moving: bool = False
        self._last_gps_push: float = 0
        self._current_stop: dict[str, Any] | None = None
        self._current_trip_id: str | None = None

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

        # Load current trip from DB (in case HA restarted mid-drive)
        current_trip = await self.database.async_get_current_trip()
        if current_trip:
            self._current_trip_id = current_trip["id"]

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
                # If moving but no active trip, create one
                if not self._current_trip_id:
                    await self._async_start_trip()

        _LOGGER.info(
            "Vanlife Tracker started (GPS: %s, Moving: %s, Traccar: %s)",
            self._gps_entity,
            self._moving_entity,
            "enabled" if self._traccar else "disabled",
        )

        # Always-on background GPS recording (1 point/60s) so backfill has
        # data even when WiCAN is offline and vehicle_is_moving never fires.
        if self._gps_entity:
            self._gps_bg_unsub = async_track_time_interval(
                self.hass,
                self._async_record_gps_background,
                timedelta(seconds=60),
            )
            _LOGGER.debug("Started background GPS recording every 60s")

    async def async_stop(self) -> None:
        """Stop tracking and clean up."""
        self._cancel_stop_timer()
        self._stop_gps_publishing()
        if self._gps_bg_unsub:
            self._gps_bg_unsub()
            self._gps_bg_unsub = None
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
            # Depart from current stop and start a new trip
            self.hass.async_create_task(self._async_handle_departure())
            self.hass.async_create_task(self._async_start_trip())

        elif not self._is_moving and was_moving:
            # Vehicle stopped — end current trip and start the stop detection timer
            _LOGGER.debug(
                "Vehicle stopped — starting %d min timer for auto-stop",
                self._stop_delay,
            )
            self._stop_gps_publishing()
            self.hass.async_create_task(self._async_end_trip())
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
        """Push current GPS position to Traccar and record in local gps_track."""
        if not self._gps_entity:
            return

        state = self.hass.states.get(self._gps_entity)
        if state is None:
            return

        lat = state.attributes.get("latitude")
        lon = state.attributes.get("longitude")
        if lat is None or lon is None:
            return

        ts = state.last_changed.timestamp()
        await self.database.async_insert_gps_points(
            [{"ts": ts, "lat": float(lat), "lon": float(lon)}], source="live"
        )

        if not self._traccar:
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

    async def _async_record_gps_background(self, _now: datetime | None = None) -> None:
        """Record GPS to local gps_track at a slow cadence (always-on).

        Ensures gps_track has continuous data for backfill even when WiCAN is
        offline and the high-frequency publisher is not running.  Skips if
        high-frequency publishing is already active (to avoid duplicates).
        """
        if self._gps_publish_unsub:
            return  # high-frequency publisher is active, no need to double-record
        if not self._gps_entity:
            return
        state = self.hass.states.get(self._gps_entity)
        if state is None:
            return
        lat = state.attributes.get("latitude")
        lon = state.attributes.get("longitude")
        if lat is None or lon is None:
            return
        ts = state.last_changed.timestamp()
        await self.database.async_insert_gps_points(
            [{"ts": ts, "lat": float(lat), "lon": float(lon)}], source="bg"
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

        # Check if an existing stop is nearby — reuse it instead of creating
        # a duplicate.  Prefer manually-named stops over auto-detected ones.
        STOP_MATCH_M = 200
        existing_stops = await self.database.async_get_stops(limit=10000)
        best_stop: dict[str, Any] | None = None
        best_dist = float("inf")
        best_manual = False
        for es in existing_stops:
            d = _haversine_m(gps["lat"], gps["lon"], es["lat"], es["lon"])
            if d >= STOP_MATCH_M:
                continue
            es_manual = not es.get("auto_detected", 0)
            if es_manual and not best_manual:
                best_stop, best_dist, best_manual = es, d, True
            elif es_manual == best_manual and d < best_dist:
                best_stop, best_dist, best_manual = es, d, es_manual

        arrived_at = (
            datetime.now() - timedelta(minutes=self._stop_delay)
        ).isoformat()

        if best_stop is not None:
            # Reuse existing stop — update arrived_at, clear departed_at
            await self.database.async_update_stop(
                best_stop["id"],
                {"arrived_at": arrived_at, "departed_at": None},
            )
            best_stop["arrived_at"] = arrived_at
            best_stop["departed_at"] = None
            self._current_stop = best_stop
        else:
            # Build new stop data
            stop_data: dict[str, Any] = {
                "lat": gps["lat"],
                "lon": gps["lon"],
                "elevation": gps.get("elevation", 0),
                "auto_detected": True,
                "arrived_at": arrived_at,
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

            # Check if this location matches a named place
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

            # Record fuel level on arrival
            fuel_state = self.hass.states.get("sensor.stable_fuel_level")
            if fuel_state and fuel_state.state not in ("unknown", "unavailable", ""):
                try:
                    stop_data["fuel_pct_arrive"] = float(fuel_state.state)
                except (ValueError, TypeError):
                    pass

            self._current_stop = await self.database.async_create_stop(stop_data)

        # Link the most recent ended trip to this stop
        linked = await self.database.async_link_latest_trip_to_stop(
            self._current_stop["id"]
        )
        if linked:
            _LOGGER.debug(
                "Linked trip to auto-stop %s", self._current_stop["id"]
            )

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
            # Record fuel level at departure
            fuel_updates: dict[str, Any] = {}
            fuel_state = self.hass.states.get("sensor.stable_fuel_level")
            if fuel_state and fuel_state.state not in ("unknown", "unavailable", ""):
                try:
                    fuel_updates["fuel_pct_depart"] = float(fuel_state.state)
                except (ValueError, TypeError):
                    pass
            if fuel_updates:
                await self.database.async_update_stop(self._current_stop["id"], fuel_updates)
            departed = await self.database.async_depart_current_stop()
            if departed:
                self.hass.bus.async_fire(EVENT_STOP_DEPARTED, departed)
                _LOGGER.info("Departed from: %s", departed.get("name"))
            self._current_stop = None

    async def _async_start_trip(self) -> None:
        """Create a new trip when vehicle starts moving."""
        from_stop_id = self._current_stop["id"] if self._current_stop else None
        trip = await self.database.async_create_trip({
            "start_ts": time.time(),
            "from_stop_id": from_stop_id,
        })
        self._current_trip_id = trip["id"]
        self.hass.bus.async_fire(EVENT_TRIP_CREATED, trip)
        _LOGGER.info("Started trip %s (from stop: %s)", trip["id"], from_stop_id)

    async def _async_end_trip(self) -> None:
        """End the current trip when vehicle stops."""
        if not self._current_trip_id:
            return
        now = time.time()
        trip = await self.database.async_get_trip(self._current_trip_id)
        if trip:
            duration_s = now - trip["start_ts"]
            # Compute haversine distance from GPS points
            points = await self.database.async_get_gps_track(trip["start_ts"], now)
            dist = 0.0
            for i in range(1, len(points)):
                dist += _haversine_m(
                    points[i - 1]["lat"], points[i - 1]["lon"],
                    points[i]["lat"], points[i]["lon"],
                )
            await self.database.async_update_trip(self._current_trip_id, {
                "end_ts": now,
                "duration_s": duration_s,
                "distance_m": dist,
            })
            self.hass.bus.async_fire(EVENT_TRIP_UPDATED, {
                "id": self._current_trip_id,
                "end_ts": now,
                "duration_s": duration_s,
                "distance_m": dist,
            })
            _LOGGER.info(
                "Ended trip %s (%.0fs, %.0fm)", self._current_trip_id, duration_s, dist
            )
        self._current_trip_id = None

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
            start_time = datetime.now(timezone.utc) - timedelta(days=30)
        if end_time is None:
            end_time = datetime.now(timezone.utc)
        # Ensure timezone-aware for recorder query
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
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

        # Persist all fetched points into gps_track so future page loads skip HA history
        await self.database.async_insert_gps_points(points, source="backfill")
        _LOGGER.debug("Backfill: stored %d GPS points in gps_track", len(points))

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

    # ─── Trip backfill ────────────────────────────────────────

    async def async_backfill_trips(
        self,
        start_ts: float,
        end_ts: float,
        clear_existing: bool = True,
    ) -> dict[str, Any]:
        """Process gps_track data into computed trips and auto-detected stops.

        Uses the same chain-based algorithm as the panel: thin at 25 m / 10 min,
        then cluster stationary points at 50 m / 10 min to detect stops.
        Move segments between stops become trips.
        """
        import math

        points = await self.database.async_get_gps_track(start_ts, end_ts)
        _LOGGER.info(
            "Backfill trips: loaded %d GPS points (%.0f–%.0f)",
            len(points), start_ts, end_ts,
        )
        if len(points) < 2:
            return {
                "trips_created": 0,
                "stops_created": 0,
                "message": "Insufficient GPS data",
            }

        if clear_existing:
            deleted = await self.database.async_delete_trips_in_range(start_ts, end_ts)
            _LOGGER.info("Backfill trips: cleared %d existing trips", deleted)

        # ── Step 1: distance thinning (25 m, preserve 10 min gaps) ──
        M_PER_DEG = 111320
        MIN_MOVE_M = 25
        MIN_STOP_GAP_S = 10 * 60  # 10 min
        thresh_deg2 = (MIN_MOVE_M / M_PER_DEG) ** 2
        mid_lat = points[len(points) // 2]["lat"]
        cos_lat = math.cos(math.radians(mid_lat))

        thinned = [points[0]]
        for k in range(1, len(points)):
            prev = thinned[-1]
            p = points[k]
            d_lat = p["lat"] - prev["lat"]
            d_lon = (p["lon"] - prev["lon"]) * cos_lat
            time_delta = p["ts"] - prev["ts"]
            if d_lat ** 2 + d_lon ** 2 >= thresh_deg2 or time_delta >= MIN_STOP_GAP_S:
                thinned.append(p)
        if thinned[-1] is not points[-1]:
            thinned.append(points[-1])
        _LOGGER.info("Backfill trips: thinned to %d points", len(thinned))

        # ── Step 1b: inject synthetic stop points at large time gaps ──
        # After dedup, parked periods become gaps (no GPS data). If two
        # consecutive points are >20 min apart and close together (<500m),
        # that gap is a stop the dedup hid. Insert a synthetic stop pair
        # so the chain-based detector can find it.
        MAX_GAP_S = 20 * 60  # 20 minutes
        GAP_NEAR_M = 500
        gap_near_deg2 = (GAP_NEAR_M / M_PER_DEG) ** 2
        injected = [thinned[0]]
        gaps_filled = 0
        for k in range(1, len(thinned)):
            prev = injected[-1]
            cur = thinned[k]
            dt = cur["ts"] - prev["ts"]
            if dt > MAX_GAP_S:
                d_lat = cur["lat"] - prev["lat"]
                d_lon = (cur["lon"] - prev["lon"]) * cos_lat
                dist2 = d_lat ** 2 + d_lon ** 2
                if dist2 <= gap_near_deg2:
                    # Same-ish location across a long gap → synthetic stop
                    # Add a point 1 second after prev and 1 second before cur
                    mid_lat = (prev["lat"] + cur["lat"]) / 2
                    mid_lon = (prev["lon"] + cur["lon"]) / 2
                    injected.append({"ts": prev["ts"] + 1, "lat": mid_lat, "lon": mid_lon})
                    injected.append({"ts": cur["ts"] - 1, "lat": mid_lat, "lon": mid_lon})
                    gaps_filled += 1
            injected.append(cur)
        if gaps_filled:
            thinned = injected
            _LOGGER.info("Backfill trips: filled %d time gaps → %d points", gaps_filled, len(thinned))

        # ── Step 2: chain-based stop detection (50 m / 10 min) ──
        STOP_RADIUS_M = 50
        MIN_STOP_S = 10 * 60
        stop_rad_deg2 = (STOP_RADIUS_M / M_PER_DEG) ** 2

        segments: list[dict[str, Any]] = []
        i = 0
        while i < len(thinned):
            sum_lat = thinned[i]["lat"]
            sum_lon = thinned[i]["lon"]
            count = 1
            cluster_start = thinned[i]["ts"]
            j = i + 1
            while j < len(thinned):
                prev_pt = thinned[j - 1]
                d_lat = thinned[j]["lat"] - prev_pt["lat"]
                d_lon = (thinned[j]["lon"] - prev_pt["lon"]) * cos_lat
                if d_lat ** 2 + d_lon ** 2 <= stop_rad_deg2:
                    sum_lat += thinned[j]["lat"]
                    sum_lon += thinned[j]["lon"]
                    count += 1
                    j += 1
                else:
                    break

            cluster_dur_s = thinned[j - 1]["ts"] - cluster_start
            if cluster_dur_s >= MIN_STOP_S:
                centroid = {
                    "lat": sum_lat / count,
                    "lon": sum_lon / count,
                    "ts": cluster_start,
                    "end_ts": thinned[j - 1]["ts"],
                }
                # Append centroid to preceding move segment for routing continuity
                if segments and segments[-1]["type"] == "move":
                    segments[-1]["pts"].append(centroid)
                segments.append({
                    "type": "stop",
                    "centroid": centroid,
                    "start_ts": cluster_start,
                    "end_ts": thinned[j - 1]["ts"],
                    "stop_id": None,
                })
                i = j
            else:
                if not segments or segments[-1]["type"] == "stop":
                    new_seg: dict[str, Any] = {"type": "move", "pts": []}
                    if segments and segments[-1]["type"] == "stop":
                        # Use end_ts (departure) not ts (arrival) for the
                        # first point of the trip after this stop.
                        dep_centroid = dict(segments[-1]["centroid"])
                        dep_centroid["ts"] = segments[-1]["end_ts"]
                        new_seg["pts"].append(dep_centroid)
                    segments.append(new_seg)
                segments[-1]["pts"].append(thinned[i])
                i += 1

        # ── Step 3: match or create stops ──
        # Match by distance only (no time overlap) to reuse the same stop
        # for repeat visits.  Prefer manually-named stops (auto_detected=0)
        # over auto-detected ones so user labels are preserved.
        STOP_MATCH_M = 200
        existing_stops = await self.database.async_get_stops(limit=10000)
        stops_created = 0

        for seg in segments:
            if seg["type"] != "stop":
                continue
            c = seg["centroid"]
            best_stop: dict[str, Any] | None = None
            best_dist = float("inf")
            best_manual = False
            for es in existing_stops:
                d = _haversine_m(c["lat"], c["lon"], es["lat"], es["lon"])
                if d >= STOP_MATCH_M:
                    continue
                es_manual = not es.get("auto_detected", 0)
                # Prefer manual stops; among same type prefer closest
                if es_manual and not best_manual:
                    best_stop, best_dist, best_manual = es, d, True
                elif es_manual == best_manual and d < best_dist:
                    best_stop, best_dist, best_manual = es, d, es_manual
                # Don't let an auto-detected stop override a manual one
                elif not es_manual and best_manual:
                    continue

            if best_stop is not None:
                seg["stop_id"] = best_stop["id"]
            else:
                stop_data: dict[str, Any] = {
                    "lat": c["lat"],
                    "lon": c["lon"],
                    "arrived_at": datetime.fromtimestamp(c["ts"]).isoformat(),
                    "departed_at": datetime.fromtimestamp(c["end_ts"]).isoformat(),
                    "auto_detected": True,
                }
                if self._geocoding_enabled:
                    try:
                        session = aiohttp_client.async_get_clientsession(self.hass)
                        geo = await async_reverse_geocode(
                            c["lat"], c["lon"], session
                        )
                        stop_data["nearest_town"] = geo.get("short_name", "")
                        stop_data["name"] = geo.get("short_name", "")
                    except Exception:  # noqa: BLE001
                        pass
                    await asyncio.sleep(1.0)  # rate-limit geocoding

                named_place = await self.database.async_find_named_place_at(
                    c["lat"], c["lon"]
                )
                if named_place:
                    stop_data["name"] = named_place["name"]

                stop = await self.database.async_create_stop(stop_data)
                seg["stop_id"] = stop["id"]
                existing_stops.append(stop)
                stops_created += 1

        # ── Step 4: create trips from move segments ──
        trips_created = 0
        prev_stop_seg = None

        for idx, seg in enumerate(segments):
            if seg["type"] == "stop":
                prev_stop_seg = seg
            elif seg["type"] == "move" and len(seg["pts"]) >= 2:
                next_stop_seg = None
                for n_idx in range(idx + 1, len(segments)):
                    if segments[n_idx]["type"] == "stop":
                        next_stop_seg = segments[n_idx]
                        break

                trip_start = seg["pts"][0]["ts"]
                trip_end = seg["pts"][-1]["ts"]

                dist = 0.0
                for pi in range(1, len(seg["pts"])):
                    dist += _haversine_m(
                        seg["pts"][pi - 1]["lat"],
                        seg["pts"][pi - 1]["lon"],
                        seg["pts"][pi]["lat"],
                        seg["pts"][pi]["lon"],
                    )

                await self.database.async_create_trip({
                    "start_ts": trip_start,
                    "end_ts": trip_end,
                    "from_stop_id": (
                        prev_stop_seg.get("stop_id") if prev_stop_seg else None
                    ),
                    "to_stop_id": (
                        next_stop_seg.get("stop_id") if next_stop_seg else None
                    ),
                    "distance_m": dist,
                    "duration_s": trip_end - trip_start,
                })
                trips_created += 1

        msg = (
            f"Backfill trips: {trips_created} trips, {stops_created} stops "
            f"from {len(points)} GPS pts ({len(thinned)} thinned, "
            f"{len(segments)} segments)"
        )
        _LOGGER.info(msg)
        return {
            "trips_created": trips_created,
            "stops_created": stops_created,
            "gps_points": len(points),
            "thinned": len(thinned),
            "segments": len(segments),
            "message": msg,
        }

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

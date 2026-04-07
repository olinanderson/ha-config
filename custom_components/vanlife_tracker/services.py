"""HA Services for Vanlife Tracker — create, update, delete, and query stops."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv

from .const import (
    DOMAIN,
    SERVICE_CREATE_STOP,
    SERVICE_UPDATE_STOP,
    SERVICE_DELETE_STOP,
    SERVICE_DEPART_STOP,
    SERVICE_GET_STOPS,
    SERVICE_EXPORT_GPX,
    SERVICE_CREATE_NAMED_PLACE,
    SERVICE_UPDATE_NAMED_PLACE,
    SERVICE_DELETE_NAMED_PLACE,
    SERVICE_GET_NAMED_PLACES,
    SERVICE_BACKFILL_STOPS,
    SERVICE_BACKFILL_TRIPS,
    STOP_CATEGORIES,
)
from .coordinator import VanlifeCoordinator

_LOGGER = logging.getLogger(__name__)

CREATE_STOP_SCHEMA = vol.Schema(
    {
        vol.Optional("name"): cv.string,
        vol.Optional("lat"): vol.Coerce(float),
        vol.Optional("lon"): vol.Coerce(float),
        vol.Optional("elevation"): vol.Coerce(float),
        vol.Optional("notes"): cv.string,
        vol.Optional("rating"): vol.All(vol.Coerce(int), vol.Range(min=0, max=5)),
        vol.Optional("category"): vol.In(STOP_CATEGORIES),
        vol.Optional("arrived_at"): cv.string,
        vol.Optional("departed_at"): cv.string,
    }
)

UPDATE_STOP_SCHEMA = vol.Schema(
    {
        vol.Required("stop_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("notes"): cv.string,
        vol.Optional("rating"): vol.All(vol.Coerce(int), vol.Range(min=0, max=5)),
        vol.Optional("category"): vol.In(STOP_CATEGORIES),
    }
)

DELETE_STOP_SCHEMA = vol.Schema(
    {
        vol.Required("stop_id"): cv.string,
    }
)

GET_STOPS_SCHEMA = vol.Schema(
    {
        vol.Optional("limit", default=20): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=500)
        ),
        vol.Optional("category"): vol.In(STOP_CATEGORIES),
        vol.Optional("min_rating"): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=5)
        ),
    }
)

NAMED_PLACE_CATEGORIES = [
    "home", "friend_family", "free_camping", "paid_campground", "other"
]

CREATE_NAMED_PLACE_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("lat"): vol.Coerce(float),
        vol.Required("lon"): vol.Coerce(float),
        vol.Optional("radius_m", default=200): vol.All(
            vol.Coerce(float), vol.Range(min=50, max=5000)
        ),
        vol.Optional("category"): vol.In(NAMED_PLACE_CATEGORIES),
        vol.Optional("notes"): cv.string,
    }
)

UPDATE_NAMED_PLACE_SCHEMA = vol.Schema(
    {
        vol.Required("place_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("radius_m"): vol.All(
            vol.Coerce(float), vol.Range(min=50, max=5000)
        ),
        vol.Optional("category"): vol.In(NAMED_PLACE_CATEGORIES),
        vol.Optional("notes"): cv.string,
    }
)

DELETE_NAMED_PLACE_SCHEMA = vol.Schema(
    {
        vol.Required("place_id"): cv.string,
    }
)

BACKFILL_STOPS_SCHEMA = vol.Schema(
    {
        vol.Optional("days", default=30): vol.All(vol.Coerce(int), vol.Range(min=1, max=365)),
        vol.Optional("min_stop_minutes"): vol.All(vol.Coerce(int), vol.Range(min=5, max=480)),
        vol.Optional("stationary_radius_m", default=100): vol.All(
            vol.Coerce(float), vol.Range(min=20, max=500)
        ),
    }
)

BACKFILL_TRIPS_SCHEMA = vol.Schema(
    {
        vol.Optional("days", default=365): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=730)
        ),
        vol.Optional("clear_existing", default=True): vol.Coerce(bool),
    }
)


def _get_coordinator(hass: HomeAssistant) -> VanlifeCoordinator:
    """Get the first coordinator from loaded entries."""
    for entry_id, coordinator in hass.data.get(DOMAIN, {}).items():
        if isinstance(coordinator, VanlifeCoordinator):
            return coordinator
    raise ValueError("Vanlife Tracker not configured")


async def async_register_services(hass: HomeAssistant) -> None:
    """Register all Vanlife Tracker services."""

    async def handle_create_stop(call: ServiceCall) -> None:
        """Handle create_stop service call."""
        coordinator = _get_coordinator(hass)
        stop = await coordinator.async_create_stop(dict(call.data))
        _LOGGER.info("Service: created stop '%s' (%s)", stop["name"], stop["id"])

    async def handle_update_stop(call: ServiceCall) -> None:
        """Handle update_stop service call."""
        coordinator = _get_coordinator(hass)
        stop_id = call.data["stop_id"]
        updates = {k: v for k, v in call.data.items() if k != "stop_id"}
        result = await coordinator.async_update_stop(stop_id, updates)
        if result:
            _LOGGER.info("Service: updated stop %s", stop_id)
        else:
            _LOGGER.warning("Service: stop %s not found", stop_id)

    async def handle_delete_stop(call: ServiceCall) -> None:
        """Handle delete_stop service call."""
        coordinator = _get_coordinator(hass)
        deleted = await coordinator.async_delete_stop(call.data["stop_id"])
        if deleted:
            _LOGGER.info("Service: deleted stop %s", call.data["stop_id"])

    async def handle_depart_stop(call: ServiceCall) -> None:
        """Handle depart_current_stop service call."""
        coordinator = _get_coordinator(hass)
        departed = await coordinator.async_depart_current_stop()
        if departed:
            _LOGGER.info("Service: departed from '%s'", departed.get("name"))

    async def handle_get_stops(call: ServiceCall) -> None:
        """Handle get_stops service call — fires event with results."""
        coordinator = _get_coordinator(hass)
        stops = await coordinator.async_get_stops(
            limit=call.data.get("limit", 20),
            category=call.data.get("category"),
            min_rating=call.data.get("min_rating"),
        )
        hass.bus.async_fire(f"{DOMAIN}_stops_response", {"stops": stops})

    async def handle_export_gpx(call: ServiceCall) -> None:
        """Handle export_gpx service call — writes GPX to /config/www/."""
        coordinator = _get_coordinator(hass)
        gpx_content = await coordinator.async_export_gpx()
        export_path = hass.config.path("www", "vanlife_stops.gpx")
        import os
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        with open(export_path, "w") as f:
            f.write(gpx_content)
        _LOGGER.info("GPX exported to %s", export_path)
        hass.bus.async_fire(
            f"{DOMAIN}_gpx_exported",
            {"path": export_path, "url": "/local/vanlife_stops.gpx"},
        )

    async def handle_create_named_place(call: ServiceCall) -> None:
        """Handle create_named_place service call."""
        coordinator = _get_coordinator(hass)
        place = await coordinator.async_create_named_place(dict(call.data))
        _LOGGER.info("Service: created named place '%s'", place["name"])

    async def handle_update_named_place(call: ServiceCall) -> None:
        """Handle update_named_place service call."""
        coordinator = _get_coordinator(hass)
        place_id = call.data["place_id"]
        updates = {k: v for k, v in call.data.items() if k != "place_id"}
        await coordinator.async_update_named_place(place_id, updates)

    async def handle_delete_named_place(call: ServiceCall) -> None:
        """Handle delete_named_place service call."""
        coordinator = _get_coordinator(hass)
        await coordinator.async_delete_named_place(call.data["place_id"])
        _LOGGER.info("Service: deleted named place %s", call.data["place_id"])

    async def handle_get_named_places(call: ServiceCall) -> None:
        """Handle get_named_places — fires event with results."""
        coordinator = _get_coordinator(hass)
        places = await coordinator.async_get_named_places()
        hass.bus.async_fire(f"{DOMAIN}_named_places_response", {"places": places})

    async def handle_backfill_stops(call: ServiceCall) -> None:
        """Handle backfill_stops — analyze GPS history and create past stops."""
        from datetime import datetime, timedelta
        coordinator = _get_coordinator(hass)
        days = call.data.get("days", 30)
        end_time = datetime.now()
        start_time = end_time - timedelta(days=days)
        result = await coordinator.async_backfill_stops(
            start_time=start_time,
            end_time=end_time,
            min_stop_minutes=call.data.get("min_stop_minutes"),
            stationary_radius_m=call.data.get("stationary_radius_m", 100.0),
        )
        _LOGGER.info("Backfill: %s", result.get("message"))

    async def handle_backfill_trips(call: ServiceCall) -> None:
        """Handle backfill_trips — fire-and-forget background task."""
        import time
        coordinator = _get_coordinator(hass)
        days = call.data.get("days", 365)
        clear = call.data.get("clear_existing", True)
        end_ts = time.time()
        start_ts = end_ts - (days * 86400)

        async def _run_backfill():
            try:
                result = await coordinator.async_backfill_trips(
                    start_ts=start_ts,
                    end_ts=end_ts,
                    clear_existing=clear,
                )
                _LOGGER.info("Backfill trips complete: %s", result.get("message"))
            except Exception:
                _LOGGER.exception("Backfill trips failed")

        hass.async_create_task(_run_backfill())
        _LOGGER.info("Backfill trips started (days=%d, clear=%s)", days, clear)

    # Register all services
    hass.services.async_register(
        DOMAIN, SERVICE_CREATE_STOP, handle_create_stop, schema=CREATE_STOP_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_UPDATE_STOP, handle_update_stop, schema=UPDATE_STOP_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_DELETE_STOP, handle_delete_stop, schema=DELETE_STOP_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_DEPART_STOP, handle_depart_stop
    )
    hass.services.async_register(
        DOMAIN, SERVICE_GET_STOPS, handle_get_stops, schema=GET_STOPS_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_EXPORT_GPX, handle_export_gpx
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CREATE_NAMED_PLACE, handle_create_named_place,
        schema=CREATE_NAMED_PLACE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_UPDATE_NAMED_PLACE, handle_update_named_place,
        schema=UPDATE_NAMED_PLACE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_DELETE_NAMED_PLACE, handle_delete_named_place,
        schema=DELETE_NAMED_PLACE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_GET_NAMED_PLACES, handle_get_named_places
    )
    hass.services.async_register(
        DOMAIN, SERVICE_BACKFILL_STOPS, handle_backfill_stops,
        schema=BACKFILL_STOPS_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_BACKFILL_TRIPS, handle_backfill_trips,
        schema=BACKFILL_TRIPS_SCHEMA,
    )


async def async_unregister_services(hass: HomeAssistant) -> None:
    """Unregister all Vanlife Tracker services."""
    for service in (
        SERVICE_CREATE_STOP,
        SERVICE_UPDATE_STOP,
        SERVICE_DELETE_STOP,
        SERVICE_DEPART_STOP,
        SERVICE_GET_STOPS,
        SERVICE_EXPORT_GPX,
        SERVICE_CREATE_NAMED_PLACE,
        SERVICE_UPDATE_NAMED_PLACE,
        SERVICE_DELETE_NAMED_PLACE,
        SERVICE_GET_NAMED_PLACES,
        SERVICE_BACKFILL_STOPS,
        SERVICE_BACKFILL_TRIPS,
    ):
        hass.services.async_remove(DOMAIN, service)

"""Geo location platform — each stop appears as a named marker on the HA map."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    EVENT_STOP_CREATED,
    EVENT_STOP_UPDATED,
    STOP_CATEGORIES,
)
from .coordinator import VanlifeCoordinator

_LOGGER = logging.getLogger(__name__)

SOURCE = DOMAIN


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up geo_location entities for all existing stops, then listen for new ones."""
    coordinator: VanlifeCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    # Create entities for all existing stops (up to 500)
    stops = await coordinator.async_get_stops(limit=500)
    entities = [VanlifeStopLocation(stop, config_entry) for stop in stops]
    async_add_entities(entities, True)

    # Track by stop_id so we can update them in-place
    _registry: dict[str, VanlifeStopLocation] = {e.stop_id: e for e in entities}

    @callback
    def _on_stop_created(event: Any) -> None:
        stop = dict(event.data)
        stop_id = stop.get("id")
        if not stop_id or stop_id in _registry:
            return
        entity = VanlifeStopLocation(stop, config_entry)
        _registry[stop_id] = entity
        async_add_entities([entity])

    @callback
    def _on_stop_updated(event: Any) -> None:
        stop = dict(event.data)
        entity = _registry.get(stop.get("id", ""))
        if entity:
            entity.update_from_stop(stop)

    config_entry.async_on_unload(
        hass.bus.async_listen(EVENT_STOP_CREATED, _on_stop_created)
    )
    config_entry.async_on_unload(
        hass.bus.async_listen(EVENT_STOP_UPDATED, _on_stop_updated)
    )


class VanlifeStopLocation(GeolocationEvent):
    """A stop/campsite as a named geo_location marker on the HA map."""

    _attr_should_poll = False

    def __init__(self, stop: dict[str, Any], config_entry: ConfigEntry) -> None:
        """Initialize."""
        self._stop = stop
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_geo_{stop['id']}"
        self._attr_name = stop.get("name") or f"Stop {stop['id'][:4].upper()}"
        self._attr_icon = self._icon_for_category(stop.get("category", ""))

    @property
    def stop_id(self) -> str:
        """Return the stop ID."""
        return self._stop["id"]

    # ─── GeoLocationEvent required properties ──────────────

    @property
    def source(self) -> str:
        return SOURCE

    @property
    def distance(self) -> float | None:
        return None

    @property
    def latitude(self) -> float | None:
        lat = self._stop.get("lat")
        return float(lat) if lat is not None else None

    @property
    def longitude(self) -> float | None:
        lon = self._stop.get("lon")
        return float(lon) if lon is not None else None

    # ─── Extra attributes shown in more-info ───────────────

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        stop = self._stop
        arrived = stop.get("arrived_at", "")
        departed = stop.get("departed_at")

        duration_str = ""
        if arrived:
            try:
                arr = datetime.fromisoformat(arrived)
                end = datetime.fromisoformat(departed) if departed else datetime.now()
                dur = end - arr
                h = int(dur.total_seconds() / 3600)
                m = int((dur.total_seconds() % 3600) / 60)
                duration_str = f"{h}h {m}m"
            except (ValueError, TypeError):
                pass

        rating = stop.get("rating", 0) or 0
        rating_stars = "★" * int(rating) + "☆" * (5 - int(rating)) if rating else "—"

        return {
            "stop_id": stop.get("id"),
            "nearest_town": stop.get("nearest_town", ""),
            "category": (stop.get("category") or "").replace("_", " ").title(),
            "arrived_at": arrived,
            "departed_at": departed or "Still here",
            "duration": duration_str,
            "rating": rating_stars,
            "notes": stop.get("notes", ""),
            "elevation_m": stop.get("elevation", 0),
        }

    # ─── Live update from coordinator events ───────────────

    @callback
    def update_from_stop(self, stop: dict[str, Any]) -> None:
        """Update entity when stop is edited."""
        self._stop = stop
        self._attr_name = stop.get("name") or self._attr_name
        self._attr_icon = self._icon_for_category(stop.get("category", ""))
        self.async_write_ha_state()

    # ─── Helpers ───────────────────────────────────────────

    @staticmethod
    def _icon_for_category(category: str) -> str:
        icons = {
            "free_camping": "mdi:tent",
            "paid_campground": "mdi:campfire",
            "walmart": "mdi:store",
            "blm_land": "mdi:pine-tree",
            "national_forest": "mdi:tree",
            "rest_area": "mdi:parking",
            "friend_family": "mdi:home-heart",
            "urban": "mdi:city",
            "trailhead": "mdi:hiking",
        }
        return icons.get(category, "mdi:map-marker-star")

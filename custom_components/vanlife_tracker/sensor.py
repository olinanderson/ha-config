"""Sensor platform for Vanlife Tracker."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorDeviceClass,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval
from datetime import timedelta

from .const import (
    DOMAIN,
    VERSION,
    ATTR_STOP_ID,
    ATTR_STOP_NAME,
    ATTR_LATITUDE,
    ATTR_LONGITUDE,
    ATTR_ARRIVED_AT,
    ATTR_DEPARTED_AT,
    ATTR_NOTES,
    ATTR_RATING,
    ATTR_CATEGORY,
    ATTR_NEAREST_TOWN,
    ATTR_TOTAL_STOPS,
    ATTR_DAYS_ON_ROAD,
    ATTR_CURRENT_STOP,
    ATTR_ELEVATION,
    ATTR_WEATHER,
    EVENT_STOP_CREATED,
    EVENT_STOP_DEPARTED,
    EVENT_STOP_UPDATED,
)
from .coordinator import VanlifeCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Vanlife Tracker sensors."""
    coordinator: VanlifeCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    entities = [
        VanlifeTripStatsSensor(coordinator, config_entry),
        VanlifeCurrentStopSensor(coordinator, config_entry),
        VanlifeRecentStopsSensor(coordinator, config_entry),
    ]

    async_add_entities(entities, True)


class VanlifeTripStatsSensor(SensorEntity):
    """Sensor showing overall trip statistics."""

    _attr_has_entity_name = True
    _attr_name = "Trip Statistics"
    _attr_icon = "mdi:map-marker-path"
    _attr_native_unit_of_measurement = "stops"
    _attr_state_class = SensorStateClass.TOTAL

    def __init__(
        self, coordinator: VanlifeCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize."""
        self._coordinator = coordinator
        self._attr_unique_id = f"{config_entry.entry_id}_trip_stats"
        self._attr_device_info = _device_info(config_entry)
        self._stats: dict[str, Any] = {}

    async def async_added_to_hass(self) -> None:
        """Subscribe to stop events and periodic updates."""
        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_STOP_CREATED, self._on_stop_event)
        )
        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_STOP_DEPARTED, self._on_stop_event)
        )
        # Refresh stats every 5 minutes
        self.async_on_remove(
            async_track_time_interval(
                self.hass, self._async_refresh, timedelta(minutes=5)
            )
        )
        await self._async_refresh()

    @callback
    def _on_stop_event(self, event: Any) -> None:
        """Refresh when a stop is created or departed."""
        self.hass.async_create_task(self._async_refresh())

    async def _async_refresh(self, _now: datetime | None = None) -> None:
        """Refresh statistics from database."""
        self._stats = await self._coordinator.async_get_stats()
        self._attr_native_value = self._stats.get("total_stops", 0)
        self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return trip statistics as attributes."""
        return {
            ATTR_TOTAL_STOPS: self._stats.get("total_stops", 0),
            ATTR_DAYS_ON_ROAD: self._stats.get("days_on_road", 0),
            "avg_rating": self._stats.get("avg_rating", 0),
            "categories": self._stats.get("categories", {}),
        }


class VanlifeCurrentStopSensor(SensorEntity):
    """Sensor showing the current stop (if parked)."""

    _attr_has_entity_name = True
    _attr_name = "Current Stop"
    _attr_icon = "mdi:map-marker-check"

    def __init__(
        self, coordinator: VanlifeCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize."""
        self._coordinator = coordinator
        self._attr_unique_id = f"{config_entry.entry_id}_current_stop"
        self._attr_device_info = _device_info(config_entry)
        self._stop: dict[str, Any] | None = None

    async def async_added_to_hass(self) -> None:
        """Subscribe to stop events."""
        for event_type in (EVENT_STOP_CREATED, EVENT_STOP_DEPARTED, EVENT_STOP_UPDATED):
            self.async_on_remove(
                self.hass.bus.async_listen(event_type, self._on_stop_event)
            )
        await self._async_refresh()

    @callback
    def _on_stop_event(self, event: Any) -> None:
        """Refresh on stop changes."""
        self.hass.async_create_task(self._async_refresh())

    async def _async_refresh(self, _now: datetime | None = None) -> None:
        """Refresh current stop from coordinator."""
        self._stop = self._coordinator.current_stop
        if self._stop:
            self._attr_native_value = self._stop.get("name", "Unknown")
            self._attr_icon = "mdi:map-marker-check"
        else:
            self._attr_native_value = "Traveling" if self._coordinator.is_moving else "No active stop"
            self._attr_icon = "mdi:car" if self._coordinator.is_moving else "mdi:map-marker-question"
        self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return current stop details."""
        if not self._stop:
            return {ATTR_CURRENT_STOP: None}

        return {
            ATTR_STOP_ID: self._stop.get("id"),
            ATTR_STOP_NAME: self._stop.get("name"),
            ATTR_LATITUDE: self._stop.get("lat"),
            ATTR_LONGITUDE: self._stop.get("lon"),
            ATTR_ELEVATION: self._stop.get("elevation"),
            ATTR_ARRIVED_AT: self._stop.get("arrived_at"),
            ATTR_NOTES: self._stop.get("notes"),
            ATTR_RATING: self._stop.get("rating"),
            ATTR_CATEGORY: self._stop.get("category"),
            ATTR_NEAREST_TOWN: self._stop.get("nearest_town"),
            ATTR_WEATHER: self._stop.get("weather"),
        }


class VanlifeRecentStopsSensor(SensorEntity):
    """Sensor listing recent stops (last 200) as attributes — for dashboard use."""

    _attr_has_entity_name = True
    _attr_name = "Recent Stops"
    _attr_icon = "mdi:format-list-bulleted"

    def __init__(
        self, coordinator: VanlifeCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize."""
        self._coordinator = coordinator
        self._attr_unique_id = f"{config_entry.entry_id}_recent_stops"
        self._attr_device_info = _device_info(config_entry)
        self._stops: list[dict[str, Any]] = []

    async def async_added_to_hass(self) -> None:
        """Subscribe to stop events."""
        for event_type in (EVENT_STOP_CREATED, EVENT_STOP_DEPARTED, EVENT_STOP_UPDATED):
            self.async_on_remove(
                self.hass.bus.async_listen(event_type, self._on_stop_event)
            )
        # Refresh every 10 minutes
        self.async_on_remove(
            async_track_time_interval(
                self.hass, self._async_refresh, timedelta(minutes=10)
            )
        )
        await self._async_refresh()

    @callback
    def _on_stop_event(self, event: Any) -> None:
        """Refresh on stop changes."""
        self.hass.async_create_task(self._async_refresh())

    async def _async_refresh(self, _now: datetime | None = None) -> None:
        """Refresh recent stops list."""
        self._stops = await self._coordinator.async_get_stops(limit=200)
        self._attr_native_value = len(self._stops)
        self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return recent stops as an attribute list."""
        return {
            "stops": [
                {
                    "id": s.get("id"),
                    "name": s.get("name"),
                    "lat": s.get("lat"),
                    "lon": s.get("lon"),
                    "arrived_at": s.get("arrived_at"),
                    "departed_at": s.get("departed_at"),
                    "rating": s.get("rating"),
                    "category": s.get("category"),
                    "nearest_town": s.get("nearest_town"),
                    "notes": s.get("notes"),
                }
                for s in self._stops
            ]
        }


def _device_info(config_entry: ConfigEntry) -> dict[str, Any]:
    """Return device info for all Vanlife Tracker entities."""
    return {
        "identifiers": {(DOMAIN, config_entry.entry_id)},
        "name": "Vanlife Tracker",
        "manufacturer": "Vanlife Tracker",
        "model": "Travel & Campsite Logger",
        "sw_version": VERSION,
    }

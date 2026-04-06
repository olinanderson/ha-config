"""Device tracker platform for Vanlife Tracker — shows the van on the HA map."""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.components.device_tracker import SourceType
from homeassistant.components.device_tracker.config_entry import TrackerEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)

from .const import (
    DOMAIN,
    CONF_GPS_ENTITY,
    ATTR_LATITUDE,
    ATTR_LONGITUDE,
    ATTR_ELEVATION,
    ATTR_CURRENT_STOP,
    EVENT_STOP_CREATED,
    EVENT_STOP_DEPARTED,
)
from .coordinator import VanlifeCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Vanlife Tracker device tracker."""
    coordinator: VanlifeCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    async_add_entities(
        [VanlifeDeviceTracker(coordinator, config_entry)],
        True,
    )


class VanlifeDeviceTracker(TrackerEntity):
    """Device tracker that mirrors the configured GPS entity and annotates with stop info."""

    _attr_has_entity_name = True
    _attr_name = "Van Location"
    _attr_icon = "mdi:van-utility"

    def __init__(
        self,
        coordinator: VanlifeCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the tracker."""
        self._coordinator = coordinator
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_van_location"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, config_entry.entry_id)},
            "name": "Vanlife Tracker",
            "manufacturer": "Vanlife Tracker",
            "model": "Travel & Campsite Logger",
            "sw_version": "0.1.0",
        }
        self._latitude: float | None = None
        self._longitude: float | None = None
        self._elevation: float | None = None
        self._accuracy: int | None = None

    async def async_added_to_hass(self) -> None:
        """Start listening to the source GPS entity and stop events."""
        # Listen for source GPS entity state changes
        gps_entity = self._coordinator.config.get(CONF_GPS_ENTITY, "")
        if gps_entity:
            self.async_on_remove(
                async_track_state_change_event(
                    self.hass, [gps_entity], self._on_gps_state_change
                )
            )
            # Set initial position from current state
            self._update_from_gps_entity()

        # Listen for stop events to update attributes
        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_STOP_CREATED, self._on_stop_event)
        )
        self.async_on_remove(
            self.hass.bus.async_listen(EVENT_STOP_DEPARTED, self._on_stop_event)
        )

        # Periodic refresh every 30 seconds in case state events are missed
        self.async_on_remove(
            async_track_time_interval(
                self.hass, self._async_periodic_refresh, timedelta(seconds=30)
            )
        )

    @callback
    def _on_gps_state_change(self, event: Any) -> None:
        """Handle GPS source entity state changes."""
        new_state = event.data.get("new_state")
        if new_state is None:
            return

        self._latitude = new_state.attributes.get("latitude")
        self._longitude = new_state.attributes.get("longitude")
        self._elevation = (
            new_state.attributes.get("altitude")
            or new_state.attributes.get("elevation")
        )
        self._accuracy = new_state.attributes.get("gps_accuracy")
        self.async_write_ha_state()

    @callback
    def _on_stop_event(self, event: Any) -> None:
        """Refresh on stop create/depart to update attributes."""
        self.async_write_ha_state()

    async def _async_periodic_refresh(self, _now=None) -> None:
        """Periodic fallback refresh."""
        self._update_from_gps_entity()
        self.async_write_ha_state()

    @callback
    def _update_from_gps_entity(self) -> None:
        """Pull current position from the source GPS entity."""
        gps_entity = self._coordinator.config.get(CONF_GPS_ENTITY, "")
        if not gps_entity:
            return

        state = self.hass.states.get(gps_entity)
        if state is None:
            return

        self._latitude = state.attributes.get("latitude")
        self._longitude = state.attributes.get("longitude")
        self._elevation = (
            state.attributes.get("altitude")
            or state.attributes.get("elevation")
        )
        self._accuracy = state.attributes.get("gps_accuracy")

    # ─── TrackerEntity interface ──────────────────────────────

    @property
    def latitude(self) -> float | None:
        """Return latitude."""
        return self._latitude

    @property
    def longitude(self) -> float | None:
        """Return longitude."""
        return self._longitude

    @property
    def source_type(self) -> SourceType:
        """Return the source type (GPS)."""
        return SourceType.GPS

    @property
    def location_accuracy(self) -> int:
        """Return the GPS accuracy in meters."""
        return self._accuracy or 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra attributes — current stop info, elevation, movement status."""
        attrs: dict[str, Any] = {
            "is_moving": self._coordinator.is_moving,
        }

        if self._elevation is not None:
            attrs[ATTR_ELEVATION] = self._elevation

        stop = self._coordinator.current_stop
        if stop:
            attrs[ATTR_CURRENT_STOP] = stop.get("name")
            attrs["stop_id"] = stop.get("id")
            attrs["stop_category"] = stop.get("category")
            attrs["arrived_at"] = stop.get("arrived_at")
        else:
            attrs[ATTR_CURRENT_STOP] = None

        return attrs

"""Binary sensor platform for Vanlife Tracker — exposes vehicle movement state."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval
from datetime import timedelta

from .const import DOMAIN, VERSION
from .coordinator import VanlifeCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Vanlife Tracker binary sensors."""
    coordinator: VanlifeCoordinator = hass.data[DOMAIN][config_entry.entry_id]

    async_add_entities(
        [VanlifeMovingSensor(coordinator, config_entry)],
        True,
    )


class VanlifeMovingSensor(BinarySensorEntity):
    """Binary sensor that reflects whether the vehicle is currently moving.

    Derived from GPS-based movement detection in the coordinator (no OBD
    dependency).  Can be used by other automations as a drop-in replacement
    for the WiCAN-based ``binary_sensor.vehicle_is_moving``.
    """

    _attr_has_entity_name = True
    _attr_name = "Vehicle Moving"
    _attr_device_class = BinarySensorDeviceClass.MOVING

    def __init__(
        self,
        coordinator: VanlifeCoordinator,
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize."""
        self._coordinator = coordinator
        self._attr_unique_id = f"{config_entry.entry_id}_vehicle_moving"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, config_entry.entry_id)},
            "name": "Vanlife Tracker",
            "manufacturer": "Vanlife Tracker",
            "model": "Travel & Campsite Logger",
            "sw_version": VERSION,
        }

    async def async_added_to_hass(self) -> None:
        """Poll coordinator state every 5 seconds to stay in sync."""
        self.async_on_remove(
            async_track_time_interval(
                self.hass, self._async_refresh, timedelta(seconds=5)
            )
        )

    @callback
    def _async_refresh(self, _now=None) -> None:
        """Sync state from coordinator."""
        self.async_write_ha_state()

    @property
    def is_on(self) -> bool:
        """Return True if the vehicle is moving."""
        return self._coordinator.is_moving

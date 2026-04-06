"""Vanlife Tracker — travel tracking, campsite logging, and route recording for van lifers."""

from __future__ import annotations

import logging
import os
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PLATFORMS, DB_FILE
from .coordinator import VanlifeCoordinator
from .database import VanlifeDatabase
from .services import async_register_services, async_unregister_services

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up Vanlife Tracker (YAML not supported — config flow only)."""
    hass.data.setdefault(DOMAIN, {})
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
    await coordinator.async_start()

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

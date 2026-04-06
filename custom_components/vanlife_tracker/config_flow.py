"""Config flow for Vanlife Tracker integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import selector

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
    DEFAULT_TRACCAR_URL,
    DEFAULT_TRACCAR_DEVICE_ID,
)

_LOGGER = logging.getLogger(__name__)


class VanlifeTrackerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Vanlife Tracker."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle the initial step — GPS and movement entity selection."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Validate GPS entity exists and has lat/lon
            gps_entity = user_input.get(CONF_GPS_ENTITY, "")
            if gps_entity:
                state = self.hass.states.get(gps_entity)
                if state is None:
                    errors[CONF_GPS_ENTITY] = "entity_not_found"
                elif state.attributes.get("latitude") is None:
                    errors[CONF_GPS_ENTITY] = "no_gps_attributes"

            if not errors:
                # Store step 1 data and go to step 2
                self._user_input = user_input
                return await self.async_step_traccar()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_GPS_ENTITY): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            domain=["device_tracker", "sensor"],
                        )
                    ),
                    vol.Optional(CONF_VEHICLE_MOVING_ENTITY): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            domain="binary_sensor",
                            device_class="moving",
                        )
                    ),
                    vol.Optional(CONF_WEATHER_ENTITY): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="weather")
                    ),
                    vol.Optional(
                        CONF_STOP_DELAY_MINUTES,
                        default=DEFAULT_STOP_DELAY_MINUTES,
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=5,
                            max=240,
                            step=5,
                            unit_of_measurement="minutes",
                            mode=selector.NumberSelectorMode.SLIDER,
                        )
                    ),
                    vol.Optional(
                        CONF_GEOCODING_ENABLED, default=True
                    ): selector.BooleanSelector(),
                }
            ),
            errors=errors,
            description_placeholders={
                "gps_help": "Select a device_tracker or sensor with latitude/longitude attributes (e.g. Starlink GPS)",
                "moving_help": "Optional: binary_sensor that indicates when the vehicle is in motion",
            },
        )

    async def async_step_traccar(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle Traccar configuration (optional)."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Merge with step 1 data
            full_config = {**self._user_input, **user_input}

            # Validate Traccar URL if enabled
            if full_config.get(CONF_TRACCAR_ENABLED):
                url = full_config.get(CONF_TRACCAR_URL, "")
                if not url.startswith(("http://", "https://")):
                    errors[CONF_TRACCAR_URL] = "invalid_url"

            if not errors:
                # Prevent duplicate entries
                await self.async_set_unique_id(DOMAIN)
                self._abort_if_unique_id_configured()

                return self.async_create_entry(
                    title="Vanlife Tracker",
                    data=full_config,
                )

        return self.async_show_form(
            step_id="traccar",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_TRACCAR_ENABLED, default=False
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_TRACCAR_URL,
                        default=DEFAULT_TRACCAR_URL,
                    ): selector.TextSelector(
                        selector.TextSelectorConfig(type=selector.TextSelectorType.URL)
                    ),
                    vol.Optional(
                        CONF_TRACCAR_DEVICE_ID,
                        default=DEFAULT_TRACCAR_DEVICE_ID,
                    ): selector.TextSelector(),
                    vol.Optional(
                        CONF_GPS_PUBLISH_INTERVAL,
                        default=DEFAULT_GPS_PUBLISH_INTERVAL,
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=1,
                            max=60,
                            step=1,
                            unit_of_measurement="seconds",
                            mode=selector.NumberSelectorMode.SLIDER,
                        )
                    ),
                }
            ),
            errors=errors,
            description_placeholders={
                "traccar_help": "Optional: enable route tracking via Traccar. Install the Traccar add-on first.",
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> VanlifeTrackerOptionsFlow:
        """Return the options flow handler."""
        return VanlifeTrackerOptionsFlow(config_entry)


class VanlifeTrackerOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for Vanlife Tracker (reconfigure without removing)."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = self.config_entry.data

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_STOP_DELAY_MINUTES,
                        default=current.get(
                            CONF_STOP_DELAY_MINUTES, DEFAULT_STOP_DELAY_MINUTES
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=5, max=240, step=5,
                            unit_of_measurement="minutes",
                            mode=selector.NumberSelectorMode.SLIDER,
                        )
                    ),
                    vol.Optional(
                        CONF_GEOCODING_ENABLED,
                        default=current.get(CONF_GEOCODING_ENABLED, True),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_TRACCAR_ENABLED,
                        default=current.get(CONF_TRACCAR_ENABLED, False),
                    ): selector.BooleanSelector(),
                    vol.Optional(
                        CONF_TRACCAR_URL,
                        default=current.get(CONF_TRACCAR_URL, DEFAULT_TRACCAR_URL),
                    ): selector.TextSelector(
                        selector.TextSelectorConfig(type=selector.TextSelectorType.URL)
                    ),
                    vol.Optional(
                        CONF_GPS_PUBLISH_INTERVAL,
                        default=current.get(
                            CONF_GPS_PUBLISH_INTERVAL, DEFAULT_GPS_PUBLISH_INTERVAL
                        ),
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=1, max=60, step=1,
                            unit_of_measurement="seconds",
                            mode=selector.NumberSelectorMode.SLIDER,
                        )
                    ),
                }
            ),
        )

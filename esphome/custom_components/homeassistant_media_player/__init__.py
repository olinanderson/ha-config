"""
Group helper & sensors for Home‑Assistant‑backed media players.
"""

import esphome.codegen as cg
from esphome.components import text_sensor, binary_sensor
import esphome.config_validation as cv
from esphome.const import CONF_ID

# Re‑export classes & constants from the platform module
from .media_player import (  # noqa: F401 – re‑export on purpose
    homeassistant_media_player_ns,
    HomeAssistantSpeakerMediaPlayer,
    HomeAssistantTVMediaPlayer,
    HomeAssistantTVRokuMediaPlayer,
    HomeAssistantTVKodiMediaPlayer,
    HomeAssistantTVSamsungMediaPlayer,
    HomeAssistantTVAndroidMediaPlayer,
    CONF_SPEAKER,
    CONF_TV,
    CONF_ROKU,
    CONF_KODI,
    CONF_SAMSUNG,
    CONF_ANDROID_TV,
)

CONF_MEDIA_PLAYERS = "media_players"
CONF_FINISHED_LOADING = "finished_loading"
CONF_ACTIVE_PLAYER = "active_player"

AUTO_LOAD = ["sensor"]
DEPENDENCIES = ["api", "sensor"]

HOMEASSISTANT_MEDIA_PLAYER_REFERENCE_SCHEMA = cv.typed_schema(
    {
        CONF_SPEAKER: cv.Schema(
            {cv.GenerateID(CONF_ID): cv.use_id(HomeAssistantSpeakerMediaPlayer)}
        ),
        CONF_TV: cv.Schema(
            {cv.GenerateID(CONF_ID): cv.use_id(HomeAssistantTVMediaPlayer)}
        ),
        CONF_ROKU: cv.Schema(
            {cv.GenerateID(CONF_ID): cv.use_id(HomeAssistantTVRokuMediaPlayer)}
        ),
        CONF_KODI: cv.Schema(
            {cv.GenerateID(CONF_ID): cv.use_id(HomeAssistantTVKodiMediaPlayer)}
        ),
        CONF_SAMSUNG: cv.Schema(
            {cv.GenerateID(CONF_ID): cv.use_id(HomeAssistantTVSamsungMediaPlayer)}
        ),
        CONF_ANDROID_TV: cv.Schema(
            {cv.GenerateID(CONF_ID): cv.use_id(HomeAssistantTVAndroidMediaPlayer)}
        ),
    },
    lower=True,
)

HomeAssistantMediaPlayerGroup = homeassistant_media_player_ns.class_(
    "HomeAssistantMediaPlayerGroup", cg.Component, HomeAssistantTVMediaPlayer
)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(HomeAssistantMediaPlayerGroup),
        cv.Required(CONF_MEDIA_PLAYERS): cv.All(
            cv.ensure_list(HOMEASSISTANT_MEDIA_PLAYER_REFERENCE_SCHEMA), cv.Length(min=1)
        ),
        cv.Optional(CONF_FINISHED_LOADING): binary_sensor.binary_sensor_schema(),
        cv.Optional(CONF_ACTIVE_PLAYER): text_sensor.text_sensor_schema(),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    cg.add_build_flag("-DUSE_MEDIA_PLAYER_GROUP")
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    # Register member players
    for ref in config[CONF_MEDIA_PLAYERS]:
        member = await cg.get_variable(ref[CONF_ID])
        cg.add(var.register_media_player(member))

    # Optional sensors
    if finished := config.get(CONF_FINISHED_LOADING):
        sens = await binary_sensor.new_binary_sensor(finished)
        cg.add(var.set_finished_loading_sensor(sens))

    if active := config.get(CONF_ACTIVE_PLAYER):
        cg.add_define("USE_TEXT_SENSOR")
        ts = await text_sensor.new_text_sensor(active)
        cg.add(ts.set_internal(False))
        cg.add(var.set_active_player_text_sensor(ts))

# Automation: select‑next‑player
from esphome import automation
from esphome.automation import maybe_simple_id

SelectNextMediaPlayerAction = homeassistant_media_player_ns.class_(
    "SelectNextMediaPlayerAction", automation.Action
)

MEDIA_PLAYER_GROUP_ACTION_SCHEMA = maybe_simple_id(
    {cv.GenerateID(): cv.use_id(HomeAssistantMediaPlayerGroup)}
)

@automation.register_action(
    "media_player_group.select_next_player",
    SelectNextMediaPlayerAction,
    MEDIA_PLAYER_GROUP_ACTION_SCHEMA,
)
async def select_next_player_to_code(config, action_id, template_arg, args):
    group = await cg.get_variable(config[CONF_ID])
    return cg.new_Pvariable(action_id, template_arg, group)

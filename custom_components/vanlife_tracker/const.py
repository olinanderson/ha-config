"""Constants for Vanlife Tracker."""

import json
import os

DOMAIN = "vanlife_tracker"

# Read version from manifest.json so it stays in sync everywhere
_MANIFEST = os.path.join(os.path.dirname(__file__), "manifest.json")
with open(_MANIFEST) as _f:
    VERSION = json.load(_f)["version"]
PLATFORMS = ["sensor", "binary_sensor", "device_tracker", "geo_location"]

# --- Config keys ---
CONF_GPS_ENTITY = "gps_entity"
CONF_VEHICLE_MOVING_ENTITY = "vehicle_moving_entity"
CONF_WEATHER_ENTITY = "weather_entity"
CONF_STOP_DELAY_MINUTES = "stop_delay_minutes"
CONF_TRACCAR_ENABLED = "traccar_enabled"
CONF_TRACCAR_URL = "traccar_url"
CONF_TRACCAR_DEVICE_ID = "traccar_device_id"
CONF_GEOCODING_ENABLED = "geocoding_enabled"
CONF_GPS_PUBLISH_INTERVAL = "gps_publish_interval"

# --- Defaults ---
DEFAULT_STOP_DELAY_MINUTES = 30
DEFAULT_GPS_PUBLISH_INTERVAL = 5  # seconds between Traccar updates while moving
DEFAULT_TRACCAR_URL = "http://homeassistant:5055"
DEFAULT_TRACCAR_DEVICE_ID = "vanlife"

# --- Database ---
DB_FILE = "vanlife_tracker.db"

# --- Services ---
SERVICE_CREATE_STOP = "create_stop"
SERVICE_UPDATE_STOP = "update_stop"
SERVICE_DELETE_STOP = "delete_stop"
SERVICE_DEPART_STOP = "depart_current_stop"
SERVICE_GET_STOPS = "get_stops"
SERVICE_EXPORT_GPX = "export_gpx"
SERVICE_CREATE_NAMED_PLACE = "create_named_place"
SERVICE_UPDATE_NAMED_PLACE = "update_named_place"
SERVICE_DELETE_NAMED_PLACE = "delete_named_place"
SERVICE_GET_NAMED_PLACES = "get_named_places"
SERVICE_BACKFILL_STOPS = "backfill_stops"
SERVICE_BACKFILL_TRIPS = "backfill_trips"

# --- Events ---
EVENT_STOP_CREATED = f"{DOMAIN}_stop_created"
EVENT_STOP_DEPARTED = f"{DOMAIN}_stop_departed"
EVENT_STOP_UPDATED = f"{DOMAIN}_stop_updated"
EVENT_TRIP_CREATED = f"{DOMAIN}_trip_created"
EVENT_TRIP_UPDATED = f"{DOMAIN}_trip_updated"

# --- Stop categories ---
STOP_CATEGORIES = [
    "free_camping",
    "paid_campground",
    "walmart",
    "blm_land",
    "national_forest",
    "rest_area",
    "friend_family",
    "urban",
    "trailhead",
    "other",
]

# --- Attributes ---
ATTR_STOP_ID = "stop_id"
ATTR_STOP_NAME = "name"
ATTR_LATITUDE = "latitude"
ATTR_LONGITUDE = "longitude"
ATTR_ELEVATION = "elevation"
ATTR_ARRIVED_AT = "arrived_at"
ATTR_DEPARTED_AT = "departed_at"
ATTR_NOTES = "notes"
ATTR_RATING = "rating"
ATTR_CATEGORY = "category"
ATTR_WEATHER = "weather_summary"
ATTR_TEMP_HIGH = "temp_high"
ATTR_TEMP_LOW = "temp_low"
ATTR_NEAREST_TOWN = "nearest_town"
ATTR_AUTO_DETECTED = "auto_detected"
ATTR_TOTAL_STOPS = "total_stops"
ATTR_DAYS_ON_ROAD = "days_on_road"
ATTR_CURRENT_STOP = "current_stop"

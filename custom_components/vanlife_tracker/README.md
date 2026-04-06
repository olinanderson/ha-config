# Vanlife Tracker

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A **Home Assistant** custom integration for van lifers and RV travelers. Automatically detects when you stop, logs campsites to a local SQLite database, reverse-geocodes locations, optionally pushes GPS tracks to a Traccar server, and exposes everything as sensors + services for dashboards and automations.

## Features

- **Auto-stop detection** — when the vehicle stops moving for a configurable duration, a new stop/campsite is created automatically
- **Reverse geocoding** — stops are auto-named by nearest town (via OpenStreetMap Nominatim, no API key needed)
- **Manual stop management** — create, update, rate, categorize, and delete stops via HA services
- **Device tracker** — shows the van on the HA map with current stop info as attributes
- **Trip statistics sensor** — total stops, days on road, average rating, category breakdown
- **Current stop sensor** — shows where you're parked (or "Traveling" if moving)
- **Recent stops sensor** — last 10 stops as attributes (for dashboard lists)
- **Traccar integration** — optionally push GPS positions to a Traccar server while driving for route recording
- **GPX export** — export all stops as a GPX file for use in mapping apps
- **Weather capture** — optionally records weather conditions at each stop
- **SQLite storage** — all data stored locally in `vanlife_tracker.db` (no cloud dependency)

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the **three dots** menu → **Custom repositories**
3. Add this repository URL: `https://github.com/olinanderson/vanlife-tracker`
4. Select category: **Integration**
5. Click **Add**, then find "Vanlife Tracker" and click **Download**
6. Restart Home Assistant

### Manual

1. Copy the `custom_components/vanlife_tracker` folder to your HA `config/custom_components/` directory
2. Restart Home Assistant

## Configuration

After installation and restart:

1. Go to **Settings → Devices & Services → Add Integration**
2. Search for "Vanlife Tracker"
3. **Step 1 — GPS & Movement:**
   - **GPS entity** (required): A `device_tracker` or sensor with `latitude`/`longitude` attributes (e.g. Starlink GPS, phone tracker)
   - **Vehicle moving sensor** (optional): A `binary_sensor` that is `on` when the vehicle is in motion
   - **Weather entity** (optional): A `weather` entity to capture conditions at each stop
   - **Stop delay**: Minutes the van must be stopped before an auto-stop is created (default: 30)
   - **Enable geocoding**: Auto-name stops by nearest town via Nominatim
4. **Step 2 — Traccar (optional):**
   - Enable Traccar route tracking
   - Set server URL, device ID, and publish interval

## Entities

| Entity | Type | Description |
|---|---|---|
| `sensor.vanlife_tracker_trip_statistics` | Sensor | Total stops count + trip stats as attributes |
| `sensor.vanlife_tracker_current_stop` | Sensor | Current stop name, or "Traveling" / "No active stop" |
| `sensor.vanlife_tracker_recent_stops` | Sensor | Count of recent stops; last 10 in `stops` attribute |
| `device_tracker.vanlife_tracker_van_location` | Device Tracker | Van on the map with stop info attributes |

## Services

| Service | Description |
|---|---|
| `vanlife_tracker.create_stop` | Create a stop manually (name, coordinates, notes, rating, category) |
| `vanlife_tracker.update_stop` | Update an existing stop |
| `vanlife_tracker.delete_stop` | Delete a stop by ID |
| `vanlife_tracker.depart_current_stop` | Mark current stop as departed |
| `vanlife_tracker.get_stops` | Query stops (fires `vanlife_tracker_stops_response` event) |
| `vanlife_tracker.export_gpx` | Export all stops to `/config/www/vanlife_stops.gpx` |

## Stop Categories

- Free Camping / Boondocking
- Paid Campground
- Walmart / Parking Lot
- BLM Land
- National Forest
- Rest Area
- Friend / Family
- Urban
- Trailhead
- Other

## Events

| Event | When |
|---|---|
| `vanlife_tracker_stop_created` | A new stop is created (auto or manual) |
| `vanlife_tracker_stop_departed` | The van departs from a stop |
| `vanlife_tracker_stop_updated` | A stop's details are changed |
| `vanlife_tracker_stops_response` | Response to `get_stops` service call |
| `vanlife_tracker_gpx_exported` | GPX file written to disk |

## Database

All stops are stored in `config/vanlife_tracker.db` (SQLite, WAL mode). The database is created automatically on first setup. Back it up periodically if you care about your stop history.

## License

MIT

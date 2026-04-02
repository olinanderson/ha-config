"""
save_campsite.py — Save or update a campsite stop record.

Called from HA automations/scripts via python_script.save_campsite.
Stores campsite data in a JSON file at /config/travel/campsites.json.

Data fields:
  - id:             Auto-generated UUID or passed in
  - lat, lon:       GPS coordinates
  - elevation:      Meters (from Starlink)
  - arrived_at:     ISO timestamp
  - departed_at:    ISO timestamp or null (still here)
  - name:           Campsite name (user-entered or auto "Stop #N")
  - notes:          Free-text notes
  - rating:         1–5 stars (0 = unrated)
  - category:       free | paid | walmart | blm | national_forest | friend | other
  - weather:        Auto-filled weather summary at arrival
  - temp_high:      Forecast high at arrival
  - temp_low:       Forecast low at arrival
  - nearest_town:   Reverse-geocoded (via Nominatim)
  - auto_detected:  true if created by automation, false if manual
"""
import json
import os
import uuid
from datetime import datetime

# --- Config ---
CAMPSITES_FILE = "/config/travel/campsites.json"

def load_campsites():
    """Load existing campsites from JSON file."""
    if os.path.exists(CAMPSITES_FILE):
        with open(CAMPSITES_FILE, "r") as f:
            return json.load(f)
    return []

def save_campsites(campsites):
    """Save campsites to JSON file."""
    os.makedirs(os.path.dirname(CAMPSITES_FILE), exist_ok=True)
    with open(CAMPSITES_FILE, "w") as f:
        json.dump(campsites, f, indent=2, default=str)

# --- Get input data from HA ---
action = data.get("action", "create")  # create | update | delete
stop_id = data.get("id", None)
lat = data.get("lat", 0)
lon = data.get("lon", 0)
elevation = data.get("elevation", 0)
name = data.get("name", "")
notes = data.get("notes", "")
rating = data.get("rating", 0)
category = data.get("category", "other")
weather = data.get("weather", "")
temp_high = data.get("temp_high", "")
temp_low = data.get("temp_low", "")
nearest_town = data.get("nearest_town", "")
auto_detected = data.get("auto_detected", False)
departed_at = data.get("departed_at", None)

campsites = load_campsites()

if action == "create":
    # Generate a new stop
    new_id = str(uuid.uuid4())[:8]
    stop_number = len(campsites) + 1
    if not name:
        name = f"Stop #{stop_number}"

    new_stop = {
        "id": new_id,
        "lat": float(lat),
        "lon": float(lon),
        "elevation": float(elevation) if elevation else 0,
        "arrived_at": datetime.now().isoformat(),
        "departed_at": None,
        "name": name,
        "notes": notes,
        "rating": int(rating),
        "category": category,
        "weather": weather,
        "temp_high": str(temp_high),
        "temp_low": str(temp_low),
        "nearest_town": nearest_town,
        "auto_detected": bool(auto_detected),
    }
    campsites.append(new_stop)
    save_campsites(campsites)
    logger.info(f"Campsite saved: {new_stop['name']} ({new_id}) at {lat},{lon}")

elif action == "update":
    # Update an existing stop by ID
    if not stop_id:
        logger.error("save_campsite: 'update' action requires 'id'")
    else:
        for stop in campsites:
            if stop["id"] == stop_id:
                if name:
                    stop["name"] = name
                if notes:
                    stop["notes"] = notes
                if rating:
                    stop["rating"] = int(rating)
                if category:
                    stop["category"] = category
                if departed_at:
                    stop["departed_at"] = departed_at
                break
        save_campsites(campsites)
        logger.info(f"Campsite updated: {stop_id}")

elif action == "update_latest":
    # Update the most recent stop (convenience for automations)
    if campsites:
        latest = campsites[-1]
        if name:
            latest["name"] = name
        if notes:
            latest["notes"] = notes
        if rating:
            latest["rating"] = int(rating)
        if category:
            latest["category"] = category
        if departed_at:
            latest["departed_at"] = departed_at
        save_campsites(campsites)
        logger.info(f"Latest campsite updated: {latest['id']}")

elif action == "depart_latest":
    # Mark the most recent stop as departed
    if campsites and not campsites[-1].get("departed_at"):
        campsites[-1]["departed_at"] = datetime.now().isoformat()
        save_campsites(campsites)
        logger.info(f"Departed from: {campsites[-1]['name']}")

elif action == "delete":
    if stop_id:
        campsites = [s for s in campsites if s["id"] != stop_id]
        save_campsites(campsites)
        logger.info(f"Campsite deleted: {stop_id}")


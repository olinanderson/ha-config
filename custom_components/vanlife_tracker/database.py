"""SQLite database layer for Vanlife Tracker stops/campsites."""

from __future__ import annotations

import aiosqlite
import logging
import os
from datetime import datetime
from typing import Any

_LOGGER = logging.getLogger(__name__)

SCHEMA_VERSION = 1

CREATE_STOPS_TABLE = """
CREATE TABLE IF NOT EXISTS stops (
    id          TEXT PRIMARY KEY,
    lat         REAL NOT NULL,
    lon         REAL NOT NULL,
    elevation   REAL DEFAULT 0,
    arrived_at  TEXT NOT NULL,
    departed_at TEXT,
    name        TEXT NOT NULL,
    notes       TEXT DEFAULT '',
    rating      INTEGER DEFAULT 0,
    category    TEXT DEFAULT 'other',
    weather     TEXT DEFAULT '',
    temp_high   TEXT DEFAULT '',
    temp_low    TEXT DEFAULT '',
    nearest_town TEXT DEFAULT '',
    auto_detected INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
"""

CREATE_TRIPS_TABLE = """
CREATE TABLE IF NOT EXISTS trips (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    started_at  TEXT NOT NULL,
    ended_at    TEXT,
    notes       TEXT DEFAULT '',
    created_at  TEXT NOT NULL
);
"""

CREATE_META_TABLE = """
CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT
);
"""

CREATE_NAMED_PLACES_TABLE = """
CREATE TABLE IF NOT EXISTS named_places (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    lat         REAL NOT NULL,
    lon         REAL NOT NULL,
    radius_m    REAL NOT NULL DEFAULT 200,
    icon        TEXT DEFAULT 'mdi:map-marker',
    category    TEXT DEFAULT 'other',
    notes       TEXT DEFAULT '',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
"""

SCHEMA_VERSION = 2


class VanlifeDatabase:
    """Async SQLite database for vanlife stop/campsite tracking."""

    def __init__(self, db_path: str) -> None:
        """Initialize the database."""
        self._db_path = db_path
        self._db: aiosqlite.Connection | None = None

    async def async_setup(self) -> None:
        """Create/open the database and ensure schema exists."""
        os.makedirs(os.path.dirname(self._db_path), exist_ok=True)
        self._db = await aiosqlite.connect(self._db_path)
        self._db.row_factory = aiosqlite.Row
        await self._db.execute("PRAGMA journal_mode=WAL")
        await self._db.execute("PRAGMA foreign_keys=ON")
        await self._db.execute(CREATE_STOPS_TABLE)
        await self._db.execute(CREATE_TRIPS_TABLE)
        await self._db.execute(CREATE_META_TABLE)
        await self._db.execute(CREATE_NAMED_PLACES_TABLE)
        await self._db.commit()

        # Check/migrate schema version
        async with self._db.execute(
            "SELECT value FROM meta WHERE key = 'schema_version'"
        ) as cursor:
            row = await cursor.fetchone()
            existing_version = int(row["value"]) if row else 0

        if existing_version < 2:
            # v2: named_places table (already created above if not exists)
            await self._db.execute(
                "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '2')"
            )
            await self._db.commit()
            _LOGGER.info("Vanlife Tracker DB migrated to schema v2")

        _LOGGER.info("Vanlife Tracker database ready at %s", self._db_path)

    async def async_close(self) -> None:
        """Close the database connection."""
        if self._db:
            await self._db.close()
            self._db = None

    # ─── Stop CRUD ────────────────────────────────────────────

    async def async_create_stop(self, stop_data: dict[str, Any]) -> dict[str, Any]:
        """Create a new stop record. Returns the created stop."""
        now = datetime.now().isoformat()
        stop_id = stop_data.get("id", _generate_id())
        count = await self.async_get_stop_count()

        stop = {
            "id": stop_id,
            "lat": float(stop_data.get("lat", 0)),
            "lon": float(stop_data.get("lon", 0)),
            "elevation": float(stop_data.get("elevation", 0)),
            "arrived_at": stop_data.get("arrived_at", now),
            "departed_at": stop_data.get("departed_at"),
            "name": stop_data.get("name") or f"Stop #{count + 1}",
            "notes": stop_data.get("notes", ""),
            "rating": int(stop_data.get("rating", 0)),
            "category": stop_data.get("category", "other"),
            "weather": stop_data.get("weather", ""),
            "temp_high": str(stop_data.get("temp_high", "")),
            "temp_low": str(stop_data.get("temp_low", "")),
            "nearest_town": stop_data.get("nearest_town", ""),
            "auto_detected": 1 if stop_data.get("auto_detected") else 0,
            "created_at": now,
            "updated_at": now,
        }

        await self._db.execute(
            """INSERT INTO stops
               (id, lat, lon, elevation, arrived_at, departed_at, name, notes,
                rating, category, weather, temp_high, temp_low, nearest_town,
                auto_detected, created_at, updated_at)
               VALUES (:id, :lat, :lon, :elevation, :arrived_at, :departed_at,
                       :name, :notes, :rating, :category, :weather, :temp_high,
                       :temp_low, :nearest_town, :auto_detected, :created_at,
                       :updated_at)""",
            stop,
        )
        await self._db.commit()
        _LOGGER.info("Created stop: %s (%s)", stop["name"], stop_id)
        return stop

    async def async_update_stop(
        self, stop_id: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Update an existing stop. Returns the updated stop or None."""
        existing = await self.async_get_stop(stop_id)
        if existing is None:
            _LOGGER.warning("Stop %s not found for update", stop_id)
            return None

        # Build SET clause dynamically from provided updates
        allowed_fields = {
            "name", "notes", "rating", "category", "departed_at",
            "weather", "temp_high", "temp_low", "nearest_town",
            "lat", "lon", "elevation",
        }
        filtered = {k: v for k, v in updates.items() if k in allowed_fields and v is not None}
        if not filtered:
            return existing

        filtered["updated_at"] = datetime.now().isoformat()
        set_clause = ", ".join(f"{k} = :{k}" for k in filtered)
        filtered["id"] = stop_id

        await self._db.execute(
            f"UPDATE stops SET {set_clause} WHERE id = :id", filtered
        )
        await self._db.commit()
        return await self.async_get_stop(stop_id)

    async def async_delete_stop(self, stop_id: str) -> bool:
        """Delete a stop by ID. Returns True if deleted."""
        cursor = await self._db.execute(
            "DELETE FROM stops WHERE id = ?", (stop_id,)
        )
        await self._db.commit()
        return cursor.rowcount > 0

    async def async_get_stop(self, stop_id: str) -> dict[str, Any] | None:
        """Get a single stop by ID."""
        async with self._db.execute(
            "SELECT * FROM stops WHERE id = ?", (stop_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def async_get_current_stop(self) -> dict[str, Any] | None:
        """Get the most recent stop that hasn't been departed."""
        async with self._db.execute(
            "SELECT * FROM stops WHERE departed_at IS NULL ORDER BY arrived_at DESC LIMIT 1"
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def async_get_latest_stop(self) -> dict[str, Any] | None:
        """Get the most recently created stop (regardless of departure)."""
        async with self._db.execute(
            "SELECT * FROM stops ORDER BY arrived_at DESC LIMIT 1"
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def async_get_stops(
        self,
        limit: int = 100,
        offset: int = 0,
        category: str | None = None,
        min_rating: int | None = None,
    ) -> list[dict[str, Any]]:
        """Get stops with optional filtering."""
        query = "SELECT * FROM stops WHERE 1=1"
        params: list[Any] = []

        if category:
            query += " AND category = ?"
            params.append(category)
        if min_rating is not None:
            query += " AND rating >= ?"
            params.append(min_rating)

        query += " ORDER BY arrived_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        async with self._db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def async_get_stop_count(self) -> int:
        """Get total number of stops."""
        async with self._db.execute("SELECT COUNT(*) as cnt FROM stops") as cursor:
            row = await cursor.fetchone()
            return row["cnt"] if row else 0

    async def async_depart_current_stop(self) -> dict[str, Any] | None:
        """Mark the current (undeparted) stop as departed. Returns it."""
        current = await self.async_get_current_stop()
        if current is None:
            _LOGGER.info("No current stop to depart from")
            return None
        return await self.async_update_stop(
            current["id"], {"departed_at": datetime.now().isoformat()}
        )

    async def async_get_all_stops_for_export(self) -> list[dict[str, Any]]:
        """Get all stops ordered chronologically for GPX export."""
        async with self._db.execute(
            "SELECT * FROM stops ORDER BY arrived_at ASC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # ─── Stats ────────────────────────────────────────────────

    async def async_get_stats(self) -> dict[str, Any]:
        """Get aggregate travel statistics."""
        total = await self.async_get_stop_count()

        # Days on the road: from first stop to now
        async with self._db.execute(
            "SELECT MIN(arrived_at) as first_arrival FROM stops"
        ) as cursor:
            row = await cursor.fetchone()
            first = row["first_arrival"] if row else None

        days_on_road = 0
        if first:
            try:
                first_dt = datetime.fromisoformat(first)
                days_on_road = (datetime.now() - first_dt).days
            except (ValueError, TypeError):
                pass

        # Average rating (excluding unrated)
        async with self._db.execute(
            "SELECT AVG(rating) as avg_rating FROM stops WHERE rating > 0"
        ) as cursor:
            row = await cursor.fetchone()
            avg_rating = round(row["avg_rating"], 1) if row and row["avg_rating"] else 0

        # Category breakdown
        async with self._db.execute(
            "SELECT category, COUNT(*) as cnt FROM stops GROUP BY category"
        ) as cursor:
            rows = await cursor.fetchall()
            categories = {row["category"]: row["cnt"] for row in rows}

        return {
            "total_stops": total,
            "days_on_road": days_on_road,
            "avg_rating": avg_rating,
            "categories": categories,
        }

    # ─── Named Places CRUD ────────────────────────────────────

    async def async_create_named_place(self, data: dict[str, Any]) -> dict[str, Any]:
        """Create a named place (home, climbing gym, etc.)."""
        now = datetime.now().isoformat()
        place = {
            "id": data.get("id", _generate_id()),
            "name": data["name"],
            "lat": float(data["lat"]),
            "lon": float(data["lon"]),
            "radius_m": float(data.get("radius_m", 200)),
            "icon": data.get("icon", "mdi:map-marker"),
            "category": data.get("category", "other"),
            "notes": data.get("notes", ""),
            "created_at": now,
            "updated_at": now,
        }
        await self._db.execute(
            """INSERT INTO named_places
               (id, name, lat, lon, radius_m, icon, category, notes, created_at, updated_at)
               VALUES (:id, :name, :lat, :lon, :radius_m, :icon, :category, :notes,
                       :created_at, :updated_at)""",
            place,
        )
        await self._db.commit()
        return place

    async def async_update_named_place(
        self, place_id: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Update a named place."""
        allowed = {"name", "lat", "lon", "radius_m", "icon", "category", "notes"}
        filtered = {k: v for k, v in updates.items() if k in allowed and v is not None}
        if not filtered:
            return await self.async_get_named_place(place_id)
        filtered["updated_at"] = datetime.now().isoformat()
        filtered["id"] = place_id
        set_clause = ", ".join(f"{k} = :{k}" for k in filtered if k != "id")
        await self._db.execute(
            f"UPDATE named_places SET {set_clause} WHERE id = :id", filtered
        )
        await self._db.commit()
        return await self.async_get_named_place(place_id)

    async def async_delete_named_place(self, place_id: str) -> bool:
        """Delete a named place."""
        cursor = await self._db.execute(
            "DELETE FROM named_places WHERE id = ?", (place_id,)
        )
        await self._db.commit()
        return cursor.rowcount > 0

    async def async_get_named_place(self, place_id: str) -> dict[str, Any] | None:
        """Get a single named place by ID."""
        async with self._db.execute(
            "SELECT * FROM named_places WHERE id = ?", (place_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def async_get_named_places(self) -> list[dict[str, Any]]:
        """Get all named places."""
        async with self._db.execute(
            "SELECT * FROM named_places ORDER BY name ASC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def async_find_named_place_at(
        self, lat: float, lon: float
    ) -> dict[str, Any] | None:
        """Find the closest named place within its radius. Returns None if none match."""
        places = await self.async_get_named_places()
        best: dict[str, Any] | None = None
        best_dist = float("inf")
        for place in places:
            dist = _haversine_m(lat, lon, place["lat"], place["lon"])
            if dist <= place["radius_m"] and dist < best_dist:
                best_dist = dist
                best = place
        return best


def _generate_id() -> str:
    """Generate a short unique ID for a stop."""
    import uuid
    return uuid.uuid4().hex[:8]


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in meters between two lat/lon points."""
    import math
    R = 6_371_000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

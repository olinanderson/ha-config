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

CREATE_GPS_TRACK_TABLE = """
CREATE TABLE IF NOT EXISTS gps_track (
    ts      REAL NOT NULL,
    lat     REAL NOT NULL,
    lon     REAL NOT NULL,
    source  TEXT NOT NULL DEFAULT 'live'
);
CREATE UNIQUE INDEX IF NOT EXISTS gps_track_ts_source ON gps_track (ts, source);
CREATE INDEX IF NOT EXISTS gps_track_ts ON gps_track (ts);
"""

CREATE_COMPUTED_TRIPS_TABLE = """
CREATE TABLE IF NOT EXISTS computed_trips (
    id          TEXT PRIMARY KEY,
    start_ts    REAL NOT NULL,
    end_ts      REAL,
    from_stop_id TEXT,
    to_stop_id  TEXT,
    distance_m  REAL DEFAULT 0,
    duration_s  REAL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS computed_trips_start ON computed_trips (start_ts);
CREATE INDEX IF NOT EXISTS computed_trips_end ON computed_trips (end_ts);
"""

SCHEMA_VERSION = 5


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
        # gps_track: CREATE TABLE + two indexes need separate execute calls
        for stmt in CREATE_GPS_TRACK_TABLE.strip().split(";"):
            stmt = stmt.strip()
            if stmt:
                await self._db.execute(stmt)
        # computed_trips: CREATE TABLE + two indexes
        for stmt in CREATE_COMPUTED_TRIPS_TABLE.strip().split(";"):
            stmt = stmt.strip()
            if stmt:
                await self._db.execute(stmt)
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

        if existing_version < 3:
            # v3: gps_track table (already created above if not exists)
            await self._db.execute(
                "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '3')"
            )
            await self._db.commit()
            _LOGGER.info("Vanlife Tracker DB migrated to schema v3 (gps_track)")

        if existing_version < 4:
            # v4: fuel columns on stops table
            for col in ("fuel_pct_arrive", "fuel_pct_depart"):
                try:
                    await self._db.execute(
                        f"ALTER TABLE stops ADD COLUMN {col} REAL DEFAULT NULL"
                    )
                except Exception:  # noqa: BLE001
                    pass  # column already exists
            await self._db.execute(
                "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '4')"
            )
            await self._db.commit()
            _LOGGER.info("Vanlife Tracker DB migrated to schema v4 (fuel columns)")

        if existing_version < 5:
            # v5: computed_trips table (already created above if not exists)
            await self._db.execute(
                "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '5')"
            )
            await self._db.commit()
            _LOGGER.info("Vanlife Tracker DB migrated to schema v5 (computed_trips)")

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
            "fuel_pct_arrive": stop_data.get("fuel_pct_arrive"),
            "fuel_pct_depart": stop_data.get("fuel_pct_depart"),
            "created_at": now,
            "updated_at": now,
        }

        await self._db.execute(
            """INSERT INTO stops
               (id, lat, lon, elevation, arrived_at, departed_at, name, notes,
                rating, category, weather, temp_high, temp_low, nearest_town,
                auto_detected, fuel_pct_arrive, fuel_pct_depart,
                created_at, updated_at)
               VALUES (:id, :lat, :lon, :elevation, :arrived_at, :departed_at,
                       :name, :notes, :rating, :category, :weather, :temp_high,
                       :temp_low, :nearest_town, :auto_detected,
                       :fuel_pct_arrive, :fuel_pct_depart,
                       :created_at, :updated_at)""",
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
            "fuel_pct_arrive", "fuel_pct_depart",
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

    # ─── Computed Trips ───────────────────────────────────────

    async def async_create_trip(self, trip_data: dict[str, Any]) -> dict[str, Any]:
        """Create a new computed trip record."""
        now = datetime.now().isoformat()
        trip = {
            "id": trip_data.get("id", _generate_id()),
            "start_ts": float(trip_data["start_ts"]),
            "end_ts": float(trip_data["end_ts"]) if trip_data.get("end_ts") else None,
            "from_stop_id": trip_data.get("from_stop_id"),
            "to_stop_id": trip_data.get("to_stop_id"),
            "distance_m": float(trip_data.get("distance_m", 0)),
            "duration_s": float(trip_data.get("duration_s", 0)),
            "created_at": now,
            "updated_at": now,
        }
        await self._db.execute(
            """INSERT INTO computed_trips
               (id, start_ts, end_ts, from_stop_id, to_stop_id,
                distance_m, duration_s, created_at, updated_at)
               VALUES (:id, :start_ts, :end_ts, :from_stop_id, :to_stop_id,
                       :distance_m, :duration_s, :created_at, :updated_at)""",
            trip,
        )
        await self._db.commit()
        return trip

    async def async_update_trip(
        self, trip_id: str, updates: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Update fields on an existing trip."""
        allowed = {"end_ts", "from_stop_id", "to_stop_id", "distance_m", "duration_s"}
        filtered = {k: v for k, v in updates.items() if k in allowed}
        if not filtered:
            return await self.async_get_trip(trip_id)
        filtered["updated_at"] = datetime.now().isoformat()
        filtered["id"] = trip_id
        set_clause = ", ".join(f"{k} = :{k}" for k in filtered if k != "id")
        await self._db.execute(
            f"UPDATE computed_trips SET {set_clause} WHERE id = :id", filtered
        )
        await self._db.commit()
        return await self.async_get_trip(trip_id)

    async def async_get_trip(self, trip_id: str) -> dict[str, Any] | None:
        """Get a single trip by ID."""
        async with self._db.execute(
            "SELECT * FROM computed_trips WHERE id = ?", (trip_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def async_get_trips(
        self, start_ts: float, end_ts: float
    ) -> list[dict[str, Any]]:
        """Get trips that overlap with [start_ts, end_ts]."""
        async with self._db.execute(
            """SELECT * FROM computed_trips
               WHERE start_ts <= ? AND (end_ts IS NULL OR end_ts >= ?)
               ORDER BY start_ts ASC""",
            (end_ts, start_ts),
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def async_get_current_trip(self) -> dict[str, Any] | None:
        """Get the most recent trip that hasn't ended (currently driving)."""
        async with self._db.execute(
            "SELECT * FROM computed_trips WHERE end_ts IS NULL ORDER BY start_ts DESC LIMIT 1"
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def async_delete_trip(self, trip_id: str) -> bool:
        """Delete a trip by ID."""
        cursor = await self._db.execute(
            "DELETE FROM computed_trips WHERE id = ?", (trip_id,)
        )
        await self._db.commit()
        return cursor.rowcount > 0

    async def async_delete_trips_in_range(
        self, start_ts: float, end_ts: float
    ) -> int:
        """Delete all trips starting within [start_ts, end_ts]. Returns count."""
        cursor = await self._db.execute(
            "DELETE FROM computed_trips WHERE start_ts >= ? AND start_ts <= ?",
            (start_ts, end_ts),
        )
        await self._db.commit()
        return cursor.rowcount

    async def async_link_latest_trip_to_stop(self, stop_id: str) -> bool:
        """Link the most recent ended trip (with no to_stop) to a destination stop."""
        cursor = await self._db.execute(
            """UPDATE computed_trips SET to_stop_id = ?, updated_at = ?
               WHERE id = (
                   SELECT id FROM computed_trips
                   WHERE end_ts IS NOT NULL AND to_stop_id IS NULL
                   ORDER BY end_ts DESC LIMIT 1
               )""",
            (stop_id, datetime.now().isoformat()),
        )
        await self._db.commit()
        return cursor.rowcount > 0

    # ─── GPS track ────────────────────────────────────────────

    async def async_insert_gps_points(
        self, points: list[dict[str, Any]], source: str = "live"
    ) -> int:
        """Bulk-insert GPS track points. Each point needs ts (unix float), lat, lon.
        Silently ignores duplicates (same ts+source). Returns count inserted."""
        if not points:
            return 0
        rows = [(p["ts"], p["lat"], p["lon"], source) for p in points]
        await self._db.executemany(
            "INSERT OR IGNORE INTO gps_track (ts, lat, lon, source) VALUES (?, ?, ?, ?)",
            rows,
        )
        await self._db.commit()
        return len(rows)

    async def async_get_gps_track(
        self, start_ts: float, end_ts: float, max_points: int = 0
    ) -> list[dict[str, Any]]:
        """Return GPS points in [start_ts, end_ts] ordered by ts.

        If max_points > 0, downsample by grouping into time buckets and
        returning one representative point per bucket.  This keeps the SQL
        index on ``ts`` effective while capping the result set size.
        """
        if max_points > 0:
            span = end_ts - start_ts
            bucket = max(1.0, span / max_points)
            async with self._db.execute(
                "SELECT MIN(ts) AS ts, "
                "       AVG(lat) AS lat, "
                "       AVG(lon) AS lon "
                "FROM gps_track "
                "WHERE ts >= ? AND ts <= ? "
                "GROUP BY CAST(ts / ? AS INTEGER) "
                "ORDER BY ts ASC",
                (start_ts, end_ts, bucket),
            ) as cursor:
                rows = await cursor.fetchall()
                return [{"ts": row[0], "lat": row[1], "lon": row[2]} for row in rows]

        async with self._db.execute(
            "SELECT ts, lat, lon FROM gps_track WHERE ts >= ? AND ts <= ? ORDER BY ts ASC",
            (start_ts, end_ts),
        ) as cursor:
            rows = await cursor.fetchall()
            return [{"ts": row[0], "lat": row[1], "lon": row[2]} for row in rows]


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

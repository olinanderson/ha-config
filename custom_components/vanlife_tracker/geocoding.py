"""Reverse geocoding via OpenStreetMap Nominatim (no API key needed)."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp

_LOGGER = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
USER_AGENT = "VanlifeTracker/0.1 HomeAssistant"

# Rate limit: max 1 request per second per Nominatim policy
_last_request_time: float = 0
_RATE_LIMIT_SECONDS = 1.1


async def async_reverse_geocode(
    lat: float, lon: float, session: aiohttp.ClientSession | None = None
) -> dict[str, Any]:
    """Reverse geocode coordinates to a location summary.

    Returns dict with:
      - display_name: Full formatted address
      - nearest_town: City/town/village name
      - state: State/province
      - country: Country
      - county: County
      - road: Road name (if available)
    """
    global _last_request_time

    # Rate limiting
    now = asyncio.get_event_loop().time()
    wait = _RATE_LIMIT_SECONDS - (now - _last_request_time)
    if wait > 0:
        await asyncio.sleep(wait)

    params = {
        "lat": str(lat),
        "lon": str(lon),
        "format": "jsonv2",
        "addressdetails": "1",
        "zoom": "16",
    }
    headers = {"User-Agent": USER_AGENT}

    close_session = False
    if session is None:
        session = aiohttp.ClientSession()
        close_session = True

    try:
        async with session.get(
            NOMINATIM_URL, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=10)
        ) as resp:
            _last_request_time = asyncio.get_event_loop().time()
            if resp.status != 200:
                _LOGGER.warning("Nominatim returned status %s", resp.status)
                return _empty_result()

            data = await resp.json()
            address = data.get("address", {})

            # Extract the "nearest town" — try city > town > village > hamlet
            nearest_town = (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("hamlet")
                or address.get("municipality")
                or address.get("county")
                or "Unknown"
            )

            state = address.get("state", "")
            country = address.get("country", "")

            # Build a short human-friendly label — include road if available
            road = address.get("road", "")
            if road:
                parts = [p for p in [road, nearest_town] if p]
            else:
                parts = [p for p in [nearest_town, state] if p]
            short_name = ", ".join(parts) if parts else data.get("display_name", "Unknown")

            return {
                "display_name": data.get("display_name", ""),
                "nearest_town": nearest_town,
                "short_name": short_name,
                "state": state,
                "country": country,
                "county": address.get("county", ""),
                "road": address.get("road", ""),
            }

    except (aiohttp.ClientError, asyncio.TimeoutError) as err:
        _LOGGER.warning("Reverse geocoding failed: %s", err)
        return _empty_result()
    finally:
        if close_session:
            await session.close()


def _empty_result() -> dict[str, Any]:
    """Return empty geocode result."""
    return {
        "display_name": "",
        "nearest_town": "Unknown",
        "short_name": "Unknown",
        "state": "",
        "country": "",
        "county": "",
        "road": "",
    }

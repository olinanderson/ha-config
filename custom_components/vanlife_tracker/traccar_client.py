"""Traccar integration — push GPS coordinates to a Traccar server."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp

_LOGGER = logging.getLogger(__name__)


class TraccarClient:
    """Client for pushing GPS positions to Traccar via OsmAnd protocol."""

    def __init__(
        self,
        base_url: str,
        device_id: str,
        session: aiohttp.ClientSession | None = None,
    ) -> None:
        """Initialize the Traccar client.

        Args:
            base_url: Traccar server URL (e.g. http://localhost:8082)
            device_id: Unique device identifier in Traccar
            session: Optional aiohttp session (will create one if not provided)
        """
        self._base_url = base_url.rstrip("/")
        self._device_id = device_id
        self._session = session
        self._own_session = session is None

    async def async_init_session(self) -> None:
        """Create an aiohttp session if we don't have one."""
        if self._session is None:
            self._session = aiohttp.ClientSession()
            self._own_session = True

    async def async_close(self) -> None:
        """Close the session if we created it."""
        if self._own_session and self._session:
            await self._session.close()
            self._session = None

    async def async_send_position(
        self,
        lat: float,
        lon: float,
        altitude: float = 0,
        speed: float = 0,
        bearing: float = 0,
        accuracy: float = 0,
        timestamp: int | None = None,
    ) -> bool:
        """Send a GPS position to Traccar using the OsmAnd protocol.

        This is the simplest Traccar API — just an HTTP GET with query params.
        Traccar auto-creates the device if it doesn't exist.

        Returns True on success.
        """
        if self._session is None:
            await self.async_init_session()

        if timestamp is None:
            import time
            timestamp = int(time.time())

        # OsmAnd protocol endpoint
        url = f"{self._base_url}"
        params = {
            "id": self._device_id,
            "lat": str(lat),
            "lon": str(lon),
            "altitude": str(altitude),
            "speed": str(speed),
            "bearing": str(bearing),
            "accuracy": str(accuracy),
            "timestamp": str(timestamp),
        }

        try:
            async with self._session.get(
                url,
                params=params,
                timeout=aiohttp.ClientTimeout(total=5),
            ) as resp:
                if resp.status == 200:
                    return True
                _LOGGER.warning(
                    "Traccar returned status %s: %s",
                    resp.status,
                    await resp.text(),
                )
                return False

        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            _LOGGER.debug("Traccar send failed: %s", err)
            return False

    async def async_check_connection(self) -> bool:
        """Check if Traccar server is reachable."""
        if self._session is None:
            await self.async_init_session()

        try:
            async with self._session.get(
                self._base_url,
                timeout=aiohttp.ClientTimeout(total=5),
            ) as resp:
                return resp.status in (200, 302, 400)
        except (aiohttp.ClientError, asyncio.TimeoutError):
            return False

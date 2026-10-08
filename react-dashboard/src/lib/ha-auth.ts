/**
 * A current HA access token for REST calls that go through HA (/api/...).
 *
 * HA access tokens last 30 minutes, and the HA frontend only renews its token
 * when it reconnects the websocket or makes a REST call of its own. A tab left
 * open, often hidden, keeps polling with the old token, and HA logs each of
 * those requests as a failed login. Remote use goes through Nabu Casa, so
 * that's "invalid authentication from localhost (127.0.0.1)", every 5 min,
 * and the card gets no data. So renew the token first when it's at or near its
 * end, as HA's own fetchWithAuth does.
 */

interface HassAuthLike {
  data?: { access_token?: string; expires?: number };
  refreshAccessToken?: () => Promise<void>;
}

/** Renew this long before the token runs out, so it can't expire in flight. */
const RENEW_BEFORE_MS = 60_000;

let renewing: Promise<void> | null = null;

const currentAuth = (): HassAuthLike | undefined =>
  (window as { __HASS__?: { auth?: HassAuthLike } }).__HASS__?.auth;

/** Resolves once __HASS__ has a token, or after 5 s. */
function waitForHass(): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timeout);
      window.removeEventListener('hass-updated', handler);
      resolve();
    };
    const handler = () => {
      if (currentAuth()?.data?.access_token) done();
    };
    const timeout = setTimeout(done, 5000);
    window.addEventListener('hass-updated', handler);
  });
}

/**
 * The access token, renewed first if it's about to expire. Null when there is
 * none, or the renewal failed (signed out): callers then skip the request
 * rather than send one HA would log as a failed login.
 */
export async function haAccessToken(): Promise<string | null> {
  if (!currentAuth()?.data?.access_token) await waitForHass();
  const auth = currentAuth();
  if (!auth?.data?.access_token) return null;

  // Dev mode (main.tsx) uses a long-lived token: no expiry and nothing to renew.
  const expires = auth.data.expires;
  if (typeof expires === 'number' && auth.refreshAccessToken && Date.now() > expires - RENEW_BEFORE_MS) {
    // One renewal for all the requests that find the token old at once.
    renewing ??= auth.refreshAccessToken().finally(() => {
      renewing = null;
    });
    try {
      await renewing;
    } catch {
      return null;
    }
  }
  // refreshAccessToken() replaces auth.data
  return auth.data?.access_token ?? null;
}

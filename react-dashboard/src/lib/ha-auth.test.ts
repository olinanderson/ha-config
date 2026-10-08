import { haAccessToken } from './ha-auth';

/** HA's Auth object, as far as haAccessToken uses it. */
function setAuth(token: string, expiresInMs: number | undefined, renew?: () => Promise<string>) {
  const auth = {
    data: { access_token: token, expires: expiresInMs === undefined ? undefined : Date.now() + expiresInMs },
    refreshAccessToken: renew
      ? vi.fn(async () => {
          // Like home-assistant-js-websocket: the new token replaces auth.data
          auth.data = { access_token: await renew(), expires: Date.now() + 1_800_000 };
        })
      : undefined,
  };
  (window as { __HASS__?: unknown }).__HASS__ = { auth };
  return auth;
}

afterEach(() => {
  delete (window as { __HASS__?: unknown }).__HASS__;
});

describe('haAccessToken', () => {
  it('returns a token that has time left as it is', async () => {
    const auth = setAuth('fresh', 10 * 60_000, async () => 'renewed');
    expect(await haAccessToken()).toBe('fresh');
    expect(auth.refreshAccessToken).not.toHaveBeenCalled();
  });

  it('renews an expired token once for requests made together', async () => {
    const auth = setAuth('old', -5 * 60_000, async () => 'renewed');
    expect(await Promise.all([haAccessToken(), haAccessToken()])).toEqual(['renewed', 'renewed']);
    expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('renews a token in its last minute', async () => {
    setAuth('old', 30_000, async () => 'renewed');
    expect(await haAccessToken()).toBe('renewed');
  });

  it('gives null, not the old token, when renewing fails', async () => {
    setAuth('old', -1, async () => {
      throw new Error('invalid_grant');
    });
    expect(await haAccessToken()).toBeNull();
  });

  it('uses the dev-mode token, which has no expiry, as it is', async () => {
    setAuth('long-lived', undefined);
    expect(await haAccessToken()).toBe('long-lived');
  });

  it('waits for HA to hand over hass', async () => {
    const pending = haAccessToken();
    setAuth('late', 10 * 60_000);
    window.dispatchEvent(new Event('hass-updated'));
    expect(await pending).toBe('late');
  });
});

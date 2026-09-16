import { ATTACHED_EVENT, createPanelHost, type PanelHost, type Unmount } from './panel-host';

// ─── Test doubles ─────────────────────────────────────────────────────────

let panelHost: PanelHost;
let loader: 'current' | 'legacy' = 'current';

/** <van-dashboard> as the loaders build it. `current` mirrors panel-loader.js;
 *  `legacy` mirrors the copies still cached in browsers (2 s teardown that
 *  clears the element, remount whenever .van-dash-root is missing). */
class TestDashboard extends HTMLElement {
  release: Unmount | null = null;
  container: HTMLDivElement | null = null;
  mounting = false;
  teardown: ReturnType<typeof setTimeout> | undefined;
  private hassValue: unknown;

  set hass(value: unknown) {
    this.hassValue = value;
    (window as { __HASS__?: unknown }).__HASS__ = value;
    if (loader === 'legacy') this.recover();
  }
  get hass() {
    return this.hassValue;
  }

  connectedCallback() {
    if (loader === 'legacy') {
      clearTimeout(this.teardown);
      this.recover();
      return;
    }
    void this.mountCurrent();
  }

  disconnectedCallback() {
    if (loader === 'legacy') {
      this.teardown = setTimeout(() => {
        if (this.isConnected) return;
        this.release?.();
        this.release = null;
        this.innerHTML = '';
      }, 2000);
      return;
    }
    const release = this.release;
    this.release = null;
    release?.();
  }

  private async mountCurrent() {
    if (this.release || this.mounting) return;
    this.mounting = true;
    await Promise.all([Promise.resolve(), Promise.resolve()]); // css + module
    this.mounting = false;
    if (this.release || !this.isConnected) return;
    if (!this.container) this.container = document.createElement('div');
    if (this.container.parentNode !== this) this.append(this.container);
    this.release = panelHost.mount(this.container);
  }

  private recover() {
    if (!this.isConnected || this.mounting) return;
    if (this.release && this.querySelector('.van-dash-root')) return;
    this.release?.();
    this.release = null;
    void this.mountLegacy();
  }

  private async mountLegacy() {
    this.mounting = true;
    this.innerHTML = '';
    await Promise.resolve(); // css
    const mountPoint = document.createElement('div');
    this.append(mountPoint);
    await Promise.resolve(); // module
    this.release = panelHost.mount(mountPoint);
    this.mounting = false;
  }
}

/** HA's <ha-panel-custom> (frontend 2026.4): empties itself when detached and
 *  only rebuilds when `panel` changes. */
class FakePanelCustom extends HTMLElement {
  _setProperties?: (props: Record<string, unknown>) => void;
  hass: unknown = { rev: 0 };
  requestUpdate = vi.fn((name?: string, oldValue?: unknown) => {
    if (name === 'panel' && oldValue === null) this.createPanel();
  });

  disconnectedCallback() {
    this._setProperties = undefined;
    while (this.lastChild) this.removeChild(this.lastChild);
  }

  /** _createPanel: the element shows up after the module script's load event. */
  createPanel() {
    setTimeout(() => {
      const el = document.createElement('van-dashboard');
      this._setProperties = (props) => Object.assign(el, props);
      Object.assign(el, { hass: this.hass });
      this.appendChild(el);
    }, 0);
  }

  /** HA pushing a new hass object down to the panel. */
  push(hass: unknown) {
    this.hass = hass;
    this._setProperties?.({ hass });
  }
}

customElements.define('van-dashboard', TestDashboard);
customElements.define('ha-panel-custom', FakePanelCustom);

// ─── Harness ──────────────────────────────────────────────────────────────

let hidden = false;
let resolver: HTMLDivElement;
let render: ReturnType<typeof vi.fn>;
let unmountTree: ReturnType<typeof vi.fn>;

const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

async function openDashboard() {
  const wrapper = document.createElement('ha-panel-custom') as FakePanelCustom;
  resolver.appendChild(wrapper);
  wrapper.createPanel();
  await vi.advanceTimersByTimeAsync(0);
  await flush();
  return wrapper;
}

/** partial-panel-resolver after the tab has been hidden for 5 minutes. */
function park(wrapper: FakePanelCustom) {
  hidden = true;
  document.dispatchEvent(new Event('visibilitychange'));
  resolver.removeChild(wrapper);
}

/** partial-panel-resolver's visibilitychange handler when the tab is shown. */
function unpark(wrapper: FakePanelCustom) {
  hidden = false;
  resolver.appendChild(wrapper);
  document.dispatchEvent(new Event('visibilitychange'));
}

const shown = (wrapper: FakePanelCustom) =>
  wrapper.querySelector('van-dashboard .app')?.textContent ?? null;

beforeEach(() => {
  vi.useFakeTimers();
  hidden = false;
  loader = 'current';
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  unmountTree = vi.fn();
  render = vi.fn((host: HTMLElement) => {
    host.innerHTML = '<p class="app">dashboard</p>';
    return unmountTree;
  });
  panelHost = createPanelHost(render as unknown as (host: HTMLElement) => Unmount);
  resolver = document.createElement('div');
  document.body.appendChild(resolver);
});

afterEach(() => {
  resolver.remove();
  vi.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe('panel host', () => {
  it('renders the app once inside the element HA shows', async () => {
    const wrapper = await openDashboard();
    expect(shown(wrapper)).toBe('dashboard');
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('marks the host so old loaders never see a blank element', async () => {
    render.mockImplementation(() => unmountTree); // React has not committed yet
    const wrapper = await openDashboard();
    expect(wrapper.querySelector('van-dashboard .van-dash-root')).not.toBeNull();
  });

  it('keeps the app alive while HA parks the panel, and refills the empty wrapper on return', async () => {
    const wrapper = await openDashboard();
    const first = wrapper.querySelector('van-dashboard');

    park(wrapper);
    expect(wrapper.children).toHaveLength(0); // what HA leaves behind
    await vi.advanceTimersByTimeAsync(30 * 60_000);
    expect(unmountTree).not.toHaveBeenCalled();

    unpark(wrapper);
    await flush();
    // Back before any timer (script load) can run: no blank frame.
    expect(shown(wrapper)).toBe('dashboard');
    expect(wrapper.querySelector('van-dashboard')).toBe(first);
    expect(wrapper.requestUpdate).toHaveBeenCalledWith('panel', null);

    // hass reaches the element we put back...
    wrapper.push({ rev: 1 });
    expect((window as { __HASS__?: unknown }).__HASS__).toEqual({ rev: 1 });

    // ...and HA's rebuilt element takes over the same tree.
    await vi.advanceTimersByTimeAsync(0);
    const dashboards = wrapper.querySelectorAll('van-dashboard');
    expect(dashboards).toHaveLength(1);
    expect(dashboards[0]).not.toBe(first);
    expect(shown(wrapper)).toBe('dashboard');
    wrapper.push({ rev: 2 });
    expect((dashboards[0] as TestDashboard).hass).toEqual({ rev: 2 });

    await vi.advanceTimersByTimeAsync(60_000);
    expect(render).toHaveBeenCalledTimes(1);
    expect(unmountTree).not.toHaveBeenCalled();
  });

  it('restores when focus arrives before HA re-attaches the wrapper', async () => {
    const wrapper = await openDashboard();
    park(wrapper);

    hidden = false;
    window.dispatchEvent(new Event('focus')); // our listener runs first...
    resolver.appendChild(wrapper); // ...then HA's once-listener re-attaches
    await flush();
    expect(shown(wrapper)).toBe('dashboard');

    await vi.advanceTimersByTimeAsync(60_000);
    expect(shown(wrapper)).toBe('dashboard');
    expect(unmountTree).not.toHaveBeenCalled();
  });

  it('unmounts after the grace period when the user navigates away', async () => {
    const wrapper = await openDashboard();
    resolver.removeChild(wrapper); // another HA panel replaces ours
    await vi.advanceTimersByTimeAsync(1999);
    expect(unmountTree).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(unmountTree).toHaveBeenCalledTimes(1);

    const again = await openDashboard();
    expect(shown(again)).toBe('dashboard');
    expect(render).toHaveBeenCalledTimes(2);
  });

  it('hands the same tree to a rebuilt panel and tells the app it moved', async () => {
    const attached = vi.fn();
    window.addEventListener(ATTACHED_EVENT, attached);
    const wrapper = await openDashboard();
    expect(attached).not.toHaveBeenCalled();

    wrapper.disconnectedCallback(); // HA's _cleanupPanel on a panel config change
    wrapper.createPanel();
    await vi.advanceTimersByTimeAsync(5000);

    expect(shown(wrapper)).toBe('dashboard');
    expect(render).toHaveBeenCalledTimes(1);
    expect(unmountTree).not.toHaveBeenCalled();
    expect(attached).toHaveBeenCalledTimes(1);
    window.removeEventListener(ATTACHED_EVENT, attached);
  });

  it('does not let a replaced element take the tree back', async () => {
    const wrapper = await openDashboard();
    const old = wrapper.querySelector('van-dashboard')!;
    wrapper.createPanel(); // a second element, e.g. from a rebuild
    await vi.advanceTimersByTimeAsync(0);
    const current = wrapper.querySelector('van-dashboard')!;
    expect(current).not.toBe(old);
    expect(old.isConnected).toBe(false);

    // An old loader's watchdog trying to remount the replaced element.
    const mountPoint = document.createElement('div');
    old.append(mountPoint);
    panelHost.mount(mountPoint);
    expect(mountPoint.children).toHaveLength(0);
    expect(shown(wrapper)).toBe('dashboard');
  });

  it('just renders when there is no <van-dashboard> (vite dev server)', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    panelHost.mount(root);
    expect(root.querySelector('.app')?.textContent).toBe('dashboard');
    root.remove();
  });

  describe('with a loader cached from before the fix', () => {
    beforeEach(() => {
      loader = 'legacy';
    });

    it('restores after the old 2 s teardown has already cleared the element', async () => {
      const wrapper = await openDashboard();
      expect(shown(wrapper)).toBe('dashboard');

      park(wrapper);
      await vi.advanceTimersByTimeAsync(10 * 60_000); // teardown ran while hidden
      expect(unmountTree).not.toHaveBeenCalled();

      unpark(wrapper);
      await flush();
      expect(shown(wrapper)).toBe('dashboard');

      await vi.advanceTimersByTimeAsync(0); // HA's rebuilt element
      expect(wrapper.querySelectorAll('van-dashboard')).toHaveLength(1);
      wrapper.push({ rev: 3 });
      await vi.advanceTimersByTimeAsync(60_000);
      expect(shown(wrapper)).toBe('dashboard');
      expect(render).toHaveBeenCalledTimes(1);
      expect(unmountTree).not.toHaveBeenCalled();
    });

    it('does not remount on hass updates', async () => {
      render.mockImplementation(() => unmountTree); // React has not committed yet
      const wrapper = await openDashboard();
      const mount = vi.spyOn(panelHost, 'mount');
      for (let rev = 1; rev <= 5; rev++) wrapper.push({ rev });
      await flush();
      expect(mount).not.toHaveBeenCalled();
      expect(unmountTree).not.toHaveBeenCalled();
    });

    it('still unmounts when the user navigates away', async () => {
      const wrapper = await openDashboard();
      resolver.removeChild(wrapper);
      await vi.advanceTimersByTimeAsync(4000); // loader teardown + grace
      expect(unmountTree).toHaveBeenCalledTimes(1);
    });
  });
});

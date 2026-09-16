/**
 * Keeps the dashboard on screen through Home Assistant's panel lifecycle.
 *
 * HA hosts us as <ha-panel-custom><van-dashboard>. Two parts of the HA
 * frontend (checked against 2026.4) combined to leave the panel blank until a
 * manual reload:
 *
 * 1. After the tab has been hidden for 5 minutes, partial-panel-resolver
 *    detaches <ha-panel-custom> ("suspend when hidden") and re-attaches it
 *    when the tab is shown again.
 * 2. <ha-panel-custom> deletes its children when it is detached, and on
 *    re-attach it only rebuilds if the panel config changed. So it came back
 *    empty, and our recovery code was inside the element it had deleted.
 *
 * So there is one React tree per page. It lives in `host`, which moves into
 * whichever <van-dashboard> mounted last. While HA has the panel parked, the
 * tree stays alive. When the wrapper comes back empty, the last element goes
 * straight back in (no blank frame) and HA is asked to rebuild the panel, so
 * an element HA has wired up takes over the tree and hass updates flow again.
 *
 * Every panel-loader.js still sitting in a browser cache uses the same
 * contract: mount(container) once the container is inside <van-dashboard>,
 * then the returned release function when the element goes away.
 */

export type Unmount = () => void;

export const PANEL_TAG = 'van-dashboard';

/** Fired on window when the tree moves into a new <van-dashboard>. */
export const ATTACHED_EVENT = 'van-dash-attached';

/** The parts of HA's <ha-panel-custom> (a Lit element) we lean on. */
interface HaPanelCustom extends HTMLElement {
  _setProperties?: (props: Record<string, unknown>) => void;
  requestUpdate?: (name?: string, oldValue?: unknown) => void;
}

export interface PanelHostOptions {
  /** How long a released tree waits for a new <van-dashboard> before unmounting. */
  graceMs?: number;
}

export interface PanelHost {
  mount(container: HTMLElement): Unmount;
}

export function createPanelHost(
  render: (host: HTMLElement) => Unmount,
  { graceMs = 2000 }: PanelHostOptions = {},
): PanelHost {
  let host: HTMLDivElement | null = null;
  let unmountTree: Unmount | null = null;
  let container: HTMLElement | null = null; // where host lives now
  let panel: HTMLElement | null = null; // the <van-dashboard> around container
  let wrapper: HaPanelCustom | null = null; // HA's <ha-panel-custom> around panel
  let parked = false; // HA pulled the wrapper out while the tab was hidden
  let destroyTimer: ReturnType<typeof setTimeout> | undefined;
  let observer: MutationObserver | null = null;
  let observed: Node | null = null;
  let listening = false;
  // Elements that handed the tree to a newer one. Old loaders remount
  // whenever their element looks empty; this stops them taking it back.
  const retired = new WeakSet<Element>();

  function mount(target: HTMLElement): Unmount {
    const el = target.closest<HTMLElement>(PANEL_TAG);
    if (el && retired.has(el)) return () => {};

    clearTimeout(destroyTimer);
    const reused = host !== null;
    if (!host) {
      host = document.createElement('div');
      // Old loaders treat an element with no .van-dash-root inside as blank
      // and remount it — before React's first commit, and on every hass
      // update while the error boundary is showing. The host always matches.
      host.className = 'van-dash-root';
      host.style.height = '100%';
      host.style.width = '100%';
      unmountTree = render(host);
    }
    if (host.parentNode !== target) moveInto(target, host);
    container = target;

    const previous = panel;
    panel = el;
    if (previous && el && previous !== el) {
      retired.add(previous);
      // Our stand-in from reattach(), now replaced by the element HA built.
      if (previous.parentNode && previous.parentNode === el.parentNode) previous.remove();
    }
    // An old loader can finish mounting after HA has already detached the
    // element; keep watching the wrapper we knew about in that case.
    if (el?.parentElement) track(el.parentElement as HaPanelCustom);
    if (reused) window.dispatchEvent(new Event(ATTACHED_EVENT));
    return () => release(target);
  }

  function release(target: HTMLElement) {
    if (target !== container) return; // a newer element has the tree
    if (isParked()) return; // restore() puts it back when HA re-attaches
    clearTimeout(destroyTimer);
    destroyTimer = setTimeout(destroy, graceMs);
  }

  function isParked() {
    // HA only parks panels while the tab is hidden; a detach while the tab
    // is visible means the user navigated away (or HA is restarting).
    return parked || (!!wrapper && !wrapper.isConnected && document.hidden);
  }

  function destroy() {
    destroyTimer = undefined;
    if (!host || host.isConnected) return;
    const unmount = unmountTree;
    host = null;
    unmountTree = null;
    container = null;
    panel = null;
    wrapper = null;
    parked = false;
    observer?.disconnect();
    observed = null;
    unmount?.();
  }

  function track(next: HaPanelCustom | null) {
    wrapper = next;
    parked = false;
    const parent = next?.parentNode ?? null;
    if (parent !== observed) {
      observer?.disconnect();
      observed = parent;
      if (parent) {
        observer ??= new MutationObserver(onResolverChange);
        observer.observe(parent, { childList: true });
      }
    }
    if (!listening) {
      listening = true;
      // Backstops for the observer. HA re-attaches from its own
      // visibilitychange and focus handlers.
      document.addEventListener('visibilitychange', restore);
      document.addEventListener('resume', restore);
      window.addEventListener('focus', restore);
      window.addEventListener('pageshow', restore);
    }
  }

  // MutationObserver callbacks run as microtasks, so a re-attached wrapper
  // is refilled before the browser paints it.
  function onResolverChange() {
    if (wrapper && !wrapper.isConnected && document.hidden) parked = true;
    restore();
  }

  function restore() {
    if (!host || !wrapper || !panel) return;
    if (wrapper.isConnected) {
      parked = false;
      if (!panel.isConnected && !wrapper.querySelector(PANEL_TAG)) reattach(wrapper, panel);
      return;
    }
    if (!document.hidden && !panel.isConnected && container) {
      // Visible, but HA has not brought the panel back (yet). If it never
      // does, the user has navigated away, so let the tree go. A re-attach
      // within the grace period cancels this.
      parked = false;
      release(container);
    }
  }

  function reattach(into: HaPanelCustom, el: HTMLElement) {
    into.appendChild(el);
    // HA dropped its handle on the element when it emptied itself, so hass
    // no longer reaches it. Wire it up the way HA does...
    if ('_setProperties' in into && !into._setProperties) {
      into._setProperties = (props) => Object.assign(el, props);
    }
    // ...and ask HA to rebuild the panel. The element it creates takes over
    // the tree in mount(), and this one is removed.
    into.requestUpdate?.('panel', null);
  }

  return { mount };
}

/** Move without a detach where the browser supports it (keeps video and iframes playing). */
function moveInto(parent: HTMLElement, node: HTMLElement) {
  const atomic = (parent as HTMLElement & { moveBefore?: (node: Node, child: Node | null) => void })
    .moveBefore;
  if (atomic && parent.isConnected && node.isConnected) {
    try {
      atomic.call(parent, node, null);
      return;
    } catch {
      // Different roots (e.g. across shadow trees): fall through.
    }
  }
  parent.appendChild(node);
}

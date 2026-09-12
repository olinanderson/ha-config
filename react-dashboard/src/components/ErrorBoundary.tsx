import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  gaveUp: boolean;
}

/** Auto-retry cadence and cap. After MAX_ATTEMPTS rapid crashes we stop
 *  auto-retrying: at that point retrying just burns CPU in a crash loop.
 *  (The panel-loader watchdog still hard-remounts the app as a last resort,
 *  and the user gets explicit "Try again" / "Reload page" buttons.) */
const RETRY_DELAY_MS = 3000;
const MAX_ATTEMPTS = 5;
const EPISODE_RESET_MS = 30000;

/**
 * Top-level error boundary for the Van Dashboard.
 *
 * React removes the ENTIRE tree from the DOM on an unhandled render error,
 * leaving a blank screen. This boundary catches those errors and shows a
 * recovery UI.
 *
 * Recovery is time-throttled — the previous design reset on every
 * 'hass-updated' event, which fires several times per second, so a
 * persistent crash turned into a tight crash↔reset loop that looked like a
 * blank/flickering screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  private _recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private _attempts = 0;
  private _lastCrashAt = 0;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, gaveUp: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[VanDash] Render error caught by ErrorBoundary:', error, info.componentStack);

    const now = Date.now();
    if (now - this._lastCrashAt > EPISODE_RESET_MS) {
      this._attempts = 0; // quiet period passed — treat as a fresh episode
    }
    this._lastCrashAt = now;
    this._attempts++;

    if (this._attempts > MAX_ATTEMPTS) {
      this.setState({ gaveUp: true });
      return;
    }

    if (this._recoveryTimer) clearTimeout(this._recoveryTimer);
    this._recoveryTimer = setTimeout(() => {
      this._recoveryTimer = null;
      this.setState({ hasError: false, error: null });
    }, RETRY_DELAY_MS);
  }

  componentWillUnmount() {
    if (this._recoveryTimer) clearTimeout(this._recoveryTimer);
  }

  handleManualReset = () => {
    if (this._recoveryTimer) {
      clearTimeout(this._recoveryTimer);
      this._recoveryTimer = null;
    }
    this._attempts = 0;
    this.setState({ hasError: false, error: null, gaveUp: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 text-center bg-background text-foreground">
          {this.state.gaveUp ? (
            <TriangleAlert className="h-8 w-8 text-amber-500" />
          ) : (
            <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
          )}
          <p className="text-muted-foreground text-sm">
            {this.state.gaveUp
              ? 'The dashboard keeps hitting an error.'
              : 'Recovering…'}
          </p>
          {this.state.error && (
            <p className="max-w-md text-xs text-muted-foreground/70 font-mono break-words">
              {String(this.state.error.message || this.state.error).slice(0, 300)}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={this.handleManualReset}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

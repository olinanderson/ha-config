import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary for the Van Dashboard.
 *
 * React 18's createRoot is strict: any unhandled render error
 * removes the ENTIRE tree from the DOM, leaving a blank screen.
 * This boundary catches those errors and shows a recovery UI.
 *
 * Auto-recovery: when HA sends a fresh hass-updated event (e.g. after
 * a WebSocket reconnect), the boundary resets and lets React retry.
 */
export class ErrorBoundary extends Component<Props, State> {
  private _hassListener: (() => void) | null = null;
  private _recoveryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[VanDash] Render error caught by ErrorBoundary:', error, info.componentStack);

    // Auto-recover on the next hass-updated event (HA reconnect / entity push).
    // This handles the "blank after tab switch" case where a stale store
    // state caused a one-time render throw.
    this._hassListener = () => {
      window.removeEventListener('hass-updated', this._hassListener!);
      this._hassListener = null;
      if (this._recoveryTimer) clearTimeout(this._recoveryTimer);
      this._recoveryTimer = null;
      this.setState({ hasError: false, error: null });
    };
    window.addEventListener('hass-updated', this._hassListener);

    // Also auto-recover after 3 s even if no hass event fires.
    this._recoveryTimer = setTimeout(() => {
      if (this._hassListener) {
        window.removeEventListener('hass-updated', this._hassListener);
        this._hassListener = null;
      }
      this._recoveryTimer = null;
      this.setState({ hasError: false, error: null });
    }, 3000);
  }

  componentWillUnmount() {
    if (this._hassListener) {
      window.removeEventListener('hass-updated', this._hassListener);
    }
    if (this._recoveryTimer) clearTimeout(this._recoveryTimer);
  }

  handleManualReset = () => {
    if (this._hassListener) {
      window.removeEventListener('hass-updated', this._hassListener);
      this._hassListener = null;
    }
    if (this._recoveryTimer) {
      clearTimeout(this._recoveryTimer);
      this._recoveryTimer = null;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 text-center bg-background text-foreground">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-muted-foreground text-sm">Recovering…</p>
          <button
            onClick={this.handleManualReset}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium mt-2"
          >
            Reload now
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

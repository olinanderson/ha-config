import { useEffect, useState, useRef, createContext, useContext, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';

interface DTCInfo {
  code: string;
  localDescription?: string;
}

interface DialogContextValue {
  open: (info: DTCInfo) => void;
}

const DTCDialogContext = createContext<DialogContextValue>({ open: () => {} });

export function useDTCDialog() {
  return useContext(DTCDialogContext);
}

interface OnlineData {
  title?: string;
  description?: string;
  causes?: string[];
  symptoms?: string[];
  fix?: string;
  sourceUrl?: string;
  source?: string;
  raw?: string;
}

/** Build base URL for the dvr_proxy OBD-lookup endpoint. Reuses the same
 *  routing pattern as camera proxy: direct TCP on HTTP, HA-proxy on HTTPS. */
function dtcApiUrl(code: string): string {
  const isHttps = window.location.protocol === 'https:';
  const code_ = encodeURIComponent(code);
  if (isHttps) {
    const base = ((window as unknown as Record<string, unknown>).__HA_BASE_URL__ as string) || '';
    return `${base}/api/dvr/dtc?code=${code_}`;
  }
  return `http://${window.location.hostname}:8766/api/dtc?code=${code_}`;
}

async function fetchOnlineDTC(code: string): Promise<OnlineData> {
  try {
    const resp = await fetch(dtcApiUrl(code));
    if (!resp.ok && resp.status !== 404) {
      throw new Error(`Server returned ${resp.status}`);
    }
    const json = await resp.json();
    if (json.error) {
      return { raw: json.error, sourceUrl: json.source_url };
    }
    return {
      title: json.title,
      description: json.description,
      causes: json.causes,
      symptoms: json.symptoms,
      fix: json.fix,
      sourceUrl: json.source_url,
      source: json.source,
    };
  } catch (err) {
    return { raw: `Failed to load online description: ${(err as Error).message}` };
  }
}

export function DTCDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DTCInfo | null>(null);
  const [onlineData, setOnlineData] = useState<OnlineData | null>(null);
  const [loading, setLoading] = useState(false);
  const backdropPointerDown = useRef(false);

  const open = useCallback((info: DTCInfo) => {
    setState(info);
    setOnlineData(null);
  }, []);

  const close = useCallback(() => {
    setState(null);
    setOnlineData(null);
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, close]);

  // Fetch online data whenever a new DTC is opened
  useEffect(() => {
    if (!state?.code) return;
    let cancelled = false;
    setLoading(true);
    fetchOnlineDTC(state.code).then((data) => {
      if (!cancelled) {
        setOnlineData(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [state?.code]);

  return (
    <DTCDialogContext.Provider value={{ open }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onMouseDown={(e) => {
            backdropPointerDown.current = e.target === e.currentTarget;
          }}
          onTouchStart={(e) => {
            backdropPointerDown.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropPointerDown.current) close();
            backdropPointerDown.current = false;
          }}
        >
          <div
            className={cn(
              'w-[min(95vw,640px)] max-h-[85vh] overflow-auto',
              'rounded-xl border bg-card text-foreground shadow-2xl',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-mono tracking-tight">{state.code}</h2>
                    {onlineData?.title && (
                      <p className="text-sm text-muted-foreground mt-0.5">{onlineData.title}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={close}
                  className="rounded-md p-1.5 hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Local (known) description */}
              {state.localDescription && !state.localDescription.toLowerCase().includes('unknown code') && (
                <div className="rounded-md bg-muted/50 p-3 border border-border">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                    Quick Reference
                  </div>
                  <p className="text-sm leading-relaxed">{state.localDescription}</p>
                </div>
              )}

              {/* Online description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Full Description{onlineData?.source ? ` (from ${onlineData.source})` : ''}
                  </div>
                  {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <div className="rounded-md bg-muted/30 p-3 border border-border min-h-[100px]">
                  {loading ? (
                    <p className="text-sm text-muted-foreground italic">Looking up code online…</p>
                  ) : onlineData?.description ? (
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {onlineData.description}
                    </div>
                  ) : onlineData?.raw ? (
                    <p className="text-sm text-muted-foreground italic">{onlineData.raw}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No extra detail was found — click the link below to view the full page.
                    </p>
                  )}
                </div>

                {onlineData?.causes && onlineData.causes.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                      Common Causes
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {onlineData.causes.slice(0, 10).map((c, i) => (
                        <li key={i} className="text-xs">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {onlineData?.symptoms && onlineData.symptoms.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                      Symptoms
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {onlineData.symptoms.slice(0, 8).map((s, i) => (
                        <li key={i} className="text-xs">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {onlineData?.fix && (
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                      How to Fix
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line">{onlineData.fix}</p>
                  </div>
                )}
              </div>

              {/* External link */}
              <div className="flex justify-end pt-2 border-t border-border">
                <a
                  href={onlineData?.sourceUrl || `https://www.engine-codes.com/${state.code.toLowerCase()}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  View full article{onlineData?.source ? ` on ${onlineData.source}` : ''}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </DTCDialogContext.Provider>
  );
}

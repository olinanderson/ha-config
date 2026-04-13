import { createContext, useContext, useRef, type RefObject } from 'react';

const PortalContext = createContext<RefObject<HTMLDivElement | null>>({ current: null });

export function usePortalContainer() {
  const ref = useContext(PortalContext);
  return ref.current;
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <PortalContext.Provider value={ref}>
      {children}
      <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, zIndex: 9999 }} />
    </PortalContext.Provider>
  );
}

import { useEffect, useState, useCallback, useRef, type ComponentType } from 'react';
import { HassProvider, useHassStore } from '@/context/HomeAssistantContext';
import { HistoryDialogProvider } from '@/components/EntityHistoryDialog';
import { cn } from '@/lib/utils';
import {
  Home as HomeIcon,
  Zap,
  Thermometer,
  Droplets,
  Truck,
  Settings,
  Camera,
  type LucideIcon,
} from 'lucide-react';
import Home from '@/pages/Home';
import Power from '@/pages/Power';
import Climate from '@/pages/Climate';
import Water from '@/pages/Water';
import Van from '@/pages/Van';
import System from '@/pages/System';
import Cameras from '@/pages/Cameras';

const pages: Record<string, ComponentType> = {
  home: Home,
  power: Power,
  climate: Climate,
  water: Water,
  van: Van,
  system: System,
  cameras: Cameras,
};

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'power', label: 'Power', icon: Zap },
  { id: 'climate', label: 'Climate', icon: Thermometer },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'van', label: 'Van', icon: Truck },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'system', label: 'System', icon: Settings },
];

function getPageFromHash(): string {
  const hash = window.location.hash.slice(1);
  return hash && hash in pages ? hash : 'home';
}

/** Auto-switch to Van tab when the vehicle starts moving */
function AutoVanNav({ navigate }: { navigate: (id: string) => void }) {
  const store = useHassStore();
  const prevMoving = useRef(false);

  useEffect(() => {
    return store.subscribeEntity('binary_sensor.vehicle_is_moving', () => {
      const entity = store.getEntity('binary_sensor.vehicle_is_moving');
      const isMoving = entity?.state === 'on';
      if (isMoving && !prevMoving.current) {
        navigate('van');
      }
      prevMoving.current = isMoving;
    });
  }, [store, navigate]);

  return null;
}

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => {
      const hass = (window as any).__HASS__;
      if (hass?.themes) {
        setIsDark(hass.themes.darkMode ?? false);
      } else {
        setIsDark(window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false);
      }
    };
    window.addEventListener('hass-updated', update);
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', update);
    update();
    return () => {
      window.removeEventListener('hass-updated', update);
      mq?.removeEventListener?.('change', update);
    };
  }, []);
  return isDark;
}

export default function App() {
  const isDark = useDarkMode();
  const [page, setPage] = useState(getPageFromHash);

  useEffect(() => {
    const onHash = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((id: string) => {
    window.location.hash = id;
    setPage(id);
  }, []);

  const Page = pages[page] ?? Home;

  return (
    <HassProvider>
      <AutoVanNav navigate={navigate} />
      <div className={`van-dash-root ${isDark ? 'dark' : ''}`} style={{ position: 'relative' }}>
        <HistoryDialogProvider>
        <div className="h-screen flex flex-col bg-background text-foreground">
          {/* Tab navbar */}
          <nav className="flex-none border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-1 px-2 h-11 overflow-x-auto">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                    page === id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </nav>
          {/* Page content */}
          <div className="flex-1 overflow-auto">
            {/* Cameras always mounted — hidden when not active to preserve WebRTC */}
            <div className={page === 'cameras' ? '' : 'hidden'}>
              <Cameras />
            </div>
            {page !== 'cameras' && <Page />}
          </div>
        </div>
        </HistoryDialogProvider>
      </div>
    </HassProvider>
  );
}

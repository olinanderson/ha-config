import {
  Home,
  Zap,
  Thermometer,
  Droplets,
  Car,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const pages: { id: string; label: string; icon: LucideIcon; urlPath: string }[] = [
  { id: 'home', label: 'Home', icon: Home, urlPath: '/dash-home' },
  { id: 'power', label: 'Power', icon: Zap, urlPath: '/dash-power' },
  { id: 'climate', label: 'Climate', icon: Thermometer, urlPath: '/dash-climate' },
  { id: 'water', label: 'Water', icon: Droplets, urlPath: '/dash-water' },
  { id: 'van', label: 'Van', icon: Car, urlPath: '/dash-van' },
  { id: 'system', label: 'System', icon: Settings, urlPath: '/dash-system' },
];

function navigateHA(path: string) {
  history.pushState(null, '', path);
  window.dispatchEvent(new Event('location-changed'));
}

interface TopNavProps {
  currentPage: string;
}

export function TopNav({ currentPage }: TopNavProps) {
  return (
    <nav className="flex items-center gap-1 border-b bg-card px-4 py-2 overflow-x-auto shrink-0">
      <span className="text-sm font-semibold text-foreground mr-4 hidden md:block">
        🚐 Van Dashboard
      </span>
      {pages.map(({ id, label, icon: Icon, urlPath }) => (
        <button
          key={id}
          onClick={() => navigateHA(urlPath)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
            currentPage === id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  );
}

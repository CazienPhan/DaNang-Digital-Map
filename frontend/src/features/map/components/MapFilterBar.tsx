import React from 'react';
import { MapPin, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapFilters {
  place: boolean;
  ocop: boolean;
}

interface MapFilterBarProps {
  value: MapFilters;
  onChange: (filters: MapFilters) => void;
}

// ---------------------------------------------------------------------------
// Filter definitions — single source of truth for labels, icons, keys
// ---------------------------------------------------------------------------

const FILTERS: {
  key: keyof MapFilters;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}[] = [
  { key: 'place', label: 'Điểm tham quan', Icon: MapPin },
  { key: 'ocop', label: 'Sản phẩm OCOP', Icon: Store },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * MapFilterBar
 *
 * Two independently-toggleable chips that control which POI categories the
 * map renders. Both start off (no markers shown) — pressing a chip turns
 * that category's markers on/off without affecting the other.
 */
export const MapFilterBar: React.FC<MapFilterBarProps> = ({ value, onChange }) => {
  const toggle = (key: keyof MapFilters) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Map filters">
      {FILTERS.map(({ key, label, Icon }) => {
        const isActive = value[key];
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => toggle(key)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
              'shadow-sm border transition-colors duration-150 whitespace-nowrap',
              isActive
                ? 'bg-background text-primary border-primary border-2'
                : 'bg-background text-foreground border-border hover:bg-muted',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MapFilterBar;

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapFilters {
  place: boolean;
  ocop: boolean;
}

interface MapFilterBarProps {
  value: MapFilters;
  onChange: (filters: MapFilters) => void;
}

// ─── Filter button descriptors ────────────────────────────────────────────────

interface FilterOption {
  key: keyof MapFilters;
  label: string;
  icon: string;
  activeClass: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    key: 'place',
    label: 'Di tích',
    icon: '🏛️',
    activeClass:
      'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]',
  },
  {
    key: 'ocop',
    label: 'OCOP',
    icon: '🌿',
    activeClass:
      'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MapFilterBar
 *
 * A row of independently-togglable chips that control which POI categories are
 * rendered on the map. State lives in App; this component is purely presentational.
 *
 * Props:
 *   value    — current filter state (from App-level useState)
 *   onChange — callback to update that state
 */
export const MapFilterBar: React.FC<MapFilterBarProps> = ({ value, onChange }) => {
  const toggle = (key: keyof MapFilters) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Map category filters"
    >
      {FILTER_OPTIONS.map(({ key, label, icon, activeClass }) => {
        const isActive = value[key];

        return (
          <button
            key={key}
            type="button"
            id={`map-filter-${key}`}
            onClick={() => toggle(key)}
            aria-pressed={isActive}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
              'border backdrop-blur-md transition-all duration-200 select-none',
              'hover:scale-105 active:scale-95',
              isActive
                ? activeClass
                : [
                    'bg-black/40 border-white/15 text-white/80',
                    'hover:bg-black/55 hover:border-white/30 hover:text-white',
                  ],
            )}
          >
            <span className="text-sm leading-none" aria-hidden="true">
              {icon}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MapFilterBar;

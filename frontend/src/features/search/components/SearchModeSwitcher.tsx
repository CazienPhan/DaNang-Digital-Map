import React from 'react';
import { MapPin, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchMode } from '../types/SearchMode';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SearchModeSwitcherProps {
  /** The currently active search mode. */
  value: SearchMode;
  /** Called when the user selects a different mode. */
  onChange: (mode: SearchMode) => void;
}

// ---------------------------------------------------------------------------
// Mode definitions — single source of truth for labels, icons, values
// ---------------------------------------------------------------------------

const MODES: {
  mode: SearchMode;
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}[] = [
  { mode: 'place',   label: 'Place Search',   Icon: MapPin      },
  { mode: 'product', label: 'Product Search', Icon: ShoppingBag },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SearchModeSwitcher
 *
 * A fully-controlled, presentation-only toggle that lets the user choose
 * between "place" and "product" search modes.
 *
 * Responsibilities:
 *   ✅ Render the two mode buttons
 *   ✅ Highlight the active selection
 *   ✅ Call onChange when the user picks a mode
 *
 * Does NOT:
 *   ❌ Manage its own state
 *   ❌ Make API calls
 *   ❌ Know anything about Map4D, Meilisearch, or search business logic
 */
const SearchModeSwitcher: React.FC<SearchModeSwitcherProps> = ({
  value,
  onChange,
}) => {
  return (
    <div
      className={cn(
        'flex w-full mt-2 rounded-lg bg-muted/60 p-1 gap-1',
        'shadow-sm border border-border/40',
      )}
      role="tablist"
      aria-label="Search mode"
    >
      {MODES.map(({ mode, label, Icon }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mode)}
            className={cn(
              // Base layout
              'flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5',
              'rounded-md text-xs font-medium',
              // Smooth transitions
              'transition-all duration-200 ease-in-out',
              // Active state — matches shadcn/ui's filled tab style
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
            )}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5 shrink-0 transition-colors duration-200',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SearchModeSwitcher;

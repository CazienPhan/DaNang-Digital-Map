import React from 'react';
import { ArrowLeft, Loader2, SearchX } from 'lucide-react';
import type { SearchSuggestion } from '../types/SearchSuggestion';
import { SearchListingCard } from './SearchListingCard';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SearchListingProps {
  results: SearchSuggestion[];
  loading: boolean;
  query: string;
  onSelectItem: (result: SearchSuggestion) => void;
  /** Called with the hovered result, and null when the mouse leaves it. */
  onHoverItem?: (result: SearchSuggestion | null) => void;
  /**
   * When provided, shows a back arrow next to the "Results" title — used
   * when this listing was reached from another view (e.g. the "Khám phá
   * nhà sản xuất" card in Product Detail) that the user should return to.
   */
  onBack?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SearchListing — pure UI component.
 *
 * Depends only on SearchSuggestion (the unified DTO).
 * Never imports PlaceSuggestion or any provider-specific type.
 * Renders identically for both Destination Search and Product Search results.
 */
export const SearchListing: React.FC<SearchListingProps> = ({
  results,
  loading,
  query,
  onSelectItem,
  onHoverItem,
  onBack,
}) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="-ml-2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Quay lại"
                title="Quay lại"
              >
                <ArrowLeft size={18} />
              </Button>
            )}
            <h2 className="text-base font-semibold text-foreground">Results</h2>
          </div>
          {!loading && results.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {results.length} found
            </span>
          )}
        </div>
        {query && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            "{query}"
          </p>
        )}
      </div>

      <Separator />

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Searching…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 px-4 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No results found</p>
            <p className="text-xs text-muted-foreground/60">
              Try a different keyword
            </p>
          </div>
        )}

        {/* Results list */}
        {!loading && results.length > 0 && (
          <div className="flex flex-col divide-y divide-border/50 px-2 py-1">
            {results.map((result) => (
              <SearchListingCard
                key={result.id}
                result={result}
                onSelect={onSelectItem}
                onHover={onHoverItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchListing;

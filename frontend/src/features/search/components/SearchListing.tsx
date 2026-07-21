import React from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { type PlaceSuggestion } from '@/services/map4d/search.service';
import { SearchListingCard } from './SearchListingCard';
import { Separator } from '@/components/ui/separator';

interface SearchListingProps {
  results: PlaceSuggestion[];
  loading: boolean;
  query: string;
  onSelectItem: (result: PlaceSuggestion) => void;
}

export const SearchListing: React.FC<SearchListingProps> = ({
  results,
  loading,
  query,
  onSelectItem,
}) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Results</h2>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchListing;

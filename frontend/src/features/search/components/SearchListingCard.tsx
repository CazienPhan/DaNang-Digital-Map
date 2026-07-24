import React from 'react';
import { ImageIcon, MapPin, ShoppingBag } from 'lucide-react';
import type { SearchSuggestion } from '../types/SearchSuggestion';

interface SearchListingCardProps {
  result: SearchSuggestion;
  onSelect: (result: SearchSuggestion) => void;
}

/**
 * SearchListingCard — pure UI component.
 *
 * Depends ONLY on SearchSuggestion. Never imports any provider type.
 */
export const SearchListingCard: React.FC<SearchListingCardProps> = ({
  result,
  onSelect,
}) => {
  const Icon = result.type === 'place' ? MapPin : ShoppingBag;

  return (
    <button
      type="button"
      className="w-full text-left flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onSelect(result)}
      aria-label={`Select ${result.title}`}
    >
      {/* Thumbnail — uses image if available, falls back to placeholder */}
      <div className="shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
        {result.image ? (
          <img
            src={result.image}
            alt={result.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <p className="text-sm font-semibold leading-snug text-foreground truncate">
          {result.title}
        </p>
        {result.description && (
          <p className="text-justify text-xs text-muted-foreground leading-snug line-clamp-2 flex items-start gap-1">
            {/* <Icon className="h-3 w-3 mt-0.5 shrink-0" /> */}
            <span>{result.description}</span>
          </p>
        )}
      </div>
    </button>
  );
};

export default SearchListingCard;

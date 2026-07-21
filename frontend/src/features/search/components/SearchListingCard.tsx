import React from 'react';
import { ImageIcon, MapPin } from 'lucide-react';
import { type PlaceSuggestion } from '@/services/map4d/search.service';

interface SearchListingCardProps {
  result: PlaceSuggestion;
  onSelect: (result: PlaceSuggestion) => void;
}

export const SearchListingCard: React.FC<SearchListingCardProps> = ({
  result,
  onSelect,
}) => {
  return (
    <button
      type="button"
      className="w-full text-left flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onSelect(result)}
      aria-label={`Select ${result.name}`}
    >
      {/* Image placeholder — real images unavailable from Map4D API */}
      <div className="shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <p className="text-sm font-semibold leading-snug text-foreground truncate">
          {result.name}
        </p>
        {result.address && (
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2 flex items-start gap-1">
            <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{result.address}</span>
          </p>
        )}
      </div>
    </button>
  );
};

export default SearchListingCard;

import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui';
import { MapPin, ShoppingBag } from 'lucide-react';
import type { SearchSuggestion } from '../types/SearchSuggestion';

interface SearchResultProps {
  suggestions: SearchSuggestion[];
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
}

/**
 * SearchResult — pure UI component.
 *
 * Depends ONLY on SearchSuggestion. Never imports any provider type.
 * Icon is chosen by suggestion.type — no engine knowledge required.
 */
export const SearchResult: React.FC<SearchResultProps> = ({
  suggestions,
  onSelectSuggestion,
}) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border bg-background shadow-lg overflow-hidden">
      <Command shouldFilter={false}>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup>
            {suggestions.map((suggestion) => {
              const Icon = suggestion.type === 'place' ? MapPin : ShoppingBag;

              return (
                <CommandItem
                  key={suggestion.id}
                  value={suggestion.title}
                  onSelect={() => onSelectSuggestion(suggestion)}
                  className="flex items-start gap-3 cursor-pointer p-3"
                >
                  <Icon className="mt-1 h-5 w-5 text-primary shrink-0" />

                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{suggestion.title}</span>
                    {suggestion.description && (
                      <span className="text-sm text-muted-foreground truncate">
                        {suggestion.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default SearchResult;
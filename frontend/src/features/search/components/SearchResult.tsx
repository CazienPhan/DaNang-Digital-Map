import React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui";

import { MapPin } from "lucide-react";

import { type PlaceSuggestion } from "@/services/map4d/search.service";


interface SearchResultProps {
  suggestions: PlaceSuggestion[];
  onSelectSuggestion: (
    suggestion: PlaceSuggestion
  ) => void;

}


export const SearchResult: React.FC<SearchResultProps> = ({
  suggestions,
  onSelectSuggestion,
}) => {


  return (
    <div className="
      absolute
      top-full
      left-0
      right-0
      mt-2
      z-50
      rounded-lg
      border
      bg-background
      shadow-lg
      overflow-hidden
    ">


      <Command shouldFilter={false}>
        <CommandList>


          <CommandEmpty>
            No places found.
          </CommandEmpty>


          <CommandGroup>


            {suggestions.map(
              (suggestion) => (

                <CommandItem

                  key={suggestion.id}

                  value={suggestion.name}

                  onSelect={() =>
                    onSelectSuggestion(
                      suggestion
                    )
                  }

                  className="
                  flex
                  items-start
                  gap-3
                  cursor-pointer
                  p-3
                  "
                >


                  <MapPin
                    className="
                    mt-1
                    h-5
                    w-5
                    text-primary
                  "
                  />


                  <div className="
                  flex
                  flex-col
                ">

                    <span
                      className="
                      font-medium
                    "
                    >
                      {suggestion.name}
                    </span>


                    {
                      suggestion.address && (

                        <span
                          className="
                        text-sm
                        text-muted-foreground
                      "
                        >
                          {suggestion.address}
                        </span>

                      )
                    }


                  </div>


                </CommandItem>

              ))}


          </CommandGroup>


        </CommandList>

      </Command>


    </div>
  );
};


export default SearchResult;
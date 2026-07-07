import React from "react";
import { Input } from "@/components/ui";
import { MapPin, X } from "lucide-react";
import type { PlaceSuggestion } from "@/services/map4d/search.service";
import type { LocationState } from "@/features/directions/hooks/useDirection";

interface DirectionLocationInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: PlaceSuggestion[];
  active: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSelect: (item: PlaceSuggestion) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  focusedIndex: number;
  cachedGps?: LocationState | null;
  onSelectCurrent?: () => void;
  onClearLocation?: () => void;
}

export const DirectionLocationInput: React.FC<DirectionLocationInputProps> = ({
  placeholder, value, onChange, suggestions, active, onFocus, onBlur,
  onSelect, onKeyDown, focusedIndex, cachedGps, onSelectCurrent, onClearLocation
}) => {
  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (onClearLocation) onClearLocation();
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className="h-12 w-full bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 pl-3 text-sm placeholder:text-gray-500 shadow-sm transition-all"
        />
        {value && onClearLocation && (
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" 
            onClick={() => { onChange(''); onClearLocation(); }}
          >
             <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {active && (suggestions.length > 0 || !!cachedGps) && (
        <div className="absolute top-full left-0 right-0 z-[9999] mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-72 overflow-y-auto">
          {cachedGps && (
            <div
              className={`flex items-center gap-3 p-3 h-16 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                focusedIndex === 0 ? "bg-blue-50" : "hover:bg-gray-100"
              }`}
              onMouseDown={(e) => { e.preventDefault(); onSelectCurrent?.(); }}
            >
              <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-gray-900 truncate">Current Location</span>
                <span className="text-sm text-gray-500 truncate">{cachedGps.address}</span>
              </div>
            </div>
          )}

          {suggestions.map((item, index) => {
            const actualIndex = cachedGps ? index + 1 : index;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 h-16 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${
                  focusedIndex === actualIndex ? "bg-blue-50" : "hover:bg-gray-100"
                }`}
                onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
              >
                <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-900 truncate">{item.name}</span>
                  <span className="text-sm text-gray-500 truncate">{item.address}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DirectionLocationInput;
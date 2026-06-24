import React from 'react';
import { type PlaceSuggestion } from '../../services/map4d/search.service';

interface SearchResultProps {
  suggestions: PlaceSuggestion[];
  onSelectSuggestion: (suggestion: PlaceSuggestion) => void;
  focusedIndex?: number;
}

export const SearchResult: React.FC<SearchResultProps> = ({
  suggestions,
  onSelectSuggestion,
  focusedIndex = -1,
}) => {
  return (
    <div className="suggestions-list">
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.id}
          className={`suggestion-item${focusedIndex === index ? ' focused' : ''}`}
          onClick={() => onSelectSuggestion(suggestion)}
        >
          {/* Location Pin Icon */}
          <div className="suggestion-icon">
            <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'currentColor' }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          
          {/* Place Details Content Area */}
          <div className="suggestion-content">
            <span className="suggestion-name">
              {suggestion.name}
            </span>
            {suggestion.address && (
              <span className="suggestion-address">
                {suggestion.address}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default SearchResult;

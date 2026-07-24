/**
 * SearchSuggestion — the ONLY DTO consumed by the UI layer.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ARCHITECTURE FREEZE (Phase 7.4)                            │
 * │  This interface is permanently frozen.                      │
 * │  Do NOT rename fields. Do NOT add new DTOs.                 │
 * │  Future engines must map their native types into this shape.│
 * └─────────────────────────────────────────────────────────────┘
 *
 * Fields:
 *   id          — stable key for React list rendering
 *   type        — engine origin; used by the icon layer only
 *   title       — primary display text (place name or product name)
 *   description — secondary display text (address / category)
 *   image       — optional thumbnail URL
 *   location    — coordinates; present only for "place" suggestions
 *   original    — raw engine-native object, preserved for callbacks
 *                 that need provider-specific data (e.g. onSelectPlace)
 */
export interface SearchSuggestion {
  id: string;
  type: 'place' | 'product';
  title: string;
  description: string;
  image?: string;
  location?: {
    lat: number;
    lng: number;
  };
  /**
   * Raw provider object. Typed as unknown so the UI layer is never
   * forced to import provider-specific types. Cast inside callbacks
   * that own the knowledge of which engine is active.
   */
  original: unknown;
}

/**
 * Shared layout constants for the Search UI.
 *
 * Both FloatingSearchBar and SearchSidebar consume these values to guarantee
 * pixel-perfect left-edge and width alignment at all times.
 *
 * DO NOT hard-code width or position values anywhere else.
 */

// ---------------------------------------------------------------------------
// Width
// ---------------------------------------------------------------------------

/**
 * Tailwind width classes applied to both the search bar and sidebar.
 *
 * DESIGN RULE: Do NOT change these values.
 * The two breakpoints must remain w-[320px] / sm:w-[350px].
 */
export const SEARCH_PANEL_WIDTH = {
  base: 'w-[320px]',
  sm: 'sm:w-[350px]',
  combined: 'w-[320px] sm:w-[350px]',
};

// ---------------------------------------------------------------------------
// Vertical layout — single source of truth
// ---------------------------------------------------------------------------

/**
 * Shared vertical layout measurements.
 *
 * Change ONLY these numbers when adjusting spacing or search bar height.
 * All computed positions derive from this object.
 */
export const SEARCH_LAYOUT = {
  /** Distance from viewport top to the search bar (px) */
  topOffset: 20,
  /** Vertical gap between the bottom of the search bar and the top of the sidebar (px) */
  gap: 8,
  /**
   * Measured height of the FloatingSearchBar input row (px).
   * Includes: p-3 (12px top + 12px bottom) + input height (~40px) = ~64px.
   * Adjust this value if the search bar height ever changes.
   */
  searchBarHeight: 56,
};

/**
 * Top offset for FloatingSearchBar.
 * Expressed as a Tailwind arbitrary value derived from SEARCH_LAYOUT.topOffset.
 */
export const SEARCH_BAR_TOP = `top-[${SEARCH_LAYOUT.topOffset}px]`;

/**
 * Top offset for SearchSidebar — positioned directly below the search bar.
 *
 * Calculation:
 *   topOffset (20) + searchBarHeight (56) + gap (8) = 84px
 */
export const SEARCH_SIDEBAR_TOP = `top-[${SEARCH_LAYOUT.topOffset + SEARCH_LAYOUT.searchBarHeight + SEARCH_LAYOUT.gap
  }px]`;

// ---------------------------------------------------------------------------
// Horizontal position
// ---------------------------------------------------------------------------

/** Shared left offset for both components — 20px from the viewport edge */
export const SEARCH_LEFT = `left-[${SEARCH_LAYOUT.topOffset}px]`;

// ---------------------------------------------------------------------------
// Z-index layers
// ---------------------------------------------------------------------------

/** Search bar always renders above the sidebar */
export const SEARCH_BAR_Z = 'z-[100]';

/** Sidebar renders below the search bar */
export const SEARCH_SIDEBAR_Z = 'z-[90]';

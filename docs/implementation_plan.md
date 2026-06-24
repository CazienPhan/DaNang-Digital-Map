# Implementation Plan: Map Click Place Detail Feature

Introduce a context-aware Place Detail Card resolved dynamically via Map4D Reverse Geocoding API when the user clicks any location on the map canvas.

---

## 1. Requirement Summary

### Map Clicks and Coordinates Detection
1. **Map Click Event**: Detect clicked coordinate pair (`lat`, `lng`) without reloading or re-initializing the map instance.
2. **Reverse Geocoding**: Resolve coordinates to a physical address using the existing backend geocoding proxy endpoint `/api/map4d/geocode?location=lat,lng`.
3. **Marker Display**: Place a clicked location marker at the resolved point, keeping the search marker intact if a search context exists.

### Context-Aware State Management
- Manage states: `clickedLocation` (MapCoordinate), `selectedPlace` (PlaceDetailState), `searchValue` (string), and `currentCardType` ('DEFAULT_CLICK_CARD' | 'SEARCH_RESULT_CARD' | 'GPS_LOCATION_CARD').
- **Case 1: No Search Context**:
  - Clicked location address is mapped to `searchValue` (populates search input).
  - Selected place is updated to the clicked location.
  - Card type is set to `DEFAULT_CLICK_CARD` (renders card with Directions navigation button).
- **Case 2: Existing Context Active**:
  - Do NOT override the current search input text, search results, or search markers.
  - Display an independent card containing only Location Tag, Name, and Address.
  - The card must have NO Directions button or action buttons.

---

## 2. Current Layout Analysis
- **Search Bar / Info Card**:
  - Located at the top-left area (`top: 20px; left: 20px`) inside `.search-container`. It renders autocomplete lists and `PlaceInfoCard` elements vertically stacked.
- **Map Viewport**:
  - Takes 100% width/height. Events are registered inside `MapContainer.tsx`.
- **Spacing**:
  - The bottom-left area of the viewport is empty, which is ideal for displaying a floating click detail card without blocking overlays.

---

## 3. UI Refactoring Plan
- **Unified Glassmorphic Card Styling**:
  - Style the new `.place-detail-click-card` in [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css) to inherit the same aesthetics as the directions panel (blur, translucent borders, drop shadow, rounded corners).
  - Position it at `bottom: 30px; left: 20px; width: 30vw (min-width: 420px, max-width: 600px)` so it aligns cleanly with the search bar.
  - Add responsiveness via media queries to scale to full width on mobile widths.

---

## 4. Proposed Solution & Architecture

We will create the required modules without rewriting any core systems:

### 1. Hook: `usePlaceDetail`
- Create [usePlaceDetail.ts](file:///d:/PROJECT/MAP4D/frontend/src/hooks/usePlaceDetail.ts):
  - Exposes states: `clickedLocation`, `selectedPlace` (clicked place details), `currentCardType` ('DEFAULT_CLICK_CARD' | 'SEARCH_RESULT_CARD' | 'GPS_LOCATION_CARD' | null), and status setters.

### 2. Service: `placeDetail.service`
- Create [placeDetail.service.ts](file:///d:/PROJECT/MAP4D/frontend/src/services/placeDetail.service.ts):
  - Fetches details from `/api/map4d/geocode?location=lat,lng` proxy and parses results into a structured `PlaceDetail` object (including category, address, name).

### 3. Component: `MapClickHandler`
- Create [MapClickHandler.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapClickHandler.tsx):
  - Receives the `mapInstance` from the parent and registers map click event listeners dynamically.
  - On click, triggers reverse geocoding, determines if context exists, and forwards resolved place detail to the parent callback.

### 4. Component: `PlaceDetailCard`
- Create [PlaceDetailCard.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/PlaceDetailCard.tsx):
  - Renders the floating detail card.
  - Conditional check: shows `Directions` action button only if `cardType === 'DEFAULT_CLICK_CARD'`.

### 5. Integration in `App.tsx`
- Integrate `usePlaceDetail` states.
- Capture `map` instances from `MapContainer`'s `onMapReady` callback.
- Render `<MapClickHandler mapInstance={map} ... />` inside the DOM tree.
- Pass `clickMarker` to `MapContainer` to render a separate marker for the clicked location under Case 2.
- Synchronize search inputs and type checks.

---

## 5. Files Affected
- [App.tsx](file:///d:/PROJECT/MAP4D/frontend/src/App.tsx) (Parent integration & state coordination)
- [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css) (Click card styling and media query responsiveness)
- [MapContainer.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapContainer.tsx) (Add `clickMarker` support)
- [NEW] [placeDetail.service.ts](file:///d:/PROJECT/MAP4D/frontend/src/services/placeDetail.service.ts) (Reverse geocoding helper)
- [NEW] [usePlaceDetail.ts](file:///d:/PROJECT/MAP4D/frontend/src/hooks/usePlaceDetail.ts) (State management hook)
- [NEW] [MapClickHandler.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapClickHandler.tsx) (Click event observer)
- [NEW] [PlaceDetailCard.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/PlaceDetailCard.tsx) (Floating detail card)

---

## 6. Risk Analysis
- **Duplicate Map Click Events**:
  - *Risk*: Multiple click listeners on the map could cause parallel reverse geocode calls.
  - *Mitigation*: Unbind listeners inside `useEffect` cleanup hook in `MapClickHandler.tsx`.
- **State Overlaps**:
  - *Risk*: Case 1 sets both `selectedPlace` (search) and `clickedPlace`. This might cause duplicate cards to show.
  - *Mitigation*: Update card rendering conditions in `SearchBar` and `App` to ensure only one card is active at a time (e.g. show Click Card if active, else fallback to search Card).

---

## 7. Verification Checklist

### Click Handlers
- [ ] Map clicks capture correct coordinate details.
- [ ] Map instance is preserved without redraws or flashing.
- [ ] Panning, zooming, and scrolling continue working after clicks.

### Case 1: Click Without Context
- [ ] Clicking map updates search input to resolved address.
- [ ] Floating Click Detail card appears at the bottom.
- [ ] Card contains a Direction action button.
- [ ] Clicking Directions button opens directions panel and autofills inputs.

### Case 2: Click With Context
- [ ] Clicking map does NOT override search input text or search card at the top-left.
- [ ] Floating Click Detail card appears at the bottom.
- [ ] Card contains only Location Tag, Name, and Address (no Directions button).
- [ ] A click marker is placed at the clicked point, while search result marker remains visible.

### Performance & Security
- [ ] API keys are retrieved from environment proxy contexts (no leaks).
- [ ] Coordinates are resolved correctly via backend reverse geocoding API.
- [ ] Layout behaves responsively on Desktop, Tablet, and Mobile viewports.

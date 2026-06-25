# Implementation Plan: Place Detail State Management Refactoring

Refactor the state management system for the DaNang Digital Map, introducing clear separation between primary selected places, active routing destinations, routing mode states, and secondary selected places.

---

## User Review Required

> [!IMPORTANT]
> The primary change is the decoupling of the Directions panel closing from the Route state destruction.
> Previously, closing the Directions panel automatically reset the routing states. Now, closing the Directions panel will *only* hide the input fields panel while keeping the active route, its markers, and the `routeMode` intact. A full reset will be bound to clearing the search bar or closing the primary card.

---

## Proposed Changes

We will refactor the state management flow inside `App.tsx` and sync it with `SearchBar.tsx` and `MapContainer.tsx`.

### DaNang Digital Map Application Core

#### [MODIFY] [App.tsx](file:///d:/PROJECT/MAP4D/frontend/src/App.tsx)
- Declare states explicitly:
  - `const [selectedPlace, setSelectedPlace] = useState<LocationState | null>(null);` (Primary Selected Place / Card)
  - `const [activeDestination, setActiveDestination] = useState<LocationState | null>(null);` (Destination for route calculations)
  - `const [routeMode, setRouteMode] = useState<boolean>(false);` (Determines if routing context is active)
  - `const [secondarySelectedPlace, setSecondarySelectedPlace] = useState<PlaceDetail | null>(null);` (Secondary inspected place clicked during/after directions)
- Update `handlePlaceResolved`:
  - If `routeMode` is `false` (BEFORE directions): Set `selectedPlace`, reset `secondarySelectedPlace` and its marker, update search bar query.
  - If `routeMode` is `true` (DURING or AFTER directions): Set `secondarySelectedPlace` only, drop secondary marker, do not update Search Bar query.
- Update `handleDirectionClick`:
  - When clicking "Directions" from the Primary Card, set `routeMode` to `true`, open the panel, and populate `activeDestination` with `selectedPlace`.
- Update `handleCloseDirection`:
  - Set `panelOpen` to `false`. Do **NOT** call `clearRoute()` or clear `activeDestination` or set `routeMode` to `false` (preserves route on map).
- Update search and route clear handlers (`onCloseInfoCard` / clear query):
  - Call a full reset: clear `selectedPlace`, `activeDestination`, `secondarySelectedPlace`, `routeMode`, `markerPosition`, `clickedLocation`, and call `clearRoute()`.

#### [MODIFY] [SearchBar.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/SearchBar.tsx)
- Update interface props:
  - Pass `destination` as `activeDestination` state.
  - Pass `routeMode` state.
  - Set condition for primary `PlaceInfoCard` rendering:
    - `{selectedPlace && !directionActive && !secondarySelectedPlace && <PlaceInfoCard ... />}` (Only show primary card if secondary card is not active, or keep them aligned).
- Ensure input clear actions call the full reset handler `onCloseInfoCard`.

#### [MODIFY] [MapContainer.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapContainer.tsx)
- Modify marker and path inputs in `App.tsx` integration:
  - Render `originMarker` and `destinationMarker` as long as `routeMode` is `true` (do not restrict only to `panelOpen`).
  - Render `routePath` as long as `routeMode` is `true` and `routeData` is available.
  - Render `clickMarker` as `secondarySelectedPlace` coordinates if `secondarySelectedPlace` is present, even when `panelOpen` is true or false.

---

## Verification Plan

### Automated Tests
- Validate TypeScript compilation of `App.tsx`, `SearchBar.tsx`, and `MapContainer.tsx` with:
  ```powershell
  npm run build --prefix frontend
  ```

### Manual Verification Checklist
- [ ] **Autocomplete selection** correctly populates `selectedPlace` and renders the Primary Card.
- [ ] **Map click before directions** replaces the Primary Card and updates the search input field.
- [ ] **Directions transition** sets `routeMode` to `true` and draws the route polyline with markers A and B.
- [ ] **Map click during directions** displays a Secondary Card in the bottom-right and drops a gray secondary marker, keeping the route polyline, A/B markers, and Search Bar query untouched.
- [ ] **Closing the Directions panel** hides the inputs, but keeps the route polyline, A/B markers, and destination context visible on the map.
- [ ] **Map click after closing directions** still creates a Secondary Card only.
- [ ] **Clearing search bar** performs a full reset, clearing the route, both markers, and all cards.

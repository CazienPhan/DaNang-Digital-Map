# Implementation Plan: Directions Navigation UI/UX Refinement

Refine and improve the Directions Navigation panel UI/UX to match Google Maps aesthetic guidelines, ensuring consistent margins, modern icon systems, and cleaner mode selectors.

---

## User Review Required

> [!IMPORTANT]
> - Travel distances and times will be removed from the transport mode tabs (Icon + Label only).
> - We will introduce a left route indicator column inside `DirectionPanel.tsx` with a green origin circle, dashed connecting line, and red destination circle.
> - Solid icons in the summary card will be replaced with clean stroked SVG vectors.

---

## Proposed Changes

We will refactor `DirectionPanel.tsx` and `App.css`.

### 1. Component Refactoring: Directions Panel

#### [MODIFY] [DirectionPanel.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/DirectionPanel.tsx)
- Remove `matrixData` metadata calculation details inside `.transport-tabs` render loop (renders strictly mode icon and label).
- Add a `.route-indicator` container on the left of `.inputs-wrapper` in `.direction-inputs-container`:
  - Enclose `<span className="indicator-dot origin-indicator-dot"></span>`
  - Enclose `<span className="indicator-line"></span>`
  - Enclose `<span className="indicator-dot dest-indicator-dot"></span>`
- Remove the inline `.dot` spans from inside the `.input-group` wrapper boxes.
- Replace the SVGs inside the `.route-summary-card` metrics section (lines 411-432):
  - Use stroked path vector for Distance.
  - Use stroked clock vector for Duration.

### 2. Styling Enhancements: App CSS

#### [MODIFY] [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css)
- Add styles for `.route-indicator`, `.indicator-dot`, `.origin-indicator-dot`, `.dest-indicator-dot`, and `.indicator-line`.
- Update `.direction-inputs-container` to set `display: flex; align-items: stretch; gap: 12px`.
- Remove left spacing or padding offsets inside `.input-group` previously allocated for internal indicators.
- Update `.transport-tab-btn` to set `flex-direction: row` (icon and label aligned horizontally side-by-side). Remove tab meta overrides.
- Refine summary card SVG sizing and stroke properties:
  - `.route-metric svg` should share `width: 20px; height: 20px` with stroked lines.

---

## Verification Plan

### Automated Tests
- Validate TypeScript compilation of the frontend:
  ```powershell
  npm run build --prefix frontend
  ```

### Manual Verification Checklist
- [ ] Transport mode buttons render only vehicle icons and labels aligned horizontally.
- [ ] No distances or travel times are visible in the transport selection bar.
- [ ] Route summary metrics card displays the new stroked path and clock icons.
- [ ] The left side of the input boxes features a Google Maps-style indicator (green origin dot connected via vertical dashed line to red destination dot).
- [ ] Spacing is balanced, with equal left and right padding inside the overlay.
- [ ] Swapping locations still functions perfectly.

---

# Implementation Plan: Route Accuracy Validation & UI Consistency Refinement

## User Review Required

> [!IMPORTANT]
> - Origin indicator elements and map markers will be standardized to RED (`#ef4444`).
> - Destination indicator elements and map markers will be standardized to GREEN (`#10b981`).
> - Route calculations will be reinforced by explicitly passing `selectedTransportMode` from `DirectionPanel`'s `useEffect` triggers to the routing service callback to avoid stale closure variables.

## Proposed Changes

### Styles & UI Aesthetics

#### [MODIFY] [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css)
- Swap color hexes for origin and destination indicator styles:
  - `.origin-indicator-dot`, `.origin-dot` -> background: `#ef4444` (RED), box shadow: `rgba(239, 68, 68, 0.6)`.
  - `.dest-indicator-dot`, `.dest-dot` -> background: `#10b981` (GREEN), box shadow: `rgba(16, 185, 129, 0.6)`.

### Map Rendering Component

#### [MODIFY] [MapContainer.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapContainer.tsx)
- Refactor the origin and destination marker drawing logic:
  - Instead of default Map4D markers (which default to red pins), use custom HTML elements inside `iconView` to render custom SVG pins.
  - Origin Marker (A): RED (`#ef4444`) pin with a white circular core displaying a bold RED letter "A".
  - Destination Marker (B): GREEN (`#10b981`) pin with a white circular core displaying a bold GREEN letter "B".

### Search and Direction Components

#### [MODIFY] [SearchBar.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/SearchBar.tsx)
- Update `onCalculateRoute` prop signature to accept `mode?: string` as a third argument:
  `onCalculateRoute: (start: MapCoordinate, end: MapCoordinate, mode?: string) => void;`

#### [MODIFY] [DirectionPanel.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/DirectionPanel.tsx)
- Update `onCalculateRoute` prop signature to accept `mode?: string` as a third argument.
- Inside the route calculation `useEffect`, call `onCalculateRoute` passing `selectedTransportMode` as the third parameter.

## Verification Plan

### Automated Tests
- Validate TypeScript compilation of the frontend:
  ```powershell
  npm run build --prefix frontend
  ```

### Manual Verification Checklist
- [ ] Car distance matches API (7.481 km)
- [ ] Car duration matches API (9m 44s)
- [ ] Motorbike distance matches API (7.795 km)
- [ ] Motorbike duration matches API (12m 57s)
- [ ] Bicycle distance matches API (7.353 km)
- [ ] Bicycle duration matches API (26m 6s)
- [ ] Walking distance matches API (7.076 km)
- [ ] Walking duration matches API (1h 24m 55s)
- [ ] API is re-called with correct mode query param when transport tab changes.
- [ ] Old polyline is cleared and new polyline is rendered on map when transport mode switches.
- [ ] Fit bounds camera adjustment triggers on mode change.
- [ ] Directions panel origin dot is RED (`#ef4444`) and destination dot is GREEN (`#10b981`).
- [ ] Map origin marker (A) is RED and destination marker (B) is GREEN.

---

# Implementation Plan: Route Marker UI Optimization

## User Review Required

> [!IMPORTANT]
> - The origin and destination route markers will be simplified to remove the letters "A" and "B" and the white circular core backgrounds, optimizing the map for a cleaner, modern look.
> - The position, color (RED for origin, GREEN for destination), fitBounds logic, and interactions will be completely preserved.

## Proposed Changes

### Map Rendering Component

#### [MODIFY] [MapContainer.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapContainer.tsx)
- Modify the origin marker options:
  - Remove `label: 'A'` parameter.
  - Modify `iconView` SVG to remove the `<circle>` and `<text>` elements, making it a solid RED (`#ef4444`) pin.
- Modify the destination marker options:
  - Remove `label: 'B'` parameter.
  - Modify `iconView` SVG to remove the `<circle>` and `<text>` elements, making it a solid GREEN (`#10b981`) pin.

## Verification Plan

### Automated Tests
- Validate TypeScript compilation of the frontend:
  ```powershell
  npm run build --prefix frontend
  ```

### Manual Verification Checklist
- [ ] Origin marker is RED pin without "A" or white dot core.
- [ ] Destination marker is GREEN pin without "B" or white dot core.
- [ ] All route and camera fitBounds properties remain functional.



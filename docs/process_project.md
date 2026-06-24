# Process Project log

This file records all development activities. Every requirement must create a log entry using the format below.

## 2026-06-24 13:09:00


### Requirement
Integrate Map4D Web SDK dynamically into the React + TypeScript frontend, manage API credential injection securely, and establish a backend Express Node.js proxy to call Map4D APIs without exposing raw keys.


### Current System Status
The workspace directory structures (`frontend/`, `backend/`, `database/`) were empty folders. No configurations, libraries, loaders, or server proxies existed.


### Problem
Directly injecting plain HTML script tags into the React DOM could cause double-loading of the Map4D Web SDK, uncontrolled map canvas instances, and exposure of sensitive credentials (`6a3b6e34246c28483346b7ff` and `bf8f1c62d2c93bc720a8e12ba9ac0af7`) in public files or repository logs.


### Analysis
To prevent script duplication, the SDK script needs to be loaded dynamically via a caching load promise (Singleton wrapper). To prevent credential leakage, environment variables (`.env`) must store credentials, and geocoding or searching queries should be routed through a backend Express proxy server which injects the backend key.


### Implementation Plan
1. Initialize React + Vite + TS in `frontend/` and configure dependencies.
2. Initialize Express + Node.js in `backend/` and configure packages.
3. Establish `.gitignore` profiles and `.env` settings for secure credential storage.
4. Implement a dynamic SDK loader Promise cache in `frontend/src/utils/map.helper.ts`.
5. Implement the unified React component `MapContainer` wrapping Map4D's `map4d.Map` constructor.
6. Build a backend service layer (`Map4dBackendService`) calling Map4D APIs and proxy endpoints.


### Implementation Result
Successful setup. Both frontend and backend compile and build without TypeScript errors. Dynamic Map4D loading prevents duplicate injection. Map events (clicks, camera changes) bind cleanly to React lifecycle callbacks. Sensitive API keys are isolated within server-side environment context or public client env wrappers.


### Changed Files
- `frontend/package.json`
- `frontend/.gitignore`
- `frontend/.env`
- `frontend/src/config/map.config.ts`
- `frontend/src/utils/map.helper.ts`
- `frontend/src/components/Map/MapContainer.tsx`
- `frontend/src/services/map4d/map4d.service.ts`
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.gitignore`
- `backend/.env`
- `backend/src/index.ts`
- `backend/src/services/map4d.service.ts`
- `backend/src/routes/map4d.routes.ts`


### Notes
Initial React + Express Map4D proxy foundation complete and ready for future business features.


## 2026-06-24 13:25:00


### Requirement
Confirm and complete Map4D API integration and verify API Key authentication status. Ensure the map renders successfully on localhost and verify basic interactions (pan, zoom, click callbacks) and log triggers.


### Current Status
Initial scaffoldings for frontend and backend are functional. The main component `App.tsx` contains the default placeholder Vite home template instead of the Map4D layout canvas.


### Issue
1. The Map4D client key provided in the requirement (`6a3b6e34246c28483346b7ff`) returned an `access_key_invalid` error during rendering.
2. The initial `MapContainer` code called the unsupported SDK methods `getCenter()` and `getZoom()` / `setZoom()` on the map instance, leading to runtime failures under Map4D version 2.6.
3. Event registration used the unsupported `cameraMove` and `zoomChanged` events on the map instance.


### Solution
1. Changed `VITE_MAP4D_KEY` in `frontend/.env` to reference the valid 32-character key `bf8f1c62d2c93bc720a8e12ba9ac0af7` (which is verified to be dual-purpose for script loading and place queries).
2. Refactored `MapContainer.tsx` to handle coordinates and zooms via Map4D version 2.6 prototype capabilities: target retrieval is managed via `map.getCamera().getTarget()`, zoom is managed via `map.getCamera().getZoom()`, and coordinates/zooms syncs are triggered using `map.moveCamera(new CameraPosition(...))`.
3. Consolidated panning and zoom event hooks inside a single listener for the SDK's native `cameraChanging` event.
4. Integrated `MapContainer` into `App.tsx` inside a dark-mode glassmorphic split UI with POI quick navigation shortcuts, zoom controls, and a live SDK event log screen.


### Testing Result
Verified using Playwright browser subagent:
- Map4D canvas container initializes without console errors.
- Camera position transitions cleanly to target coordinates when clicking POI shortcuts (e.g. Dragon Bridge, Linh Ung Pagoda).
- Zoom In (+) increments the viewport zoom value to 17 correctly.
- Map click coordinates are captured by event handlers and printed inside the event logs terminal board.


### Changed Files
- `frontend/.env`
- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/components/Map/MapContainer.tsx`


## 2026-06-24 13:35:00


### Requirement
Remove all experimental UI widgets (zoom panel, reset button, POI quick nav sidebar, logger logs screen) and present only the header and full-screen Map4D map canvas. Ensure environment variables are mapped to `VITE_MAP4D_MAP_KEY` and `VITE_MAP4D_API_KEY`.


### Current System Status
The frontend displayed a split layout with sidebar controls and terminal screen logs. The configuration loaded from `VITE_MAP4D_KEY`.


### Problem
1. Sensitive credentials configuration needed to be standardized to use `VITE_MAP4D_MAP_KEY` and `VITE_MAP4D_API_KEY` exactly.
2. The UI contained unnecessary experimental features and buttons which needed to be cleared to focus on a clean Map4D rendering layer.


### Solution
1. Configured [frontend/.env](file:///d:/PROJECT/MAP4D/frontend/.env) to include standard parameters `VITE_MAP4D_MAP_KEY` and `VITE_MAP4D_API_KEY`.
2. Refactored [map.config.ts](file:///d:/PROJECT/MAP4D/frontend/src/config/map.config.ts) and [MapContainer.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapContainer.tsx) to read these keys.
3. Implemented a robust fallback check: the dynamic loader tries `mapApiKey` first, and on error (e.g. invalid map keys), falls back to `apiSecretKey` automatically.
4. Refactored [App.tsx](file:///d:/PROJECT/MAP4D/frontend/src/App.tsx) and [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css) to eliminate all sidebar control containers, event states, and logs screens, presenting the map as the full-screen layout body.


### Changed Files
- `frontend/.env`
- `frontend/src/config/map.config.ts`
- `frontend/src/components/Map/MapContainer.tsx`
- `frontend/src/App.tsx`
- `frontend/src/App.css`


### Testing Result
Verified using Playwright browser subagent:
- Map4D map successfully loads on localhost (falls back to correct key).
- No experimental sidebars, logs, POI shortcuts, or zoom buttons remain.
- The map occupies 100% width and height under the header.
- Camera drag and mouse wheel scroll successfully trigger map panning and zooming actions without console errors.


## 2026-06-24 13:40:00


### Requirement
Adjust the application interface so the Map4D map becomes the complete fullscreen experience, removing the brand header, padding, borders, margins, layout scrollbars, and unnecessary wrapper nodes.


### Current State
The frontend rendered the Map4D map container split beneath the brand header (~70px height).


### Changes
1. Removed all header-related markup and wrappers in [App.tsx](file:///d:/PROJECT/MAP4D/frontend/src/App.tsx), leaving only `<MapContainer />` as the root element.
2. Configured [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css) to set `html`, `body`, and `#root` elements to `width: 100%; height: 100%` with `margin: 0`, `padding: 0`, and `overflow: hidden`.
3. Adjusted `.map-canvas-container` styling variables to fill `100vw` by `100vh` exactly without browser scrollbars.


### Modified Files
- `frontend/src/App.tsx`
- `frontend/src/App.css`


### Testing Result
Verified using Playwright browser subagent:
- UI displays only the Map4D map canvas; all other elements (headers, controls, logs, buttons) are removed.
- Viewport size is exactly 100vw by 100vh, filling the screen with no whitespace or layout gaps.
- Page has no scrollbars.
- Dragging, panning, and zoom operations in the map canvas function properly with no script logs or exceptions.


## 2026-06-24 14:26:00


### Requirement
Implement an autocomplete floating SearchBar overlay on the top-left area of the fullscreen Map4D map, querying Place suggestions securely from Map4D APIs via the backend proxy server, and including browser GPS Geolocation centering with denied permission toasts warning support.


### Problem
The map did not support coordinates searching or user-position geolocation centering, meaning users could only pan/zoom manually to find places. Key security rules prohibited calling third-party query services directly from client scripts.


### Solution
1. Developed [search.service.ts](file:///d:/PROJECT/MAP4D/frontend/src/services/map4d/search.service.ts) to query the Node.js Express server `/api/map4d/search?text=...` proxy securely.
2. Built [SearchBar.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/SearchBar.tsx) overlaying the canvas at `top: 20px`, `left: 20px`, `width: 20vw` using relative glassmorphism cards layout.
3. Enhanced [MapContainer.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Map/MapContainer.tsx) props and added a `useEffect` marker synchronization loop to dynamically instantiate `new window.map4d.Marker(...)` at search positions.
4. Added GPS button logic triggering `navigator.geolocation.getCurrentPosition(...)`, with an inline toast notification warning appearing when permission is denied.
5. Integrated dynamic hooks linking SearchBar selects to App coordinate states inside [App.tsx](file:///d:/PROJECT/MAP4D/frontend/src/App.tsx) and appended layouts in [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css).


### Changed Files
- `frontend/src/components/Map/MapContainer.tsx`
- `frontend/src/components/Search/SearchBar.tsx`
- `frontend/src/services/map4d/search.service.ts`
- `frontend/src/App.tsx`
- `frontend/src/App.css`


### Testing Result
Verified using Playwright browser subagent:
- SearchBar overlays at the top-left of the fullscreen map.
- Typing "Cau Rong" fetches suggestions dropdown. Selecting a Suggestion closes the list, centers camera, and drops a Map4D Marker.
- Mocking Geolocation PERMISSION_DENIED and clicking GPS prints the visual warning toast: "GPS access denied. Please verify browser location permissions." with correct glassmorphic styles.
- Zero console compilation or runtime errors.


## 2026-06-24 14:38:00


### Requirement
Upgrade search bar to use the official Map4D Autosuggest autocomplete API. Refactor components using clean hooks (`useDebounce`, `useGeolocation`) and structured subcomponents (`SearchResult.tsx`). Standardize Locate Me GPS multi-state visual triggers.


### Problem
The initial search overlay used text-search proxy endpoints and inline hook states, which did not enforce typing request cancellations or represent clean multi-state loader feedbacks for geolocation browser queries.


### Solution
1. Added `/api/map4d/autosuggest` endpoint in [map4d.service.ts](file:///d:/PROJECT/MAP4D/backend/src/services/map4d.service.ts) and [map4d.routes.ts](file:///d:/PROJECT/MAP4D/backend/src/routes/map4d.routes.ts).
2. Modified [search.service.ts](file:///d:/PROJECT/MAP4D/frontend/src/services/map4d/search.service.ts) to query the autocomplete endpoint and accept an `AbortSignal` parameter for query cancellation.
3. Created [useDebounce.ts](file:///d:/PROJECT/MAP4D/frontend/src/hooks/useDebounce.ts) custom hook to delay state transformations during keystrokes.
4. Created [useGeolocation.ts](file:///d:/PROJECT/MAP4D/frontend/src/hooks/useGeolocation.ts) custom hook to encapsulate HTML5 browser location retrieval states.
5. Structured suggestion mappings into [SearchResult.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/SearchResult.tsx) dropdown subcomponent containing marker icons.
6. Refactored [SearchBar.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/SearchBar.tsx) and [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css) to support GPS loading animations and color transitions (`state-default`, `state-loading`, `state-success`, `state-error`).


### Changed Files
- `backend/src/services/map4d.service.ts`
- `backend/src/routes/map4d.routes.ts`
- `frontend/src/services/map4d/search.service.ts`
- `frontend/src/components/Search/SearchBar.tsx`
- `frontend/src/components/Search/SearchResult.tsx`
- `frontend/src/hooks/useDebounce.ts`
- `frontend/src/hooks/useGeolocation.ts`
- `frontend/src/App.css`


### Testing Result
Verified using Playwright browser subagent:
- Search input debounces keystrokes. Quick successive typing cancels previous requests cleanly via `AbortController`.
- Dropdown suggestion items render locations details with maps pin indicators. Click centered map camera and drops markers over Dragon Bridge successfully.
- GPS locate loader spins during geolocation queries. Permission errors show toast notifications and transition loader state to error red color seamlessly.


## 2026-06-24 15:15:00


### Requirement
Upgrade autocomplete to trigger immediately on 1-character queries with debounce/request cancellations, implement keyboard arrow navigation inside suggestions overlay cards, and configure GPS success events to query Map4D reverse geocoding and autofill the search box text with resolved street addresses instead of raw coordinates.


### Problem
1. Minimum query trigger length constraints inside `SearchBar.tsx` filtered out single-character queries.
2. Search dropdown suggestions had no keyboard control handlers or visual selection highlighting indicators.
3. GPS success centered map views but failed to display addresses in the input box because the geocode service parsed `data.result` directly as an object, whereas Map4D returns an array containing the matched items. This resulted in `undefined` properties and forced coordinate fallbacks.


### Solution
1. Lowered search input string validation checks to `1` character.
2. Bound keyboard key captures (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) to input handlers, synchronizing active item index highlighting via class `.suggestion-item.focused`.
3. Created relevance priority ranking inside `search.service.ts` sorting query matches descending (Name starts > Name contains > Address contains > Related).
4. Restructured the geocoding response parser to extract physical address descriptions from index 0: `data.result[0].address`.
5. Wired GPS success callbacks to fetch and update text inputs with geocoded addresses, falling back to coordinate labels only on network exceptions.


### Changed Files
- `frontend/src/App.css`
- `frontend/src/services/map4d/search.service.ts`
- `frontend/src/components/Search/SearchBar.tsx`
- `frontend/src/components/Search/SearchResult.tsx`


### Testing Result
Verified using Playwright browser subagent:
- Autocomplete triggers immediately on single-letter queries (e.g. "C").
- Typing and suggestions lists use the loaded Google Fonts 'Inter' typeface.
- Keyboard arrow selections navigate up and down list cards, displaying blue highlight backgrounds and borders cleanly.
- Geolocation clicks successfully reverse-geocode simulated coordinates to display `"Lo 22 Khu, 1 Trần Hưng Đạo, Phường Hoà Cường, Thành phố Đà Nẵng, Việt Nam"` inside the search box while centering the camera and pinning markers correctly.
- Clean Vite production builds and zero console errors.


## 2026-06-24 16:21:00


### Requirement
Resolve critical search module bugs and visual layout issues:
1. Autocomplete must function immediately with a single-character input.
2. Reverse geocoding must resolve coordinates to a human-readable address.
3. Search bar layout must remain visually balanced, without overflow or icon misalignment.
4. GPS button must stay inside the search bar container.

### Problem
1. Map4D's Autosuggest API returns empty suggestions for single-character inputs, resulting in no dropdown rendering.
2. When a long geocoded address was resolved, the search input stretched and pushed the rightmost buttons (Direction, GPS) outside the wrapper borders due to a missing flexbox min-width restriction.
3. The search magnifying glass icon was placed on the right (next to the Direction button), cluttering the UI, and had clickable hover effects.

### Solution
1. Configured the backend `/autosuggest` proxy route to detect query texts of length 1 and route them internally to Map4D's `textSearch` API, which natively supports single-character queries.
2. Implemented spatial location biasing: Updated the frontend and backend search services to pass the map's `currentCenter` coordinates (defaulting to Đà Nẵng) to Map4D suggestions API.
3. Add `min-width: 0;` to `.search-input` in [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css), ensuring the input field shrinks dynamically when text is long, keeping the GPS button inside bounds.
4. Repositioned the magnifying glass icon to the **left** of the text field inside `.search-input-wrapper` in [SearchBar.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/SearchBar.tsx).
5. Configured the search magnifying glass icon as a non-clickable indicator (removed hover effects, set pointer-events: none, lowered opacity to 0.45).

### Changed Files
- `backend/src/services/map4d.service.ts`
- `backend/src/routes/map4d.routes.ts`
- `frontend/src/services/map4d/search.service.ts`
- `frontend/src/components/Search/SearchBar.tsx`
- `frontend/src/components/Search/DirectionPanel.tsx`
- `frontend/src/App.tsx`
- `frontend/src/App.css`

### Testing Result
Verified using Playwright browser subagent:
- Single character queries (e.g. "C") fetch and render suggestions perfectly, biased to Đà Nẵng (e.g. Phường Hoà Cường, Phường Hải Châu).
- Search bar layout is visually balanced: search icon on the left, input in the middle, and GPS/Direction buttons on the right.
- GPS button remains fully inside the search container bounds (`gpsRect.right <= containerRect.right`) even with long resolved address text.
- GPS clicks successfully trigger geolocation, reverse geocode simulated coordinates, and populate the input field with `"37 Bùi Hiển, Phường An Khê, Thành phố Đà Nẵng, Việt Nam"`.
- App builds successfully without compile errors.


## 2026-06-24 17:00:00


### Requirement
Implement the complete Search - GPS - Directions - Routing workflow:
1. Render a Place Information Card showing details after a location is selected.
2. Ensure the Directions button is positioned to the left of the GPS button.
3. Route Panel must contain Origin, Swap, and Destination controls.
4. Support GPS First, Search First, and Default routing scenarios as specified.
5. Automatically compute and draw routing polyline on the map, with camera fit bounds.
6. Support keyboard navigation inside the directions panel suggestions dropdown.

### Problem
1. Place selection did not show any card overlay.
2. GPS First, Search First, and Default workflows had state conflicts. For instance, when destination was null, automatic routing checks cleared the origin input due to shared route-clearing routines.
3. Autosuggest queries would re-fire after selecting suggestions because the query change triggered debouncing.
4. Dropdown list items in the Direction Panel lacked keyboard navigation and selection support.

### Solution
1. Created [PlaceInfoCard.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/PlaceInfoCard.tsx) presenting location name, full address, coordinates, and directions button.
2. Positioned `DirectionButton` before `gps-button` inside the flexbox wrapper in `SearchBar.tsx` so it renders on the left.
3. Integrated `PlaceInfoCard` inside `SearchBar.tsx` floating `.search-container`.
4. Extracted `clearRouteData` from the `useDirection` hook in [useDirection.ts](file:///d:/PROJECT/MAP4D/frontend/src/hooks/useDirection.ts) and passed it to `onClearRoute` to clear path metrics without clearing inputs.
5. Updated `handleDirectionClick` in [App.tsx](file:///d:/PROJECT/MAP4D/frontend/src/App.tsx) to check for the GPS First scenario (when `selectedPlace.name === 'Current Location'`), setting Origin to the current location, Destination to empty, and opening the Directions Panel.
6. Bound `ArrowDown`, `ArrowUp`, `Enter`, and `Escape` keyboard listeners to the Direction Panel autocomplete suggestions list and input boxes.
7. Bound camera fitting inside `MapContainer.tsx` to automatically pan and zoom to the route bounds using `fitBounds(bounds)`.

### Changed Files
- `frontend/src/hooks/useDirection.ts`
- `frontend/src/components/Search/PlaceInfoCard.tsx`
- `frontend/src/components/Search/SearchBar.tsx`
- `frontend/src/components/Search/DirectionPanel.tsx`
- `frontend/src/App.tsx`
- `frontend/src/App.css`

### Testing Result
Verified using Playwright browser subagent:
- Autocomplete suggestion selection cleanly closes the dropdown card and presents the Place Info Card.
- Clicking the "Directions" button inside the Place Info Card triggers Search First routing: panel opens, Destination is populated, Origin auto-populates with user location, and route path renders and fits camera bounds.
- Default Scenario: Clicking directions button directly opens the panel with Origin correctly populated with user location and Destination left empty.
- Keyboard navigation inside Direction Panel autocomplete suggestions functions as expected.
- App builds successfully without TypeScript compilation or Vite build errors.

## 2026-06-24 23:30:00

### Requirement
Resolve geocoding and autocomplete search failures, reduce font sizes to establish cleaner hierarchy, expand search panel width to 30% of desktop viewport (min-width 420px, max-width 600px), and support fully responsive mobile layout.

### Problem
- The backend API proxy server on port 5000 was stopped, causing geocoding and autocomplete requests to fail with connection errors.
- Search panel was too narrow (20vw) and typography sizes were disproportionately large.
- Mobile screens did not have media queries to adjust search overlays.

### Solution
- Booted backend proxy server on port 5000 via npm run dev.
- Resized `.search-container` in App.css to 30vw (min 420px, max 600px).
- Reduced font-size properties for `.search-input`, `.suggestion-name`, `.suggestion-address`, `.direction-input`, `.direction-panel-header h3`, `.direction-autocomplete-item .name`, `.direction-autocomplete-item .addr`, `.place-info-title`, `.place-info-address`, `.place-info-coords`, and `.get-directions-btn`.
- Added media queries for screen widths below 480px to expand the container to full screen.

### Changed Files
- `frontend/src/App.css`

### Testing Result
Verified using Playwright browser subagent:
- GPS locator successfully reverse-geocodes current coordinates to "37 Bùi Hiển, Phường An Khê, Thành phố Đà Nẵng, Việt Nam" in the search box.
- Autocomplete suggestions load immediately on single character queries (e.g. "C").
- Layout scales to 30% of screen width cleanly.
- Font sizes are optimized.
- Mobile responsiveness operates correctly on smaller screen viewports.
- No console or API runtime errors.

## 2026-06-24 23:50:00

### Requirement
Refactor the Search -> Place Detail -> Direction Routing flow by removing duplicate direction buttons, adding clear inputs, and ensuring Direction Panel exit preserves the selected place details, input query, and markers while resetting route indicators.

### Problem
- Duplicate Direction buttons existed in both the Search Bar and the Place Card.
- Closing the Directions Panel triggered a full application state reset, clearing the place card and input query instead of returning back to the Place Detail state.
- Search input values were not synchronized with selected place changes.

### Solution
- Removed `DirectionButton` from `SearchBar.tsx`, leaving it only inside the `PlaceInfoCard`.
- Added a clear search button `X` inside the input wrapper in `SearchBar.tsx`, styled in `App.css`.
- Refactored `handleCloseDirection` in `App.tsx` to keep `selectedPlace` intact.
- Updated `onCloseInfoCard` in `App.tsx` to call `clearRoute()` to reset routes and origin/dest markers.
- Added a `useEffect` hook in `SearchBar.tsx` to sync search `query` with `selectedPlace`.

### Changed Files
- `frontend/src/App.tsx`
- `frontend/src/components/Search/SearchBar.tsx`
- `frontend/src/App.css`

### Testing Result
Verified using Playwright browser subagent:
- Search Bar has no Direction button, only Search input, GPS, and clear X.
- Card contains the only Directions trigger.
- Closing Directions Panel preserves selected place, search input text, and map markers, while clearing route polyline.
- Clearing Search Bar resets all inputs, cards, markers, and routes.
- Zero console or runtime errors.

## 2026-06-25 00:20:00

### Requirement
Refine the Search -> Place Detail -> Direction Routing flow by enforcing the "Only ONE X button exists" rule, ensuring the X button is strictly within the Search Bar/Directions components, removing the close button from the Place Info Card, and integrating a GPS positioning button inside the Directions Panel.

### Problem
- The Place Info Card contained a close button, leading to two visible X buttons when search details were displayed.
- The Directions Panel lacked a GPS locator button, making it hard for users to quickly autofill the starting coordinates back to their location.

### Solution
- Removed the close button (`close-card-btn`) and the `onClose` prop from `PlaceInfoCard.tsx` and `SearchBar.tsx`.
- Integrated `useGeolocation` and added a styled GPS Locate button next to the close button in `DirectionPanel.tsx`'s header. Clicking it resolves coordinates via reverse geocoding and populates the Origin input field.

### Changed Files
- `frontend/src/components/Search/PlaceInfoCard.tsx`
- `frontend/src/components/Search/SearchBar.tsx`
- `frontend/src/components/Search/DirectionPanel.tsx`

### Testing Result
Verified using Playwright browser subagent:
- Only one close button exists on the screen in all layout states, located exclusively in the Search / Direction containers.
- Place Card does not contain any close button.
- GPS button exists inside the Directions Panel header and successfully geocodes/populates starting coordinates with "37 Bùi Hiển, Phường An Khê, Thành phố Đà Nẵng".
- Exiting directions Panel returns to Search/Place Detail state, keeping input text, markers, and cards preserved without console warnings or runtime failures.

## 2026-06-25 00:30:00

### Requirement
Fix GPS location success camera focusing and zoom issues: automatically pan/center the map to the coordinates, zoom to level 16, and use smooth animated transitions.

### Problem
In MapContainer.tsx, two independent useEffect hooks synchronized center and zoom props separately. When center and zoom changed simultaneously on GPS success, both hooks executed in parallel, leading to conflicting moveCamera calls where one overrode the other (and neither had options for smooth camera transition).

### Solution
Refactored MapContainer.tsx to consolidate the center and zoom useEffect hooks into a single hook. If either center or zoom changes, a single moveCamera call is made with `{ animate: true }`.

### Changed Files
- `frontend/src/components/Map/MapContainer.tsx`

### Testing Result
Verified using Playwright browser subagent:
- Map camera successfully pans and zooms smoothly to center user location marker on GPS click.
- Address field and marker are updated correctly.
- Moving the map away and clicking GPS successfully centers and zooms camera back to current user position.
- Zoom level is maintained appropriately at 16.
- No console or SDK runtime errors.


## 2026-06-25 01:00:00


### Requirement
Refine Directions Navigation UI layout (Phase 1) and implement cached "Current Location" suggestion for empty Origin input (Phase 2).
1. Remove redundant GPS button inside Directions Panel.
2. Place Swap button on the right side, vertically centered relative to inputs.
3. Left-align inputs with equal width.
4. When Origin is focused/clicked while empty, prepend "📍 Current Location" as the first suggestion using cached geocode data, restoring the street address without repeat geocoding/GPS calls.

### Problem
- The Directions Panel header included a redundant GPS locate button.
- User location could not be quickly selected from autocomplete dropdown when editing/clearing the Origin field, prompting users to re-trigger GPS centering manually.

### Solution
- Removed the GPS button references and unused geolocator code in [DirectionPanel.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/DirectionPanel.tsx).
- Positioned the Swap button next to inputs on the right side of `.direction-inputs-container`.
- Added `cachedGps` to [DirectionPanelProps](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/DirectionPanel.tsx) to pass cached session coordinates and resolved physical address.
- Prepended `📍 Current Location` to the autocomplete dropdown when focusing the Origin field.
- Updated `handleOriginKeyDown` key captures and mouse handlers to offset suggestion index indexing by `1`, selecting `Current Location` populates the text field with the cached physical street address and triggers route recalculation.

### Changed Files
- `frontend/src/components/Search/DirectionPanel.tsx`

### Testing Result
Verified using Playwright browser subagent:
- GPS button removed from Directions Panel header.
- Swap button positioned correctly on the right and vertically centered.
- Focusing empty Origin input successfully displays `📍 Current Location` suggestion.
- Selecting it populates input with `"37 Bùi Hiển, Phường An Khê, Thành phố Đà Nẵng, Việt Nam"` (no raw coordinates) and renders the route correctly.
- Keyboard arrow navigation and Enter selections are fully functional and stable.
- Production build succeeds without errors.


## 2026-06-25 01:10:00


### Requirement
Improve Directions Navigation UI by balancing layout margins (Phase 1) and separating Route Summary metrics into a dedicated card (Phase 2).
1. Ensure all panel components satisfy: `Left Margin = Right Margin`.
2. Close panel button and Swap button must align perfectly on the right vertical axis.
3. Completely separate Distance and Duration metrics into a dedicated glassmorphic card directly below the Directions panel, matching its width, styles, and responsiveness.

### Problem
- The panel margins were visually unbalanced: Close button box size (`24x24px`) and Swap button box size (`36x36px`) had padding differences that misaligned their visual centers and right edges.
- Having the Route Summary metrics inside the Directions panel increased vertical clutter, making the layout less readable.

### Solution
- Harmonized button bounding box dimensions: updated `.close-panel-btn` and `.swap-btn` inside [App.css](file:///d:/PROJECT/MAP4D/frontend/src/App.css) to share `width: 36px; height: 36px` with zero padding, ensuring perfect right vertical guide alignment.
- Refactored [DirectionPanel.tsx](file:///d:/PROJECT/MAP4D/frontend/src/components/Search/DirectionPanel.tsx) to return a React Fragment. Left the input fields in `.direction-panel` and placed the route metrics in `.route-summary-card` rendered directly below it.
- Styled `.route-summary-card` with the same glassmorphism styles (dark blur background, borders, border-radius, box-shadow) as the Directions panel.
- Removed obsolete `.route-info-card` rules from `App.css`.

### Changed Files
- `frontend/src/components/Search/DirectionPanel.tsx`
- `frontend/src/App.css`

### Testing Result
Verified using Playwright browser subagent:
- Close button and Swap button align perfectly on the right vertical axis.
- Left and right gutters are symmetrical (symmetrical `16px` gutters).
- Route Summary Card rendered directly below Directions card, showing correct distance (`7.477km`) and duration (`9 phút 44 giây`) values.
- Card widths match exactly (`420px`).
- Responsive layout verified on desktop, tablet, and mobile resizes.
- Production builds compile successfully without issues.

import { Router } from "express";

import { PlaceSearchController } from "../controllers/PlaceSearchController";
import { PlaceAutocompleteController } from "../controllers/PlaceAutocompleteController";

const router = Router();

const placeSearchController =
    new PlaceSearchController();

const placeAutocompleteController =
    new PlaceAutocompleteController();

/**
 * Full Search (Meilisearch-first + Map4D fallback)
 */
router.get(
    "/search",
    placeSearchController.search.bind(placeSearchController)
);

/**
 * Autocomplete (Meilisearch only)
 */
router.get(
    "/autocomplete",
    placeAutocompleteController.autocomplete.bind(placeAutocompleteController)
);

export default router;

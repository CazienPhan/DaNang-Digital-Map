import { Router } from "express";

import { ProductSearchController } from "../controllers/ProductSearchController";
import { ProductAutocompleteController } from "../controllers/ProductAutocompleteController";

const router = Router();

const productSearchController =
    new ProductSearchController();

const productAutocompleteController =
    new ProductAutocompleteController();

/**
 * Full Search
 */
router.get(
    "/search",
    productSearchController.search.bind(productSearchController)
);

/**
 * Autocomplete
 */
router.get(
    "/autocomplete",
    productAutocompleteController.autocomplete.bind(productAutocompleteController)
);

export default router;
import categoryData from "../config/categoryDictionary.json";

/**
 * CategoryDetectionService — backend-only category detection.
 *
 * Loads the category dictionary JSON into an in-memory lookup map at module
 * load time (same pattern as constant imports). The map associates each
 * normalized keyword with its category identifier.
 *
 * Used exclusively by PlaceSearchController to determine the geographic
 * filter radius before executing a Meilisearch full search.
 *
 * This service does NOT:
 *   - modify the user's original search query
 *   - index anything into Meilisearch
 *   - perform fuzzy or partial matching
 *   - generate additional synonyms
 */

interface CategoryDetectionResult {
    isCategory: boolean;
    category?: string;
}

/**
 * Pre-built lookup: normalized keyword → category identifier.
 * Built once at module load; shared across all requests.
 */
const keywordToCategory = new Map<string, string>();

const categories = categoryData.categories as Record<
    string,
    { keywords: string[] }
>;

for (const [categoryId, entry] of Object.entries(categories)) {
    for (const keyword of entry.keywords) {
        // Keywords in the dictionary are already lowercase.
        // We still normalize to ensure consistency.
        keywordToCategory.set(keyword.trim().toLowerCase(), categoryId);
    }
}

export class CategoryDetectionService {
    /**
     * Detect whether a query exactly matches a category keyword.
     *
     * Normalization: trim + toLowerCase — the simplest exact-match approach
     * consistent with the specification. The original query is never modified.
     *
     * @param query — the user's raw search query (will be normalized internally)
     * @returns { isCategory, category? }
     */
    static detect(query: string): CategoryDetectionResult {
        const normalized = query.trim().toLowerCase();
        const category = keywordToCategory.get(normalized);

        if (category) {
            return { isCategory: true, category };
        }

        return { isCategory: false };
    }
}

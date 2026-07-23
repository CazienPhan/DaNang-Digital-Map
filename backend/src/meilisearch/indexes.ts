/**
 * meilisearch/indexes.ts
 *
 * Single source of truth for every Meilisearch index name used in this
 * project.  Import `INDEXES` wherever you need an index name; never
 * hard-code the string directly in other files.
 *
 * HOW TO ADD A NEW INDEX:
 *   1. Add a new key/value pair here.
 *   2. Create a matching settings file in settings/<name>.settings.ts.
 *   3. Register it in applySettings.ts.
 */

export const INDEXES = {
    PRODUCTS: 'products',
} as const;

export type IndexName = (typeof INDEXES)[keyof typeof INDEXES];

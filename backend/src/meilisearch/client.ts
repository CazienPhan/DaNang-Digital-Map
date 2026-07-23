/**
 * src/meilisearch/client.ts
 *
 * Single responsibility:
 *   - Load environment variables
 *   - Create the Meilisearch client
 *   - Export a shared client instance
 *
 * Does NOT contain search, indexing, settings, or business logic.
 *
 * NOTE: `meilisearch@0.60` is a pure ESM package. This project uses CommonJS
 * (no "type":"module" in package.json). We therefore load it with a dynamic
 * import() — the standard Node.js pattern for consuming an ESM package from
 * a CJS module. The client is initialised once and shared as a promise.
 */

import dotenv from "dotenv";

dotenv.config();

const host = process.env.MEILISEARCH_HOST;
const apiKey = process.env.MEILISEARCH_ADMIN_KEY;

if (!host) {
  throw new Error("Missing environment variable: MEILISEARCH_HOST");
}

if (!apiKey) {
  throw new Error("Missing environment variable: MEILISEARCH_ADMIN_KEY");
}

// Capture in local vars to satisfy TypeScript's definite-assignment analysis.
const _host = host;
const _apiKey = apiKey;

// Dynamic import is the correct CJS→ESM interop pattern.
// The promise is created once at module load and shared across all consumers.
export const meiliClientPromise = import("meilisearch").then(
  ({ Meilisearch }) => new Meilisearch({ host: _host, apiKey: _apiKey })
);
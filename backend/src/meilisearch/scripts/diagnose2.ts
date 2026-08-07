/**
 * src/meilisearch/scripts/diagnose2.ts
 *
 * Inspect the existing "Product" index — its settings and document count —
 * so we know whether to reuse it or recreate it as "products".
 */

import dotenv from "dotenv";
dotenv.config();

const HOST    = process.env.MEILISEARCH_HOST    ?? "(MISSING)";
const API_KEY = process.env.MEILISEARCH_ADMIN_KEY ?? "(MISSING)";

async function main() {
    const { Meilisearch } = await import("meilisearch");
    const client = new Meilisearch({ host: HOST, apiKey: API_KEY });

    // List all indexes with details
    const result = await client.getIndexes();
    const indexes = result?.results ?? result;
    console.log("All indexes (raw):", JSON.stringify(indexes, null, 2));

    for (const idx of indexes as any[]) {
        const uid = idx.uid;
        console.log(`\n=== Index: "${uid}" ===`);
        try {
            const stats = await client.index(uid).getStats();
            console.log("  stats:", JSON.stringify(stats, null, 2));
        } catch (e: any) {
            console.error("  stats error:", e?.message);
        }
        try {
            const settings = await client.index(uid).getSettings();
            console.log("  searchableAttributes:", settings.searchableAttributes);
            console.log("  filterableAttributes:", settings.filterableAttributes);
        } catch (e: any) {
            console.error("  settings error:", e?.message);
        }
        try {
            const docs = await client.index(uid).getDocuments({ limit: 2 });
            console.log("  sample documents:", JSON.stringify(docs, null, 2));
        } catch (e: any) {
            console.error("  getDocuments error:", e?.message);
        }
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

/**
 * src/meilisearch/scripts/diagnose.ts
 *
 * One-shot diagnostic: checks every possible failure point and prints a
 * clear report so we know exactly what is wrong before touching anything.
 *
 * Run:  npx ts-node src/meilisearch/scripts/diagnose.ts
 */

import dotenv from "dotenv";
dotenv.config();

const HOST    = process.env.MEILISEARCH_HOST    ?? "(MISSING)";
const API_KEY = process.env.MEILISEARCH_ADMIN_KEY ?? "(MISSING)";
const INDEX   = "products";

console.log("============================================================");
console.log("  MEILISEARCH DIAGNOSTIC");
console.log("============================================================");
console.log(`  HOST    : ${HOST}`);
console.log(`  API_KEY : ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`);
console.log(`  INDEX   : ${INDEX}`);
console.log("============================================================\n");

async function main() {

    // 1. Load ESM client
    let Meilisearch: any;
    try {
        const mod = await import("meilisearch");
        Meilisearch = mod.Meilisearch;
        console.log("[1/6] OK  meilisearch ESM package loaded successfully.");
    } catch (e) {
        console.error("[1/6] FAIL  Failed to import meilisearch package:", e);
        process.exit(1);
    }

    // 2. Create client
    const client = new Meilisearch({ host: HOST, apiKey: API_KEY });

    // 3. Health check
    try {
        const health = await client.health();
        console.log("[2/6] OK  Health check passed:", JSON.stringify(health));
    } catch (e: any) {
        console.error("[2/6] FAIL  Health check FAILED.");
        console.error("           Status :", e?.httpStatus ?? e?.code ?? "unknown");
        console.error("           Message:", e?.message);
        console.error("           Full error:", JSON.stringify(e, null, 2));
        console.error("  => Check MEILISEARCH_HOST and MEILISEARCH_ADMIN_KEY in .env");
        process.exit(1);
    }

    // 4. List all indexes
    let indexList: string[] = [];
    try {
        const result = await client.getIndexes();
        const indexes = result?.results ?? result;
        indexList = Array.isArray(indexes)
            ? indexes.map((i: any) => i.uid)
            : [];
        console.log(`[3/6] OK  Indexes on this Meilisearch instance: [${indexList.join(", ") || "NONE"}]`);
    } catch (e: any) {
        console.error("[3/6] FAIL  Could not list indexes:", e?.message);
        process.exit(1);
    }

    const indexExists = indexList.includes(INDEX);
    if (!indexExists) {
        console.error(`[4/6] FAIL  Index "${INDEX}" does NOT exist.`);
        console.error("           => You must run:  npm run sync:product-types");
        process.exit(1);
    }
    console.log(`[4/6] OK  Index "${INDEX}" exists.`);

    // 5. Index stats
    try {
        const stats = await client.index(INDEX).getStats();
        console.log(`[5/6]     Index stats:`);
        console.log(`           numberOfDocuments : ${stats.numberOfDocuments}`);
        console.log(`           isIndexing        : ${stats.isIndexing}`);
        if (stats.numberOfDocuments === 0) {
            console.warn("           WARN: Index exists but has 0 documents.");
            console.warn("           => Run:  npm run sync:product-types");
        } else {
            console.log(`           OK  ${stats.numberOfDocuments} documents indexed.`);
        }
    } catch (e: any) {
        console.error("[5/6] FAIL  Could not get index stats:", e?.message);
    }

    // 6. Check settings
    try {
        const settings = await client.index(INDEX).getSettings();
        console.log("[6/6]     Index settings:");
        console.log(`           searchableAttributes : ${JSON.stringify(settings.searchableAttributes)}`);
        console.log(`           filterableAttributes : ${JSON.stringify(settings.filterableAttributes)}`);
    } catch (e: any) {
        console.error("[6/6] FAIL  Could not get settings:", e?.message);
    }

    // 7. Test search
    try {
        console.log("\n[SEARCH TEST] Querying 'dong'...");
        const result = await client.index(INDEX).search("dong", { limit: 3 });
        console.log(`  processingTimeMs   : ${result.processingTimeMs}`);
        console.log(`  estimatedTotalHits : ${result.estimatedTotalHits}`);
        console.log(`  hits returned      : ${result.hits.length}`);
        if (result.hits.length > 0) {
            console.log("  First hit:", JSON.stringify(result.hits[0], null, 2));
            console.log("OK  Search works correctly.");
        } else {
            console.warn("WARN  Search returned 0 hits. Index may be empty or documents not matching.");
        }
    } catch (e: any) {
        console.error("FAIL  Search FAILED:");
        console.error("     Message   :", e?.message);
        console.error("     HTTP code :", e?.httpStatus ?? e?.code);
        console.error("     Full error:", JSON.stringify(e, null, 2));
    }

    console.log("\n============================================================");
    console.log("  DIAGNOSTIC COMPLETE");
    console.log("============================================================");
    process.exit(0);
}

main().catch((e) => {
    console.error("Unhandled error:", e);
    process.exit(1);
});

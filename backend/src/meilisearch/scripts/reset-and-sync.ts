/**
 * src/meilisearch/scripts/reset-and-sync.ts
 *
 * STEP 1  – Delete the incorrectly-named "Product" index (if it exists).
 * STEP 2  – Create "products" index with primaryKey = "id".
 * STEP 3  – Apply settings (searchableAttributes, filterableAttributes, etc.)
 * STEP 4  – Fetch all active product_types from Supabase and index them.
 *
 * Run:  npx ts-node src/meilisearch/scripts/reset-and-sync.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { ProductIndexService } from "../services/ProductIndexService";

const WRONG_INDEX = "Product"; // the bad index created manually on the dashboard

async function main() {
    console.log("==================================================");
    console.log("  MEILISEARCH RESET AND FULL SYNC");
    console.log("==================================================\n");

    // Load ESM meilisearch client
    const { Meilisearch } = await import("meilisearch");
    const host   = process.env.MEILISEARCH_HOST!;
    const apiKey = process.env.MEILISEARCH_ADMIN_KEY!;
    const client = new Meilisearch({ host, apiKey });

    // ── STEP 1: Delete the wrong index if it exists ─────────────────────
    console.log(`[STEP 1] Checking for wrong index "${WRONG_INDEX}"...`);
    try {
        const idx = await client.getIndex(WRONG_INDEX);
        if (idx) {
            console.log(`         Found "${WRONG_INDEX}". Deleting...`);
            const deleteTask = await client.deleteIndex(WRONG_INDEX);
            await client.tasks.waitForTask(deleteTask.taskUid);
            console.log(`         Deleted "${WRONG_INDEX}" successfully.`);
        }
    } catch (e: any) {
        // index_not_found is expected — not an error
        if (e?.code === "index_not_found" || e?.httpStatus === 404) {
            console.log(`         "${WRONG_INDEX}" does not exist — nothing to delete.`);
        } else {
            console.warn(`         Could not delete "${WRONG_INDEX}":`, e?.message);
        }
    }

    // ── STEP 2-4: Create index, apply settings, index documents ─────────
    const service = new ProductIndexService();

    console.log("\n[STEP 2] Creating index \"products\" if it does not exist...");
    await service.createIndexIfNotExists();

    console.log("\n[STEP 3] Applying index settings...");
    await service.applySettings();

    console.log("\n[STEP 4] Indexing all documents from Supabase...");
    await service.indexAllDocuments();

    console.log("\n==================================================");
    console.log("  SYNC COMPLETE — Product Search is now live");
    console.log("==================================================");
    process.exit(0);
}

main().catch((e) => {
    console.error("\nFATAL ERROR during sync:");
    console.error(e);
    process.exit(1);
});

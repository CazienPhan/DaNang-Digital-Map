/**
 * scripts/diagnose-storage.ts
 *
 * List Supabase Storage buckets and probe for product image paths.
 */

import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    console.log("=== STORAGE BUCKETS ===");
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) console.error("Bucket list error:", bErr);
    else console.log("Buckets:", buckets?.map(b => b.name));

    // Check ProductCategory bucket
    const BUCKET = "ProductCategory";
    console.log(`\n=== FILES IN "${BUCKET}" (root) ===`);
    const { data: files, error: fErr } = await supabase.storage.from(BUCKET).list("", { limit: 50 });
    if (fErr) console.error("List error:", fErr);
    else console.log("Root folders/files:", JSON.stringify(files?.map(f => f.name), null, 2));

    // Try DongTrungHaThao folder
    const FOLDER = "DongTrungHaThao";
    console.log(`\n=== FILES IN "${BUCKET}/${FOLDER}" ===`);
    const { data: dthtFiles, error: dthtErr } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 50 });
    if (dthtErr) console.error("List error:", dthtErr);
    else console.log("Files:", JSON.stringify(dthtFiles?.map(f => f.name), null, 2));

    // Check all product_types slugs to know folder structure
    console.log("\n=== ALL product_types slugs ===");
    const { data: pts, error: ptErr } = await supabase
        .schema("poi")
        .from("product_types")
        .select("id, slug, name");
    if (ptErr) console.error("Error:", ptErr);
    else console.log(JSON.stringify(pts, null, 2));

    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

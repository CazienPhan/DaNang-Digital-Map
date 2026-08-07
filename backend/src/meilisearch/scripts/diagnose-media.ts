/**
 * scripts/diagnose-media.ts
 *
 * Probes Supabase to find where product media is stored.
 * Checks multiple table names, schemas, and column names.
 *
 * Run:  npx ts-node src/meilisearch/scripts/diagnose-media.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRODUCT_TYPE_ID = "900c11dc-687a-41d3-9cf4-05a98d0cf496";

async function probe(label: string, fn: () => Promise<any>) {
    try {
        const result = await fn();
        console.log(`[OK]  ${label}:`, JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error(`[ERR] ${label}:`, e?.message ?? e);
    }
}

async function main() {
    console.log("================================================");
    console.log("  SUPABASE MEDIA TABLE DIAGNOSTIC");
    console.log("================================================\n");

    // 1. Try product_media in poi schema
    await probe("poi.product_media (all rows limit 5)", async () => {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_media")
            .select("*")
            .limit(5);
        if (error) throw error;
        return data;
    });

    // 2. Try product_media for specific product
    await probe(`poi.product_media for product_type_id=${PRODUCT_TYPE_ID}`, async () => {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_media")
            .select("*")
            .eq("product_type_id", PRODUCT_TYPE_ID);
        if (error) throw error;
        return data;
    });

    // 3. Try product_type_media in poi schema
    await probe("poi.product_type_media (all rows limit 5)", async () => {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_type_media")
            .select("*")
            .limit(5);
        if (error) throw error;
        return data;
    });

    // 4. Try product_type_media for specific product
    await probe(`poi.product_type_media for product_type_id=${PRODUCT_TYPE_ID}`, async () => {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_type_media")
            .select("*")
            .eq("product_type_id", PRODUCT_TYPE_ID);
        if (error) throw error;
        return data;
    });

    // 5. Try media table in poi schema
    await probe("poi.media (all rows limit 5)", async () => {
        const { data, error } = await supabase
            .schema("poi")
            .from("media")
            .select("*")
            .limit(5);
        if (error) throw error;
        return data;
    });

    // 6. Try public schema product_media
    await probe("public.product_media (all rows limit 5)", async () => {
        const { data, error } = await supabase
            .from("product_media")
            .select("*")
            .limit(5);
        if (error) throw error;
        return data;
    });

    // 7. Inspect product_types row directly (check if banner/process fields exist inline)
    await probe(`poi.product_types row for id=${PRODUCT_TYPE_ID}`, async () => {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_types")
            .select("*")
            .eq("id", PRODUCT_TYPE_ID)
            .single();
        if (error) throw error;
        return data;
    });

    // 8. Check what columns product_types has (select * and inspect keys)
    await probe("poi.product_types columns (first row)", async () => {
        const { data, error } = await supabase
            .schema("poi")
            .from("product_types")
            .select("*")
            .limit(1);
        if (error) throw error;
        return data ? Object.keys(data[0] ?? {}) : [];
    });

    console.log("\n================================================");
    console.log("  DIAGNOSTIC COMPLETE");
    console.log("================================================");
    process.exit(0);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });

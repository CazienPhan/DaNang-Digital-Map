/**
 * scripts/diagnose-storage2.ts — check NuocMamNamO files
 */
import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    const BUCKET = "ProductCategory";
    for (const folder of ["NuocMamNamO", "DongTrungHaThao"]) {
        const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 50 });
        if (error) console.error(`${folder} error:`, error.message);
        else console.log(`${folder}:`, data?.map(f => f.name));
    }

    // Also test creating signed URL for banner
    const path = "DongTrungHaThao/overview.png";
    const { data: signedData, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10); // 10 years
    if (signErr) console.error("Signed URL error:", signErr.message);
    else console.log("Signed banner URL:", signedData?.signedUrl?.substring(0, 80) + "...");

    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });

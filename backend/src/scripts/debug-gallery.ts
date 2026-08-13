/**
 * Debug script: inspect what's actually in poi_media for product_type_ids.
 * Run with: npx ts-node src/scripts/debug-gallery.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const PRODUCT_IDS = [
  '7c1cfe81-30c0-45a9-8c07-4ab2012d5719', // Nước mắm Nam O
  '0b76aa21-a42b-4193-a2e2-e27dd5be5203', // Bánh dừa nướng
  '900c11dc-687a-41d3-9cf4-05a98d0cf496', // Đông Trùng Hạ Thảo
];

async function main() {
  console.log('=== CHECKING poi_media FOR PRODUCT IDs ===\n');

  for (const id of PRODUCT_IDS) {
    console.log(`\n--- product_type_id: ${id} ---`);

    // 1. All rows for this product_type_id
    const { data: allRows, error: allError } = await supabase
      .schema('poi')
      .from('poi_media')
      .select('id, media_type, media_category, url, product_type_id, poi_id')
      .eq('product_type_id', id);

    if (allError) {
      console.error('  ERROR:', allError.message);
    } else {
      console.log(`  Total rows with product_type_id=${id}: ${allRows?.length ?? 0}`);
      if (allRows && allRows.length > 0) {
        allRows.forEach((row: any) => {
          console.log(`    media_category="${row.media_category}" | media_type="${row.media_type}" | url="${row.url?.substring(0, 80)}..."`);
        });
      }
    }

    // 2. Specifically try the gallery filter
    const { data: galleryRows, error: galleryError } = await supabase
      .schema('poi')
      .from('poi_media')
      .select('id, media_type, media_category, url')
      .eq('product_type_id', id)
      .eq('media_category', 'Quy trinh')
      .eq('media_type', 'Image');

    if (galleryError) {
      console.error('  GALLERY FILTER ERROR:', galleryError.message);
    } else {
      console.log(`  Gallery rows (media_category='Quy trinh', media_type='Image'): ${galleryRows?.length ?? 0}`);
      galleryRows?.forEach((row: any) => {
        console.log(`    url="${row.url?.substring(0, 80)}..."`);
      });
    }
  }

  // Also check what DISTINCT media_category values exist overall
  console.log('\n=== DISTINCT media_category values in poi_media WHERE product_type_id IS NOT NULL ===');
  const { data: distinctRows, error: distinctError } = await supabase
    .schema('poi')
    .from('poi_media')
    .select('media_category, media_type')
    .not('product_type_id', 'is', null);

  if (distinctError) {
    console.error('ERROR:', distinctError.message);
  } else {
    const seen = new Set<string>();
    distinctRows?.forEach((row: any) => {
      const key = `media_category="${row.media_category}" | media_type="${row.media_type}"`;
      if (!seen.has(key)) {
        seen.add(key);
        console.log(' ', key);
      }
    });
  }
}

main().catch(console.error).finally(() => process.exit(0));

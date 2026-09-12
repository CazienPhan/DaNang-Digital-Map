import sql from './src/db';

async function main() {
  // Check certifications table columns
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'poi' AND table_name = 'certifications'
    ORDER BY ordinal_position
  `;
  console.log('certifications table columns:');
  cols.forEach((c: any) => console.log(` - ${c.column_name} (${c.data_type})`));

  // Check product_listings table columns
  const plCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'poi' AND table_name = 'product_listings'
    ORDER BY ordinal_position
  `;
  console.log('\nproduct_listings table columns:');
  plCols.forEach((c: any) => console.log(` - ${c.column_name} (${c.data_type})`));

  // Sample data from certifications
  const sample = await sql`
    SELECT * FROM poi.certifications LIMIT 3
  `;
  console.log('\nSample certifications data:');
  sample.forEach((r: any) => console.log(JSON.stringify(r)));

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

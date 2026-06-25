import sql from './db';

async function testConnection() {
  console.log('START: "SUPABASE TRANSACTION CONNECTION DEBUG START"');
  console.log('============================================================');

  // Parse connection info for logging
  let host = 'unknown';
  let database = 'unknown';
  try {
    const connectionString = process.env.DATABASE_URL || '';
    if (connectionString.startsWith('postgresql://') || connectionString.startsWith('postgres://')) {
      const url = new URL(connectionString);
      host = url.hostname;
      database = url.pathname.replace(/^\//, '');
    }
  } catch (err) {
    // Ignore URL parsing failure
  }

  try {
    // 1. Connection Test: Execute SELECT NOW()
    const nowResult = await sql`SELECT NOW()`;
    const timestamp = nowResult[0]?.now;

    console.log('SUPABASE CONNECTION SUCCESS');
    console.log(`- Database: ${database}`);
    console.log(`- Host: ${host}`);
    console.log(`- Timestamp: ${timestamp}`);
    console.log('============================================================');

    // 2. Query POIs: Execute SELECT * FROM poi.pois LIMIT 10
    console.log('QUERYING POIS FROM DATABASE...');
    const pois = await sql`SELECT * FROM poi.pois LIMIT 10`;

    console.log('REAL DATA FROM SUPABASE DATABASE (First 10 records):');
    console.log(JSON.stringify(pois, null, 2));
    console.log('============================================================');

  } catch (error: any) {
    console.error('SUPABASE CONNECTION ERROR');
    console.error('============================================================');
    console.error(`Error: ${error.message || error}`);

    let rootCause = 'Unknown connection error';
    let proposedSolution = 'Check connection details and try again';

    const errMsg = String(error.message || '').toLowerCase();

    if (errMsg.includes('password authentication failed') || errMsg.includes('auth')) {
      rootCause = 'Invalid password / Database authentication failed.';
      proposedSolution = 'Verify DATABASE_URL password field in backend/.env is correct and has not expired.';
    } else if (errMsg.includes('enotfound') || errMsg.includes('getaddrinfo') || errMsg.includes('econnrefused')) {
      rootCause = 'Database server/host is unavailable or unreachable.';
      proposedSolution = 'Ensure the Supabase instance is active and your network allows outgoing connections to port 6543.';
    } else if (errMsg.includes('relation') && errMsg.includes('does not exist')) {
      rootCause = 'The "pois" table is missing in the database schema.';
      proposedSolution = 'Ensure the migrations or table creation scripts have run and the table "pois" exists in the target database.';
    } else if (errMsg.includes('permission denied') || errMsg.includes('role')) {
      rootCause = 'Permission issue / Insufficient privileges for database role.';
      proposedSolution = 'Verify that the user specified in the connection string has permission to SELECT from the "pois" table.';
    }

    console.error(`- Root Cause: ${rootCause}`);
    console.error(`- Proposed Solution: ${proposedSolution}`);
    console.error('============================================================');
  } finally {
    // End the process gracefully
    await sql.end();
  }
}

testConnection();

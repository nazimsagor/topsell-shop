// One-off runner for the coupons migration.
// Usage: node src/db/run-coupons-migration.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('✖  DATABASE_URL is not set in backend/.env');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
const file = path.join(__dirname, 'migrations', '20260423_coupons.sql');

(async () => {
  try {
    console.log('Running coupons migration against Supabase…');
    const sql = fs.readFileSync(file, 'utf8');
    await pool.query(sql);
    console.log('✔  coupons migration applied');
    const { rows } = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
         WHERE table_name = 'coupons' ORDER BY ordinal_position`
    );
    console.log('\ncoupons columns:');
    rows.forEach(r => console.log(`  ${r.column_name.padEnd(20)} ${r.data_type}`));
  } catch (err) {
    console.error('\n✖  Migration failed');
    console.error('   code   :', err.code);
    console.error('   message:', err.message);
    console.error('   detail :', err.detail);
    console.error('   hint   :', err.hint);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();

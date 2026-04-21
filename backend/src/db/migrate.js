require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('✖  DATABASE_URL is not set in .env');
  console.error('   Get it from: Supabase Dashboard → Project Settings → Database');
  console.error('   Copy the "Session pooler" URI (port 5432) under "Connection pooling"');
  console.error('   It looks like: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres');
  process.exit(1);
}

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function run(file) {
  const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
  await pool.query(sql);
  console.log(`✔  ${file}`);
}

async function migrate() {
  try {
    console.log('Running migrations against Supabase…');
    await run('schema.sql');
    await run('seed.sql');
    console.log('\nDone — Supabase database is ready.');
  } catch (err) {
    console.error('\n✖  Migration failed:');
    console.error('   code   :', err.code);
    console.error('   message:', err.message);
    console.error('   detail :', err.detail);
    console.error('   hint   :', err.hint);
    if (!err.message) console.error('   raw    :', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

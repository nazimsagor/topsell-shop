require('dotenv').config({ path: __dirname + '/../../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('SUPABASE_URL:', supabaseUrl || 'NOT FOUND');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Found' : 'NOT FOUND');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testConnection = async () => {
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    console.error('❌ Supabase connection error:', error.message);
    process.exit(1);
  }
  console.log('✅ Supabase connected →', supabaseUrl);
};

module.exports = supabase;
module.exports.testConnection = testConnection;

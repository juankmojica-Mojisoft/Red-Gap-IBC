const { createClient } = require('@supabase/supabase-js');
const url = 'https://wvgbxzuroinmapetapyb.supabase.co';
const key = 'sb_publishable_-pFdji7UG5fuNeOJuPBfuA_v1ChfTpq';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();

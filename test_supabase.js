const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wvgbxzuroinmapetapyb.supabase.co';
const supabaseKey = 'sb_publishable_-pFdji7UG5fuNeOJuPBfuA_v1ChfTpq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching users...');
  const { data: users, error } = await supabase.from('usuarios').select('*').limit(2);
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  console.log('Successfully fetched users:', users);
  
  if (users && users.length > 0) {
    const targetUser = users[0];
    console.log(`Attempting to update user ${targetUser.id} (${targetUser.nombre} ${targetUser.apellidos})...`);
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ nombre: targetUser.nombre })
      .eq('id', targetUser.id);
    if (updateError) {
      console.error('Error updating user:', updateError);
    } else {
      console.log('Update was successful!');
    }
  } else {
    console.log('No users found in database to test update.');
  }
}

run();

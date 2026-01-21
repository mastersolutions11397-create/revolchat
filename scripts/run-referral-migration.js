const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_referral_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running referral system migration...');

    // Split into statements and execute one by one
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          if (error) {
            console.error('Statement failed:', statement.substring(0, 100) + '...');
            console.error('Error:', error);
          } else {
            console.log('✓ Statement executed successfully');
          }
        } catch (err) {
          console.error('Error executing statement:', err.message);
        }
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigration();
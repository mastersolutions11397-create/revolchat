import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupChatSystem() {
  console.log('🚀 Setting up Telegram Chat System...\n');

  // Step 1: Check if workspaces table exists and get a workspace ID
  console.log('📋 Step 1: Checking for workspace...');
  try {
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('id, name')
      .limit(1);

    if (error) {
      console.log('⚠️  Workspaces table not found or error:', error.message);
      console.log('   Using default workspace ID for now');
    } else if (workspaces && workspaces.length > 0) {
      const workspace = workspaces[0];
      console.log(`✅ Found workspace: ${workspace.name} (${workspace.id})`);
      console.log(`\n📝 Add this to your .env file:`);
      console.log(`   DEFAULT_WORKSPACE_ID=${workspace.id}`);
      console.log(`   NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=${workspace.id}\n`);
    } else {
      console.log('⚠️  No workspaces found. You may need to create one first.');
    }
  } catch (err) {
    console.log('⚠️  Could not check workspaces:', err);
  }

  // Step 2: Run the migration
  console.log('📋 Step 2: Running database migration...');

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '003_create_chat_system.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found at: ${migrationPath}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  try {
    // Note: Supabase JS client doesn't support multi-statement SQL
    // We'll need to use the SQL editor or CLI for the full migration
    console.log('⚠️  Full migration needs to be run in Supabase SQL Editor');
    console.log('\n📝 To complete the migration:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of:');
    console.log(`      ${migrationPath}`);
    console.log('   4. Click "Run"\n');

    // Check if tables already exist
    console.log('📋 Checking if chat tables exist...');

    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id')
      .limit(1);

    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);

    if (!sessionsError && !messagesError) {
      console.log('✅ Chat tables already exist!');
    } else {
      console.log('⚠️  Chat tables not found. Please run the migration in Supabase SQL Editor.');
    }

  } catch (err) {
    console.error('❌ Error checking tables:', err);
  }

  // Step 3: Check Telegram bot token
  console.log('\n📋 Step 3: Checking Telegram bot configuration...');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken || botToken === 'your_telegram_bot_token_here') {
    console.log('⚠️  Telegram bot token not configured');
    console.log('\n📝 To set up your Telegram bot:');
    console.log('   1. Open Telegram and search for @BotFather');
    console.log('   2. Send /newbot and follow instructions');
    console.log('   3. Copy the bot token');
    console.log('   4. Add to .env file:');
    console.log('      TELEGRAM_BOT_TOKEN=your_token_here\n');
  } else {
    console.log('✅ Telegram bot token configured');

    // Test the token
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await response.json();

      if (data.ok) {
        console.log(`✅ Bot verified: @${data.result.username}`);
      } else {
        console.log('❌ Invalid bot token');
      }
    } catch (err) {
      console.log('⚠️  Could not verify bot token');
    }
  }

  // Step 4: Summary and next steps
  console.log('\n' + '='.repeat(60));
  console.log('📋 Setup Summary & Next Steps:');
  console.log('='.repeat(60));

  console.log('\n✅ What to do next:');
  console.log('   1. Run the migration in Supabase SQL Editor (see above)');
  console.log('   2. Set TELEGRAM_BOT_TOKEN in .env (if not done)');
  console.log('   3. Set DEFAULT_WORKSPACE_ID in .env (if not done)');
  console.log('   4. Enable Realtime for chat_sessions and chat_messages tables');
  console.log('   5. Deploy your app and set up webhook (see CHAT_SYSTEM_SETUP.md)');
  console.log('   6. Start chatting! 🎉\n');

  console.log('📖 Full documentation: CHAT_SYSTEM_SETUP.md\n');
}

setupChatSystem().catch(console.error);

# 🚀 Simplified Telegram Chat System - No Workspaces!

The system has been simplified to remove workspace dependencies. Follow these easy steps:

## 📋 What Changed

- ❌ Removed workspace_id requirements
- ❌ Removed workspace tables and references
- ✅ Simplified database schema
- ✅ Single-tenant mode (perfect for most use cases)
- ✅ All the same features (AI mode, real-time, etc.)

## 🎯 Quick Setup (5 Minutes)

### Step 1: Run Database Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of: `supabase/run-all-migrations-simple.sql`
3. Click **Run**
4. You should see "Success. No rows returned"

### Step 2: Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for:
   - `chat_sessions`
   - `chat_messages`

### Step 3: Create Telegram Bot

1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Follow instructions
4. **Copy the bot token**

### Step 4: Update .env

```bash
# Add this to your .env file
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

That's it! No workspace ID needed!

### Step 5: Start Your App

```bash
npm run dev
```

### Step 6: Set Webhook

For local testing with ngrok:

```bash
# Terminal 1: Your app is running (npm run dev)

# Terminal 2: Start ngrok
ngrok http 3000

# Terminal 3: Set webhook
TELEGRAM_BOT_TOKEN="your_token"
WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/telegram/webhook"

curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}"
```

## ✅ Test It

1. Message your bot on Telegram
2. Bot responds with AI
3. Check `/dashboard/messages` to see the conversation
4. Toggle AI mode on/off with the Bot icon (🤖)
5. Send manual messages when AI is off

## 🔧 Removed from Code

Since we removed workspaces, these files don't require workspace_id anymore:
- API routes automatically work without workspace_id
- Frontend code simplified
- No workspace setup needed

## 📁 Use This Migration File

Use the simplified migration file:
```
supabase/run-all-migrations-simple.sql
```

This file has:
- ✅ No workspaces table
- ✅ No workspace_id in chat tables
- ✅ Simple RLS policies (all authenticated users can access)
- ✅ All the same features

## 🎉 That's It!

You now have a full-featured Telegram chat system without the complexity of workspaces!

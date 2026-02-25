# 🚀 Quick Start - Telegram Chat System

Follow these steps to get your Telegram chat system up and running in 10 minutes!

## ✅ Step 1: Create Your Telegram Bot (2 minutes)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name for your bot (e.g., "My Support Bot")
4. Choose a username (must end with 'bot', e.g., "mysupport_bot")
5. **Copy the bot token** that BotFather gives you (looks like: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`)

## ✅ Step 2: Run Database Migration (3 minutes)

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New query**
5. Copy everything from this file: `supabase/run-all-migrations.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. You should see "Success. No rows returned"

## ✅ Step 3: Enable Realtime (1 minute)

1. In Supabase Dashboard, go to **Database** → **Replication**
2. Find the tables:
   - `chat_sessions`
   - `chat_messages`
3. Toggle **ON** the switch next to each table
4. Wait a few seconds for replication to enable

## ✅ Step 4: Get Your Workspace ID (2 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query and run this:
   ```sql
   -- Create a default workspace if you don't have one
   INSERT INTO workspaces (name, workspace_type)
   VALUES ('My Workspace', 'personal')
   RETURNING id;
   ```
3. **Copy the UUID** that's returned (looks like: `550e8400-e29b-41d4-a716-446655440000`)

## ✅ Step 5: Update Environment Variables (1 minute)

Open your `.env` file and update these values:

```bash
# Paste your bot token from Step 1
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ

# Paste your workspace ID from Step 4
DEFAULT_WORKSPACE_ID=550e8400-e29b-41d4-a716-446655440000
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=550e8400-e29b-41d4-a716-446655440000
```

## ✅ Step 6: Test Locally (1 minute)

### Option A: Use ngrok (Recommended for local testing)

```bash
# Terminal 1: Start your Next.js app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Option B: Deploy to Vercel/Production

Deploy your app and get the production URL.

## ✅ Step 7: Set Telegram Webhook (1 minute)

Replace the values and run this command:

```bash
# Replace these with your actual values
TELEGRAM_BOT_TOKEN="your_bot_token_here"
WEBHOOK_URL="https://your-domain.com/api/telegram/webhook"

# Set the webhook
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}"
```

You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`

## 🎉 Step 8: Test It Out!

### Test on Telegram:
1. Open Telegram
2. Search for your bot's username
3. Send a message: "Hello!"
4. Your bot should respond with an AI-generated message

### Test in Dashboard:
1. Open your app: http://localhost:3000
2. Go to `/dashboard/messages`
3. You should see:
   - The user who messaged you
   - Their online status (green dot)
   - The conversation
   - Bot icon (🤖) showing AI mode is active

### Test Admin Takeover:
1. Click the **Bot icon** (🤖) in the chat header to turn OFF AI mode
2. The icon changes to **User icon** (👤)
3. Now when users message, they get: "Thank you for your message. Our team will respond shortly."
4. Type your own message and send it
5. The user receives YOUR message on Telegram
6. Click the **User icon** (👤) to turn AI mode back ON

## 🔍 Verify Everything Works

### Check Webhook Status:
```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

Should show:
- `"url": "your webhook URL"`
- `"has_custom_certificate": false`
- `"pending_update_count": 0`

### Check Database:
In Supabase SQL Editor:
```sql
-- See all chat sessions
SELECT
    external_first_name,
    platform,
    ai_mode,
    is_online,
    created_at
FROM chat_sessions
ORDER BY created_at DESC;

-- See all messages
SELECT
    sender_type,
    message_text,
    created_at
FROM chat_messages
ORDER BY created_at DESC
LIMIT 10;
```

## 🎯 What You've Built

✅ **Full chat system** with Telegram integration
✅ **AI auto-responses** using your knowledge base
✅ **Admin takeover** - toggle AI on/off anytime
✅ **Real-time updates** - messages appear instantly
✅ **Online status** - see when users are active
✅ **Message history** - all conversations saved
✅ **Unread badges** - see unread message counts

## 🐛 Troubleshooting

### Bot not responding?
- Check webhook is set: `curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"`
- Check webhook endpoint works: Visit `https://your-domain.com/api/telegram/webhook` (should show status)
- Check logs: `npm run dev` and look for errors

### Messages not appearing in dashboard?
- Verify Realtime is enabled for `chat_sessions` and `chat_messages`
- Check browser console for errors
- Refresh the page

### AI not responding?
- Check `NEXT_PUBLIC_AGENTS_API_URL` is correct in `.env`
- Verify your knowledge base API is running
- Check AI mode is ON (Bot icon should be highlighted blue)

## 📚 Next Steps

- Read full documentation: [CHAT_SYSTEM_SETUP.md](CHAT_SYSTEM_SETUP.md)
- Add Instagram support (structure is ready!)
- Customize AI responses
- Add conversation notes and tags
- Export conversation history

## 🆘 Need Help?

Check the full setup guide: [CHAT_SYSTEM_SETUP.md](CHAT_SYSTEM_SETUP.md)

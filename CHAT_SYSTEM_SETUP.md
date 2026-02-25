# Telegram Chat System Setup Guide

This guide will help you set up the complete Telegram chat system with AI integration.

## Overview

The chat system allows users to chat with your Telegram bot, which can respond automatically using AI (from your knowledge base) or be manually handled by admins through the dashboard.

### Key Features

- ✅ Real-time chat with Telegram users
- ✅ AI auto-response mode (uses knowledge base)
- ✅ Manual admin takeover mode
- ✅ Online/offline user status
- ✅ Unread message tracking
- ✅ Real-time updates using Supabase Realtime
- ✅ Message history and persistence
- ✅ Multi-platform support (Telegram, Instagram ready)

## Architecture

```
Telegram User → Telegram Bot API → Webhook → Next.js API → Supabase DB
                                                    ↓
                                            AI Knowledge Base
                                                    ↓
Admin Dashboard ← Supabase Realtime ← Real-time Updates
```

## Setup Steps

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the **Bot Token** (looks like: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`)
5. Save this token - you'll need it in the next step

### 2. Set Up Environment Variables

Add the following to your `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Default Workspace ID (get this from your Supabase database)
DEFAULT_WORKSPACE_ID=your_workspace_id_here
NEXT_PUBLIC_DEFAULT_WORKSPACE_ID=your_workspace_id_here

# Existing variables (should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_AGENTS_API_URL=http://127.0.0.1:8000
```

### 3. Run Database Migration

Execute the SQL migration to create the necessary database tables:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/003_create_chat_system.sql`
4. Copy and paste the contents into the SQL editor
5. Click **Run**

**Option B: Using Supabase CLI**
```bash
supabase db push
```

This will create:
- `chat_sessions` table - stores user sessions, online status, AI mode
- `chat_messages` table - stores all messages
- Indexes for performance
- RLS policies for security
- Triggers for automatic updates

### 4. Enable Supabase Realtime

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Enable replication for these tables:
   - `chat_sessions`
   - `chat_messages`

### 5. Set Up Telegram Webhook

Once your application is deployed, set up the webhook:

```bash
# Replace with your actual values
TELEGRAM_BOT_TOKEN="your_bot_token"
WEBHOOK_URL="https://your-domain.com/api/telegram/webhook"

# Set the webhook
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}"
```

**For local development**, you can use ngrok:
```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL for webhook
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://your-ngrok-url.ngrok.io/api/telegram/webhook\"}"
```

Verify webhook is set:
```bash
curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
```

### 6. Get Your Workspace ID

You need to find your workspace ID from the database:

```sql
-- Run this in Supabase SQL Editor
SELECT id, name FROM workspaces WHERE user_id = 'your_user_id';
```

Copy the workspace `id` and add it to your `.env` file as `DEFAULT_WORKSPACE_ID`.

### 7. Start Your Application

```bash
npm run dev
```

### 8. Test the System

1. **Test Telegram Bot**
   - Open Telegram and search for your bot
   - Send a message to your bot
   - You should receive an AI response

2. **Test Admin Dashboard**
   - Go to `/dashboard/messages`
   - You should see the user who messaged your bot
   - The session should show as "online"
   - Messages should appear in real-time

3. **Test AI Mode Toggle**
   - Click the Bot/User icon in the chat header
   - When AI mode is OFF, users will get an acknowledgment but no AI response
   - When AI mode is ON, users get automatic AI responses

4. **Test Admin Messaging**
   - Type a message in the dashboard
   - Click send
   - The message should appear in your Telegram chat

## Usage

### For End Users (Telegram)

1. Users find your bot on Telegram
2. They send messages
3. Bot responds automatically using AI (knowledge base)
4. All conversations are logged in the dashboard

### For Admins (Dashboard)

1. Go to `/dashboard/messages`
2. View all active conversations
3. See online/offline status
4. Toggle AI mode on/off:
   - **AI Mode ON** (🤖 Bot icon): AI responds automatically
   - **AI Mode OFF** (👤 User icon): You respond manually
5. Click on a conversation to view messages
6. Send manual responses when needed
7. Real-time updates show new messages instantly

## API Endpoints

### Telegram Webhook
```
POST /api/telegram/webhook
```
Receives updates from Telegram Bot API

### Chat Sessions
```
GET /api/chat/sessions?workspace_id=xxx&platform=telegram
```
Get all chat sessions for a workspace

### Chat Messages
```
GET /api/chat/messages?session_id=xxx
```
Get all messages for a session

### Send Message
```
POST /api/chat/send
{
  "session_id": "xxx",
  "message_text": "Hello!",
  "sender_type": "admin"
}
```

### Toggle AI Mode
```
POST /api/chat/toggle-ai
{
  "session_id": "xxx",
  "ai_mode": true
}
```

### Mark Messages as Read
```
POST /api/chat/mark-read
{
  "session_id": "xxx"
}
```

## Database Schema

### chat_sessions Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | Workspace this session belongs to |
| external_user_id | TEXT | Telegram user ID |
| external_username | TEXT | Telegram username |
| external_first_name | TEXT | User's first name |
| platform | TEXT | 'telegram' or 'instagram' |
| ai_mode | BOOLEAN | AI auto-response enabled/disabled |
| is_online | BOOLEAN | User online status |
| session_status | TEXT | 'active', 'idle', or 'closed' |
| last_activity_at | TIMESTAMP | Last activity timestamp |
| created_at | TIMESTAMP | Session created timestamp |

### chat_messages Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Reference to chat_sessions |
| workspace_id | UUID | Workspace reference |
| message_text | TEXT | Message content |
| message_type | TEXT | 'text', 'image', 'file', etc. |
| sender_type | TEXT | 'user', 'admin', or 'ai' |
| sender_id | TEXT | Sender identifier |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Message timestamp |

## Troubleshooting

### Webhook Issues

**Problem**: Messages not appearing in dashboard

**Solutions**:
1. Check webhook is set correctly:
   ```bash
   curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
   ```
2. Check webhook logs: `/api/telegram/webhook` (GET request shows status)
3. Verify TELEGRAM_BOT_TOKEN is correct in `.env`
4. Ensure webhook URL is HTTPS (required by Telegram)

### Database Issues

**Problem**: Tables not found

**Solution**: Run the migration again:
```sql
-- In Supabase SQL Editor
-- Copy and run: supabase/migrations/003_create_chat_system.sql
```

**Problem**: Permission denied

**Solution**: Check RLS policies are created correctly

### Real-time Issues

**Problem**: Messages don't appear in real-time

**Solutions**:
1. Enable Realtime for `chat_sessions` and `chat_messages` tables in Supabase
2. Check browser console for WebSocket errors
3. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct

### AI Response Issues

**Problem**: AI not responding

**Solutions**:
1. Check NEXT_PUBLIC_AGENTS_API_URL is correct
2. Verify knowledge base API is running
3. Check backend logs for errors
4. Ensure AI mode is enabled (Bot icon should be highlighted)

## Advanced Configuration

### Custom Workspace Mapping

To support multiple workspaces/bots, modify the webhook handler:

```typescript
// app/api/telegram/webhook/route.ts
// Add workspace mapping based on bot token or user
const workspaceId = getWorkspaceIdForBot(telegramBotToken);
```

### Custom AI Response Logic

Modify the `getAIResponse` function in the webhook handler:

```typescript
// app/api/telegram/webhook/route.ts
async function getAIResponse(message: string, workspaceId: string, userId: string): Promise<string> {
  // Add your custom logic here
  // E.g., route to different AI models, add context, etc.
}
```

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// Use a rate limiting library or service
import { Ratelimit } from "@upstash/ratelimit";
```

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the server logs (`npm run dev`)
3. Verify all environment variables are set
4. Test the webhook endpoint: `GET /api/telegram/webhook`
5. Check Supabase logs for database errors

## Next Steps

- Add Instagram integration (similar structure ready)
- Add file/image support for messages
- Add message search functionality
- Add analytics and reporting
- Add automated responses based on keywords
- Add conversation tagging and notes

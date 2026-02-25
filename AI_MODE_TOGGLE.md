# AI Mode Toggle & Manual Takeover

## Overview
The system allows admins to toggle between AI automatic responses and manual human responses for each user conversation.

## How It Works

### AI Mode ON (Default)
- **Bot icon** displayed in header
- User messages trigger automatic AI responses via knowledge base
- Admin **cannot** send manual messages (textarea is disabled)
- Webhook automatically generates and sends AI responses

### AI Mode OFF (Manual Takeover)
- **User icon** displayed in header
- User messages are saved but **no automatic AI response**
- Admin **can** send manual messages via textarea
- Messages are sent from admin to user via Telegram

## UI Components

### Chat Header
- **Toggle Button**: Click to switch between AI/Manual mode
  - Blue with Bot icon = AI Mode ON
  - Orange with User icon = Manual Mode ON
- Hover tooltip explains current state

### Message Input Area
- **Textarea**: For typing messages
  - Enabled when AI mode is OFF
  - Disabled when AI mode is ON
  - Press Enter to send (Shift+Enter for new line)
- **Send Button**: Sends message to user
  - Disabled when AI mode is ON or textarea is empty
  - Shows loading spinner while sending
- **Status Text**: Shows "AI mode is ON" message when AI is enabled

### Online/Offline Status
- Green pulsing dot + "Online" when user active (last 5 min)
- "Offline" text when user inactive

## Technical Implementation

### Files Modified

1. **[app/dashboard/inbox/page.tsx](app/dashboard/inbox/page.tsx)**
   - Added AI toggle button with Bot/User icons
   - Added message input textarea
   - Added `handleToggleAI()` function to switch modes
   - Added `handleSendMessage()` function to send manual messages
   - Disabled input when AI mode is ON

2. **[lib/api/integrations.ts](lib/api/integrations.ts)**
   - Added `ai_mode?: boolean` to Conversation type

3. **[app/api/telegram/webhook/route.ts](app/api/telegram/webhook/route.ts)** (Already implemented)
   - Checks `session.ai_mode` before sending AI responses
   - Skips AI response when mode is OFF

### API Endpoints Used

1. **Toggle AI Mode**:
   ```typescript
   await supabase
     .from("chat_sessions")
     .update({ ai_mode: newAiMode })
     .eq("id", session_id);
   ```

2. **Send Manual Message**:
   ```typescript
   // Save to database
   await supabase
     .from("chat_messages")
     .insert({
       session_id: session_id,
       message_text: message,
       sender_type: "admin",
       is_read: true,
     });

   // Send via Telegram
   await fetch("/api/chat/send", {
     method: "POST",
     body: JSON.stringify({
       session_id,
       message_text,
       sender_type: "admin",
     }),
   });
   ```

## User Flow Examples

### Example 1: AI Responds Automatically
```
1. User sends: "Hello"
2. AI mode is ON (default)
3. Webhook receives message
4. Webhook checks: session.ai_mode = true
5. Webhook gets AI response from knowledge base
6. AI responds: "Hey there! 😊 How's your day going?"
7. Admin sees the conversation in inbox
```

### Example 2: Admin Takes Over Manually
```
1. User sends: "I need help with my order"
2. Admin sees message in inbox
3. Admin clicks toggle button (AI → Manual)
4. AI mode turns OFF
5. User sends: "Order #12345 is delayed"
6. Webhook receives message but doesn't send AI response
7. Admin types: "Let me check that for you"
8. Admin clicks Send
9. Message goes to user via Telegram
10. When done, admin clicks toggle (Manual → AI)
11. AI resumes automatic responses
```

## Database Fields

In `chat_sessions` table:
- `ai_mode` (boolean): true = AI responds, false = manual only
- Default: `true` (AI mode ON)

In `chat_messages` table:
- `sender_type`: "user" | "admin" | "ai"
  - "user": Message from Telegram user
  - "ai": Automatic AI response
  - "admin": Manual message from admin

## Testing

1. **Run the SQL** in [supabase/add-anon-policies.sql](supabase/add-anon-policies.sql) to fix permissions
2. Go to [http://localhost:3000/dashboard/inbox](http://localhost:3000/dashboard/inbox)
3. Send a message from Telegram - AI should respond automatically
4. Click the Bot icon in header - it switches to User icon (Manual mode)
5. Send another message from Telegram - no AI response
6. Type in the textarea and click Send - your message goes to user
7. Click User icon - it switches back to Bot icon (AI mode)
8. Send another message from Telegram - AI responds again

## Future Enhancements

- **Typing Indicators**: Show "Admin is typing..." in Telegram
- **Read Receipts**: Show when user has read admin messages
- **Quick Replies**: Pre-defined message templates for admins
- **Auto-disable AI**: Automatically turn off AI when admin sends first manual message
- **Notification**: Alert admin when AI mode is ON and user needs help

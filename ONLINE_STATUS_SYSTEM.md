# Online/Offline Status System

## How It Works

### User Goes ONLINE
When a user sends a message via Telegram:
1. Telegram webhook receives the message
2. `findOrCreateSession()` updates the session:
   - Sets `is_online = true`
   - Updates `last_seen_at = now()`
   - Updates `last_activity_at = now()`

### User Goes OFFLINE
Users are automatically marked as offline based on inactivity:
- **Threshold**: 5 minutes of no activity
- **Calculation**: Done on the frontend in real-time
- **Logic**: If `last_seen_at` is older than 5 minutes, user is considered offline

### Frontend Implementation

In [app/dashboard/inbox/page.tsx](app/dashboard/inbox/page.tsx):

```typescript
// Helper to check if user is online (active in last 5 minutes)
const isUserOnline = (lastSeenAt?: string): boolean => {
  if (!lastSeenAt) return false;
  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
  return diffMinutes < 5; // Consider online if active in last 5 minutes
};
```

### Visual Indicators

1. **Conversation List**:
   - Green dot on top-right of avatar for online users
   - No indicator for offline users

2. **Chat Header**:
   - Green pulsing dot + "Online" text for online users
   - "Offline" text for offline users

## Database Fields

In `chat_sessions` table:
- `is_online` (boolean): Updated when user sends messages
- `last_seen_at` (timestamp): Last time user was active
- `last_activity_at` (timestamp): Last activity in the session

## Adjusting the Timeout

To change how long before a user is marked as offline, modify the threshold in `isUserOnline()`:

```typescript
return diffMinutes < 5; // Change 5 to desired minutes
```

Common values:
- 1 minute: Very strict (marks users offline quickly)
- 5 minutes: Moderate (current default)
- 15 minutes: Lenient (users stay online longer)

## Future Enhancements

For more accurate online status, consider:

1. **Telegram Bot API Long Polling**: Use `getUpdates` to detect typing indicators
2. **Presence Pings**: Have users send periodic "I'm still here" messages
3. **Database Trigger**: Create a PostgreSQL function to auto-update `is_online` based on `last_seen_at`
4. **WebSocket Connection**: Real-time presence updates via Supabase Realtime

## Example Flow

```
User sends message via Telegram
    ↓
Webhook receives message
    ↓
Update session: is_online=true, last_seen_at=now()
    ↓
Frontend fetches sessions
    ↓
Calculate: now - last_seen_at < 5 minutes?
    ↓
Yes → Show green dot (Online)
No  → Show no indicator (Offline)
```

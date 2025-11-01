# ActivityLogger Feature - Table Structure & API Structure

## Database Table Structure

### Table: `yetti_activities`

```sql
CREATE TABLE yetti_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error')),
    message TEXT NOT NULL,
    platform VARCHAR(50), -- e.g., 'knowledge', 'google_sheets', 'telegram', 'instagram', 'agent', etc.
    metadata JSONB DEFAULT '{}', -- Stores: workspace_id, agent_id, integration_id, user_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for better query performance
    INDEX idx_yetti_activities_user_id (user_id),
    INDEX idx_yetti_activities_created_at (created_at DESC),
    INDEX idx_yetti_activities_metadata_workspace (metadata->>'workspace_id'),
    INDEX idx_yetti_activities_metadata_agent (metadata->>'agent_id'),
    INDEX idx_yetti_activities_metadata_integration (metadata->>'integration_id'),
    INDEX idx_yetti_activities_platform (platform),
    INDEX idx_yetti_activities_type (type)
);

-- Alternative with explicit foreign keys if workspace/agent/integration relationships are needed:
-- Note: This assumes workspace_id is always present, adjust based on your needs

CREATE INDEX idx_yetti_activities_workspace_id
ON yetti_activities ((metadata->>'workspace_id'))
WHERE metadata->>'workspace_id' IS NOT NULL;

CREATE INDEX idx_yetti_activities_agent_id
ON yetti_activities ((metadata->>'agent_id'))
WHERE metadata->>'agent_id' IS NOT NULL;

CREATE INDEX idx_yetti_activities_integration_id
ON yetti_activities ((metadata->>'integration_id'))
WHERE metadata->>'integration_id' IS NOT NULL;
```

### Table Schema Details

| Column       | Type                     | Constraints                  | Description                                                                           |
| ------------ | ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------- |
| `id`         | UUID                     | PRIMARY KEY                  | Unique identifier for each activity                                                   |
| `user_id`    | UUID                     | FOREIGN KEY → auth.users(id) | User who triggered or owns the activity                                               |
| `type`       | VARCHAR(20)              | NOT NULL, CHECK              | Activity type: 'success', 'info', 'warning', 'error'                                  |
| `message`    | TEXT                     | NOT NULL                     | Human-readable activity message                                                       |
| `platform`   | VARCHAR(50)              | NULLABLE                     | Platform/source: 'knowledge', 'google_sheets', 'telegram', 'instagram', 'agent', etc. |
| `metadata`   | JSONB                    | DEFAULT '{}'                 | Flexible JSON object containing: workspace_id, agent_id, integration_id, user_id      |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW()                | Timestamp when activity was created                                                   |

---

## API Structure

### Base URL

```
/api/yetti/activities
```

### Authentication

All endpoints require authentication via Supabase JWT token:

```
Authorization: Bearer <supabase_jwt_token>
```

---

### 1. GET `/api/yetti/activities`

Get recent activities for the authenticated user.

**Query Parameters:**

- `limit` (optional, default: 10): Number of activities to return
- `offset` (optional, default: 0): Pagination offset
- `type` (optional): Filter by activity type ('success', 'info', 'warning', 'error')
- `platform` (optional): Filter by platform

**Response:**

```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "success",
      "message": "Knowledge base updated with new text content",
      "platform": "knowledge",
      "timestamp": "2024-01-01T12:00:00Z",
      "metadata": {
        "workspace_id": "uuid",
        "agent_id": null,
        "integration_id": null,
        "user_id": "uuid"
      }
    },
    {
      "id": "uuid",
      "type": "info",
      "message": "Successfully connected to google_sheets",
      "platform": "google_sheets",
      "timestamp": "2024-01-01T11:30:00Z",
      "metadata": {
        "workspace_id": "uuid",
        "integration_id": "uuid"
      }
    }
  ],
  "total_count": 150,
  "has_more": true
}
```

**Status Codes:**

- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### 2. GET `/api/yetti/activities/workspace/{workspace_id}`

Get activities filtered by workspace.

**Path Parameters:**

- `workspace_id` (UUID, required): Workspace identifier

**Query Parameters:**

- `limit` (optional, default: 10): Number of activities to return
- `offset` (optional, default: 0): Pagination offset
- `type` (optional): Filter by activity type
- `platform` (optional): Filter by platform

**Response:**
Same structure as GET `/api/yetti/activities`

**Status Codes:**

- `200 OK`: Success
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have access to this workspace
- `404 Not Found`: Workspace not found
- `500 Internal Server Error`: Server error

---

### 3. POST `/api/yetti/activities`

Create a new activity log entry.

**Request Body:**

```json
{
  "type": "success",
  "message": "Knowledge base updated with new text content",
  "platform": "knowledge",
  "metadata": {
    "workspace_id": "uuid",
    "agent_id": "uuid",
    "integration_id": "uuid",
    "user_id": "uuid"
  }
}
```

**Request Body Schema:**

- `type` (string, required): Must be one of: 'success', 'info', 'warning', 'error'
- `message` (string, required): Activity message description
- `platform` (string, optional): Platform identifier
- `metadata` (object, optional): JSON object containing:
  - `workspace_id` (string, optional): UUID of workspace
  - `agent_id` (string, optional): UUID of AI agent
  - `integration_id` (string, optional): UUID of integration
  - `user_id` (string, optional): UUID of user

**Response:**

```json
{
  "id": "uuid",
  "type": "success",
  "message": "Knowledge base updated with new text content",
  "platform": "knowledge",
  "timestamp": "2024-01-01T12:00:00Z",
  "metadata": {
    "workspace_id": "uuid"
  }
}
```

**Status Codes:**

- `201 Created`: Activity created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

## Frontend TypeScript Interfaces

### ActivityItem Interface

```typescript
export interface ActivityItem {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  platform?: string;
  timestamp: string;
  metadata?: {
    workspace_id?: string;
    agent_id?: string;
    integration_id?: string;
    user_id?: string;
  };
}
```

### ActivitiesResponse Interface

```typescript
export interface ActivitiesResponse {
  activities: ActivityItem[];
  total_count: number;
  has_more: boolean;
}
```

---

## ActivityLogger Utility Methods

The frontend `ActivityLogger` class provides helper methods:

### 1. `logActivity()`

General purpose activity logging.

```typescript
ActivityLogger.logActivity(
  type: "success" | "info" | "warning" | "error",
  message: string,
  platform?: string,
  metadata?: {
    workspace_id?: string;
    agent_id?: string;
    integration_id?: string;
    user_id?: string;
  }
)
```

### 2. `logKnowledgeUpdate()`

Logs knowledge base update activities.

```typescript
ActivityLogger.logKnowledgeUpdate(
  workspaceId: string,
  updateType: "text" | "pdf" | "sheets",
  details?: string
)
```

### 3. `logIntegrationEvent()`

Logs integration connection/disconnection events.

```typescript
ActivityLogger.logIntegrationEvent(
  workspaceId: string,
  platform: string,
  eventType: "connected" | "disconnected" | "error",
  details?: string
)
```

### 4. `logAgentEvent()`

Logs AI agent lifecycle events.

```typescript
ActivityLogger.logAgentEvent(
  workspaceId: string,
  agentId: string,
  eventType: "created" | "updated" | "deleted" | "message_processed",
  details?: string
)
```

---

## Usage Examples

### Frontend Usage

```typescript
// Log a knowledge base update
await ActivityLogger.logKnowledgeUpdate(
  workspaceId,
  "sheets",
  "Connected Customer Data Sheet"
);

// Log an integration event
await ActivityLogger.logIntegrationEvent(
  workspaceId,
  "google_sheets",
  "connected",
  `Connected Customer Data Sheet: ${sheetUrl}`
);

// Log a custom activity
await ActivityLogger.logActivity(
  "success",
  "Custom activity message",
  "platform_name",
  {
    workspace_id: workspaceId,
    agent_id: agentId,
  }
);
```

### Backend API Usage Examples

**Get recent activities:**

```bash
GET /api/yetti/activities?limit=20
Authorization: Bearer <token>
```

**Get workspace-specific activities:**

```bash
GET /api/yetti/activities/workspace/{workspace_id}?limit=10&type=success
Authorization: Bearer <token>
```

**Create a new activity:**

```bash
POST /api/yetti/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "info",
  "message": "New feature enabled",
  "platform": "system",
  "metadata": {
    "workspace_id": "uuid"
  }
}
```

---

## Platform Values

Common platform identifiers used in the system:

- `"knowledge"` - Knowledge base updates
- `"google_sheets"` - Google Sheets integration
- `"telegram"` - Telegram integration
- `"instagram"` - Instagram integration
- `"whatsapp"` - WhatsApp integration
- `"discord"` - Discord integration
- `"slack"` - Slack integration
- `"agent"` - AI agent events

---

## Notes

1. **User Context**: The `user_id` is typically extracted from the JWT token on the backend, but can also be included in metadata for cross-user activity logging.

2. **Workspace Filtering**: Activities are primarily filtered by `metadata.workspace_id` for workspace-specific queries. The workspace endpoint ensures the user has access to the workspace before returning results.

3. **Error Handling**: The ActivityLogger class has built-in error handling and will log errors to the console without throwing exceptions, ensuring that activity logging failures don't break the main application flow.

4. **Timestamps**: All timestamps are stored and returned in ISO 8601 format with timezone information.

5. **Metadata Flexibility**: The `metadata` JSONB field allows for flexible, schema-less storage of additional context that may vary by activity type.

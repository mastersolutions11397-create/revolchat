# YETTI Workspace Schedule API

This guide documents the proposed schedule (working hours) capabilities for a YETTI workspace. It focuses exclusively on the controller endpoints, expected request/response payloads, validation rules, and supportive database schema.

## Overview

Workspaces can define weekly availability, a default timezone, and a manual override that keeps the workspace online or offline regardless of the schedule. The API is designed to be idempotent and safe for repeated updates.

## Database Schema

```sql
CREATE TABLE yetti_workspace_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES yetti_workspaces(id) ON DELETE CASCADE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
    respect_schedule BOOLEAN NOT NULL DEFAULT TRUE,
    workspace_online BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspace_hours_workspace_id
    ON yetti_workspace_hours (workspace_id);
```

### Trigger Helper

To ensure `updated_at` stays current:

```sql
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_workspace_hours_updated_at
    BEFORE UPDATE ON yetti_workspace_hours
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
```

## Controller Endpoints

Base path: `/api/yetti/workspaces/{workspace_id}`

All routes require authentication and will reject requests from users who are not members of the target workspace.

### 1. GET `/hours`

Fetch the saved configuration. Returns `404` if none exists yet.

**Response**

```json
{
  "workspace_id": "f62d3a4d-7da9-47a6-9a4d-1d730b5a770f",
  "timezone": "Asia/Karachi",
  "schedule": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "friday": [
      { "start": "10:00", "end": "14:00" },
      { "start": "16:00", "end": "19:00" }
    ]
  },
  "respect_schedule": true,
  "workspace_online": true,
  "created_at": "2025-01-15T11:24:01.415Z",
  "updated_at": "2025-01-15T11:24:01.415Z"
}
```

**Errors**

- `403` – caller is not a member of the workspace  
- `404` – schedule not configured  
- `500` – unexpected failure

### 2. PUT `/hours`

Upsert timezone, weekly schedule, and booleans in one shot. Missing booleans retain prior values (or default to `true` for new rows).

**Request**

```json
{
  "timezone": "Asia/Karachi",
  "schedule": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "wednesday": [{ "start": "13:00", "end": "18:00" }]
  },
  "respect_schedule": true,
  "workspace_online": true
}
```

**Response**

Same as the GET endpoint.

**Validation & Errors**

- `timezone` must be a valid IANA identifier  
- Schedule keys use lowercase weekday names  
- Slots use `HH:MM` 24h format and `end` must be later than `start`  
- Errors: `403`, `422`, `500`

### 3. PATCH `/hours/status`

Toggle the manual override without changing schedule or timezone. Creates a default row (UTC + empty schedule) if none exists.

**Request**

```json
{ "workspace_online": false }
```

**Response**

Full configuration (same shape as GET).

**Errors**

- `403`, `422`, `500`

## Validation Rules

| Field | Rules |
|-------|-------|
| `timezone` | Must be a valid IANA identifier (stored as text; enforcement handled in the service layer). |
| `schedule.<day>[].start` | 24h time string `HH:MM`. |
| `schedule.<day>[].end` | Must be strictly later than `start`. |
| `schedule` | Optional per day. An empty list means “unavailable”. |
| `workspace_online` | Boolean override: when `false` the workspace is considered offline regardless of schedule. |
| `respect_schedule` | Boolean flag allowing future logic to bypass scheduling entirely if disabled. |

## Typical Controller Flow

1. Verify the authenticated user belongs to the workspace (`WorkspaceMember` lookup).  
2. Load the existing `yetti_workspace_hours` record (if any).  
3. For `PUT`, replace or insert the record with the validated payload.  
4. For `PATCH`, update or create the record with the override flag.  
5. Return the normalized structure to the client.

## Example Error Responses

- `403 Forbidden`: user does not have access to the workspace.  
- `404 Not Found`: schedule not configured (GET only).  
- `422 Unprocessable Entity`: invalid time range or malformed payload.  
- `500 Internal Server Error`: unexpected persistence failure.

## Deployment Checklist

1. Apply the schema and trigger migration before starting the API.  
2. Set the `SUPABASE_SERVICE_ROLE_KEY` environment variable for server-side Supabase access.  
3. Ensure the controller is included in your FastAPI router setup:  
   ```python
   from app.controllers import workspace_hours_controller
   app.include_router(workspace_hours_controller.router)
   ```
4. Add client-side integrations or management panels once the backend is reachable.  
5. Validate with integration tests or Postman requests against the three endpoints above.

---

This README is intentionally scoped to the schedule subsystem. For broader workspace information, refer to the main project documentation.


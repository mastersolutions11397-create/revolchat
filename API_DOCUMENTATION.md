# Yeti AI - Complete API Documentation

## Base URL

```
https://your-domain.com/api/yetti
```

## Authentication

All API endpoints require authentication via Supabase JWT token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

---

## Database Schema

### Users Table (Managed by Supabase Auth)

```sql
-- This table is automatically managed by Supabase Auth
-- Additional user data can be stored in yetti_user_profiles
```

### yetti_user_profiles

```sql
CREATE TABLE yetti_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(200),
    phone VARCHAR(20),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### yetti_workspaces

```sql
CREATE TABLE yetti_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    workspace_type VARCHAR(50) DEFAULT 'personal', -- personal, business, enterprise
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### yetti_workspace_members

```sql
CREATE TABLE yetti_workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES yetti_workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);
```

### yetti_ai_agents

```sql
CREATE TABLE yetti_ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES yetti_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    agent_type VARCHAR(50) DEFAULT 'chatbot', -- chatbot, assistant, automation
    configuration JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, training, error
    model_provider VARCHAR(50), -- openai, anthropic, custom
    model_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### yetti_integrations

```sql
CREATE TABLE yetti_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES yetti_workspaces(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES yetti_ai_agents(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- instagram, telegram, whatsapp, discord, slack
    platform_config JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive', -- active, inactive, error
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### yetti_interactions

```sql
CREATE TABLE yetti_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES yetti_workspaces(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES yetti_ai_agents(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES yetti_integrations(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    agent_response TEXT,
    platform VARCHAR(50) NOT NULL,
    platform_user_id VARCHAR(200),
    interaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### yetti_analytics

```sql
CREATE TABLE yetti_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES yetti_workspaces(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES yetti_ai_agents(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4),
    metric_data JSONB DEFAULT '{}',
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workspace_id, agent_id, metric_name, date)
);
```

---

## API Endpoints

### User Profile Management

#### GET /api/yetti/profile

Get current user profile

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "company": "Acme Corp",
  "phone": "+1234567890",
  "avatar_url": "https://...",
  "timezone": "UTC",
  "notification_preferences": {
    "email": true,
    "sms": false,
    "push": true
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/yetti/profile

Update user profile

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "company": "Acme Corp",
  "phone": "+1234567890",
  "avatar_url": "https://...",
  "timezone": "UTC",
  "notification_preferences": {
    "email": true,
    "sms": false,
    "push": true
  }
}
```

#### POST /api/yetti/profile/avatar

Upload avatar image

```json
{
  "file": "multipart/form-data"
}
```

### Workspace Management

#### GET /api/yetti/workspaces

Get user's workspaces

```json
{
  "workspaces": [
    {
      "id": "uuid",
      "name": "My Personal Workspace",
      "description": "Personal AI agents",
      "workspace_type": "personal",
      "owner_id": "uuid",
      "settings": {},
      "is_active": true,
      "member_count": 1,
      "agent_count": 3,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/yetti/workspaces

Create new workspace

```json
{
  "name": "My Personal Workspace",
  "description": "Personal AI agents for my projects",
  "workspace_type": "personal"
}
```

#### GET /api/yetti/workspaces/{workspace_id}

Get specific workspace details

```json
{
  "id": "uuid",
  "name": "My Personal Workspace",
  "description": "Personal AI agents",
  "workspace_type": "personal",
  "owner_id": "uuid",
  "settings": {},
  "is_active": true,
  "members": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "role": "owner",
      "permissions": {},
      "joined_at": "2024-01-01T00:00:00Z",
      "user_profile": {
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://..."
      }
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/yetti/workspaces/{workspace_id}

Update workspace

```json
{
  "name": "Updated Workspace Name",
  "description": "Updated description",
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}
```

#### DELETE /api/yetti/workspaces/{workspace_id}

Delete workspace

#### POST /api/yetti/workspaces/{workspace_id}/members

Add member to workspace

```json
{
  "user_email": "user@example.com",
  "role": "member"
}
```

#### PUT /api/yetti/workspaces/{workspace_id}/members/{user_id}

Update member role

```json
{
  "role": "admin"
}
```

#### DELETE /api/yetti/workspaces/{workspace_id}/members/{user_id}

Remove member from workspace

### AI Agent Management

#### GET /api/yetti/workspaces/{workspace_id}/agents

Get workspace agents

```json
{
  "agents": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "name": "Customer Support Bot",
      "description": "Handles customer inquiries",
      "agent_type": "chatbot",
      "configuration": {
        "temperature": 0.7,
        "max_tokens": 1000
      },
      "status": "active",
      "model_provider": "openai",
      "model_name": "gpt-4",
      "integration_count": 2,
      "interaction_count": 150,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/yetti/workspaces/{workspace_id}/agents

Create new AI agent

```json
{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries",
  "agent_type": "chatbot",
  "configuration": {
    "temperature": 0.7,
    "max_tokens": 1000,
    "system_prompt": "You are a helpful customer support assistant."
  },
  "model_provider": "openai",
  "model_name": "gpt-4"
}
```

#### GET /api/yetti/workspaces/{workspace_id}/agents/{agent_id}

Get specific agent details

```json
{
  "id": "uuid",
  "workspace_id": "uuid",
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries",
  "agent_type": "chatbot",
  "configuration": {
    "temperature": 0.7,
    "max_tokens": 1000,
    "system_prompt": "You are a helpful customer support assistant."
  },
  "status": "active",
  "model_provider": "openai",
  "model_name": "gpt-4",
  "integrations": [
    {
      "id": "uuid",
      "platform": "telegram",
      "status": "active",
      "last_sync_at": "2024-01-01T12:00:00Z"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/yetti/workspaces/{workspace_id}/agents/{agent_id}

Update agent

```json
{
  "name": "Updated Bot Name",
  "description": "Updated description",
  "configuration": {
    "temperature": 0.8,
    "max_tokens": 1500
  },
  "status": "active"
}
```

#### DELETE /api/yetti/workspaces/{workspace_id}/agents/{agent_id}

Delete agent

#### POST /api/yetti/workspaces/{workspace_id}/agents/{agent_id}/test

Test agent with sample message

```json
{
  "message": "Hello, I need help with my order",
  "context": {}
}
```

### Integration Management

#### GET /api/yetti/workspaces/{workspace_id}/agents/{agent_id}/integrations

Get agent integrations

```json
{
  "integrations": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "agent_id": "uuid",
      "platform": "telegram",
      "platform_config": {
        "bot_token": "encrypted_token",
        "webhook_url": "https://..."
      },
      "status": "active",
      "last_sync_at": "2024-01-01T12:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/yetti/workspaces/{workspace_id}/agents/{agent_id}/integrations

Create new integration

```json
{
  "platform": "telegram",
  "platform_config": {
    "bot_token": "your_bot_token",
    "webhook_url": "https://your-domain.com/webhook"
  }
}
```

#### PUT /api/yetti/workspaces/{workspace_id}/agents/{agent_id}/integrations/{integration_id}

Update integration

```json
{
  "platform_config": {
    "bot_token": "updated_token",
    "webhook_url": "https://updated-webhook.com"
  },
  "status": "active"
}
```

#### DELETE /api/yetti/workspaces/{workspace_id}/agents/{agent_id}/integrations/{integration_id}

Delete integration

#### POST /api/yetti/workspaces/{workspace_id}/agents/{agent_id}/integrations/{integration_id}/test

Test integration connection

### Analytics & Reporting

#### GET /api/yetti/workspaces/{workspace_id}/analytics

Get workspace analytics

```json
{
  "summary": {
    "total_interactions": 1250,
    "active_agents": 3,
    "active_integrations": 5,
    "response_time_avg": 1.2,
    "satisfaction_score": 4.5
  },
  "metrics": [
    {
      "date": "2024-01-01",
      "interactions": 45,
      "response_time": 1.1,
      "satisfaction": 4.3
    }
  ],
  "agent_performance": [
    {
      "agent_id": "uuid",
      "agent_name": "Customer Support Bot",
      "interactions": 800,
      "avg_response_time": 1.0,
      "satisfaction_score": 4.6
    }
  ]
}
```

#### GET /api/yetti/workspaces/{workspace_id}/agents/{agent_id}/analytics

Get agent-specific analytics

```json
{
  "agent_id": "uuid",
  "agent_name": "Customer Support Bot",
  "summary": {
    "total_interactions": 800,
    "avg_response_time": 1.0,
    "satisfaction_score": 4.6,
    "active_integrations": 2
  },
  "daily_metrics": [
    {
      "date": "2024-01-01",
      "interactions": 25,
      "response_time": 0.9,
      "satisfaction": 4.5
    }
  ],
  "platform_breakdown": [
    {
      "platform": "telegram",
      "interactions": 500,
      "avg_response_time": 0.8
    },
    {
      "platform": "instagram",
      "interactions": 300,
      "avg_response_time": 1.2
    }
  ]
}
```

#### GET /api/yetti/workspaces/{workspace_id}/interactions

Get workspace interactions

```json
{
  "interactions": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "agent_id": "uuid",
      "integration_id": "uuid",
      "user_message": "Hello, I need help",
      "agent_response": "Hi! How can I help you today?",
      "platform": "telegram",
      "platform_user_id": "user123",
      "interaction_data": {
        "response_time": 1.2,
        "satisfaction": 5
      },
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1250,
    "total_pages": 63
  }
}
```

### Dashboard Data

#### GET /api/yetti/dashboard

Get dashboard overview

```json
{
  "user_profile": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "Acme Corp"
  },
  "workspace_summary": {
    "total_workspaces": 2,
    "active_workspaces": 2,
    "total_agents": 5,
    "active_agents": 4,
    "total_integrations": 8,
    "active_integrations": 7
  },
  "recent_activity": [
    {
      "type": "interaction",
      "message": "New interaction on Customer Support Bot",
      "platform": "telegram",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    {
      "type": "agent_created",
      "message": "New agent 'Sales Assistant' created",
      "timestamp": "2024-01-01T11:30:00Z"
    }
  ],
  "quick_stats": {
    "today_interactions": 45,
    "this_week_interactions": 320,
    "this_month_interactions": 1250,
    "avg_response_time": 1.2
  }
}
```

### Webhook Endpoints

#### POST /api/yetti/webhooks/{platform}

Handle platform webhooks

```json
{
  "platform": "telegram",
  "data": {
    "message": {
      "text": "Hello",
      "from": {
        "id": "user123",
        "username": "john_doe"
      },
      "chat": {
        "id": "chat456"
      }
    }
  }
}
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "name",
      "reason": "Name is required"
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication token
- `FORBIDDEN` - User doesn't have permission for this action
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `CONFLICT` - Resource already exists
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

- 1000 requests per hour per user
- 100 requests per minute per user
- Webhook endpoints: 10000 requests per hour

---

## WebSocket Events

For real-time updates, connect to:

```
wss://your-domain.com/api/yetti/ws?token=<jwt_token>
```

### Events

- `agent_status_changed` - Agent status updated
- `new_interaction` - New interaction received
- `integration_status_changed` - Integration status updated
- `workspace_updated` - Workspace settings changed

# Workspace API Implementation

## Updated app/main.py

Add the workspace controller to your main.py:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.controllers import (
    dashboard_controller,
    analytics_controller,
    interaction_controller,
    integration_controller,
    webhook_controller,
    workspace_controller,
    workspace_hours_controller,  # Add this import
)

app = FastAPI(
    title="Yeti AI API",
    description="AI Agent Integration Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard_controller.router)
app.include_router(workspace_controller.router)
app.include_router(workspace_hours_controller.router)  # Add this line
app.include_router(workspace_hours_controller.router)  # Add this line
app.include_router(analytics_controller.router)
app.include_router(interaction_controller.router)
app.include_router(integration_controller.router)
app.include_router(webhook_controller.router)

@app.get("/")
async def root():
    return {"message": "Yeti AI API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Workspace Controller (app/controllers/workspace_controller.py)

The workspace controller file has been created with the following endpoints:

### POST /api/yetti/workspaces

Create a new workspace

**Request:**

```json
{
  "name": "My Personal Workspace",
  "description": "Personal AI agents for my projects",
  "workspace_type": "personal"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "My Personal Workspace",
  "description": "Personal AI agents for my projects",
  "workspace_type": "personal",
  "owner_id": "user-uuid",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### GET /api/yetti/workspaces

Get user's workspaces

**Response:**

```json
{
  "workspaces": [
    {
      "id": "uuid",
      "name": "My Personal Workspace",
      "description": "Personal AI agents",
      "workspace_type": "personal",
      "owner_id": "user-uuid",
      "is_active": true,
      "member_count": 1,
      "agent_count": 3,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Frontend Integration

Update your workspace page to call the API:

### app/workspace/page.tsx - Updated Implementation

```typescript
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WorkspaceSelectionPage() {
  const { user, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user?.id) {
        setError("User not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/yetti/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          name: workspaceName.trim(),
          description: workspaceDescription.trim() || undefined,
          workspace_type: "personal",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create workspace");
      }

      const workspace = await response.json();

      // Redirect to dashboard after successful creation
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred while creating workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-purple-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-2xl font-bold yeti-gradient bg-clip-text text-transparent"
                >
                  🧊 Yeti AI
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your Workspace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started by creating your personal workspace
            </p>
          </div>

          {/* Create Workspace Button */}
          <div className="text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="yeti-card rounded-2xl p-12 yeti-shadow hover:shadow-xl transition-all cursor-pointer group inline-block"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-5xl text-white">➕</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Create New Workspace
              </h3>
              <p className="text-gray-600 max-w-md">
                Start fresh with a new personal workspace for your AI agent
                projects
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="yeti-card rounded-2xl p-8 yeti-shadow max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Personal Workspace
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label
                  htmlFor="workspaceName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Workspace Name
                </label>
                <input
                  type="text"
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g., My Personal Workspace"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="workspaceDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="workspaceDescription"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="Describe your workspace"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                    setWorkspaceName("");
                    setWorkspaceDescription("");
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
```

## Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing the API

### Using cURL:

```bash
# Create workspace
curl -X POST "http://localhost:8000/api/yetti/workspaces" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 804e55e2-3186-48d5-aa33-102e955de248" \
  -d '{
    "name": "My Personal Workspace",
    "description": "Personal AI agents",
    "workspace_type": "personal"
  }'

# Get workspaces
curl -X GET "http://localhost:8000/api/yetti/workspaces" \
  -H "x-user-id: 804e55e2-3186-48d5-aa33-102e955de248"
```

## Complete Feature Summary

✅ **Workspace Creation** - Creates workspace and adds user as owner  
✅ **Workspace Listing** - Gets all user workspaces with counts  
✅ **Error Handling** - Proper validation and error messages  
✅ **Frontend Integration** - Fully functional modal with API calls  
✅ **Authentication** - Uses x-user-id header  
✅ **Database Integration** - Creates workspace and membership records

The workspace creation API is now fully functional and integrated with your frontend!

## Workspace Hours API (app/controllers/workspace_hours_controller.py)

The workspace hours controller exposes endpoints for configuring weekly availability and manual overrides:

### Database Table

```sql
CREATE TABLE IF NOT EXISTS yetti_workspace_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES yetti_workspaces(id) ON DELETE CASCADE,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
    respect_schedule BOOLEAN NOT NULL DEFAULT TRUE,
    workspace_online BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### GET /api/yetti/workspaces/{workspace_id}/hours

Fetch the saved working hours for a workspace.

**Response**

```json
{
  "workspace_id": "uuid",
  "timezone": "Asia/Karachi",
  "schedule": {
    "monday": [
      { "start": "09:00", "end": "17:00" }
    ],
    "tuesday": [
      { "start": "09:00", "end": "17:00" }
    ]
  },
  "respect_schedule": true,
  "workspace_online": true,
  "created_at": "2025-01-10T12:00:00Z",
  "updated_at": "2025-01-10T12:00:00Z"
}
```

### PUT /api/yetti/workspaces/{workspace_id}/hours

Create or update the weekly schedule, timezone, and current override flag.

**Request**

```json
{
  "timezone": "Asia/Karachi",
  "schedule": {
    "monday": [
      { "start": "09:00", "end": "17:00" }
    ],
    "friday": [
      { "start": "10:00", "end": "14:00" },
      { "start": "16:00", "end": "19:00" }
    ]
  },
  "respect_schedule": true,
  "workspace_online": true
}
```

**Response**

Returns the same payload as `GET`, reflecting the latest data.

### PATCH /api/yetti/workspaces/{workspace_id}/hours/status

Toggle the workspace on/off regardless of the saved schedule.

**Request**

```json
{
  "workspace_online": false
}
```

**Response**

Returns the updated configuration including schedule and timezone.

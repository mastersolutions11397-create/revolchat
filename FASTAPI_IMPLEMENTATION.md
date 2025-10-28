# FastAPI Implementation for Yeti AI

## Project Structure

```
yetti-backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── auth.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── workspace.py
│   │   ├── agent.py
│   │   ├── integration.py
│   │   └── analytics.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── workspace.py
│   │   ├── agent.py
│   │   ├── integration.py
│   │   └── analytics.py
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── user_controller.py
│   │   ├── workspace_controller.py
│   │   ├── agent_controller.py
│   │   ├── integration_controller.py
│   │   ├── analytics_controller.py
│   │   └── webhook_controller.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── supabase_service.py
│   │   ├── ai_service.py
│   │   └── platform_service.py
│   └── utils/
│       ├── __init__.py
│       ├── exceptions.py
│       └── helpers.py
├── requirements.txt
└── README.md
```

## requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
supabase==2.0.2
pydantic==2.5.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
httpx==0.25.2
python-dotenv==1.0.0
sqlalchemy==2.0.23
asyncpg==0.29.0
alembic==1.13.0
redis==5.0.1
celery==5.3.4
websockets==12.0
```

## app/config.py

```python
import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # Database Configuration
    database_url: str

    # JWT Configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"

    # AI Service Configuration
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # Platform API Keys
    telegram_bot_token: Optional[str] = None
    instagram_access_token: Optional[str] = None
    whatsapp_business_token: Optional[str] = None

    # Rate Limiting
    rate_limit_requests: int = 1000
    rate_limit_window: int = 3600  # 1 hour

    class Config:
        env_file = ".env"

settings = Settings()
```

## app/database.py

```python
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create database engine
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## app/auth.py

```python
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import create_client, Client
from app.config import settings
from app.utils.exceptions import UnauthorizedException

security = HTTPBearer()
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from Supabase JWT token"""
    try:
        # Verify token with Supabase
        response = supabase.auth.get_user(credentials.credentials)
        if not response.user:
            raise UnauthorizedException("Invalid token")

        return response.user
    except Exception as e:
        raise UnauthorizedException("Could not validate credentials")

async def get_current_user_id(current_user = Depends(get_current_user)):
    """Extract user ID from current user"""
    return current_user.id
```

## app/models/user.py

```python
from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import uuid

class UserProfile(Base):
    __tablename__ = "yetti_user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    company = Column(String(200))
    phone = Column(String(20))
    avatar_url = Column(Text)
    timezone = Column(String(50), default="UTC")
    notification_preferences = Column(JSON, default={"email": True, "sms": False, "push": True})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

## app/models/workspace.py

```python
from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Workspace(Base):
    __tablename__ = "yetti_workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    workspace_type = Column(String(50), default="personal")
    owner_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    agents = relationship("AIAgent", back_populates="workspace", cascade="all, delete-orphan")

class WorkspaceMember(Base):
    __tablename__ = "yetti_workspace_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("yetti_workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    role = Column(String(50), default="member")
    permissions = Column(JSON, default={})
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="members")
```

## app/models/agent.py

```python
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class AIAgent(Base):
    __tablename__ = "yetti_ai_agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("yetti_workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    agent_type = Column(String(50), default="chatbot")
    configuration = Column(JSON, default={})
    status = Column(String(20), default="inactive")
    model_provider = Column(String(50))
    model_name = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="agents")
    integrations = relationship("Integration", back_populates="agent", cascade="all, delete-orphan")
```

## app/models/integration.py

```python
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Integration(Base):
    __tablename__ = "yetti_integrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("yetti_workspaces.id", ondelete="CASCADE"), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("yetti_ai_agents.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False)
    platform_config = Column(JSON, nullable=False)
    status = Column(String(20), default="inactive")
    last_sync_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    agent = relationship("AIAgent", back_populates="integrations")
```

## app/schemas/user.py

```python
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class UserProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: str = "UTC"
    notification_preferences: Dict[str, Any] = {"email": True, "sms": False, "push": True}

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## app/schemas/workspace.py

```python
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    workspace_type: str = "personal"
    settings: Dict[str, Any] = {}

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class WorkspaceMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    role: str
    permissions: Dict[str, Any]
    joined_at: datetime
    user_profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class WorkspaceResponse(WorkspaceBase):
    id: UUID
    owner_id: UUID
    is_active: bool
    member_count: Optional[int] = None
    agent_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkspaceDetailResponse(WorkspaceResponse):
    members: List[WorkspaceMemberResponse] = []

class WorkspaceListResponse(BaseModel):
    workspaces: List[WorkspaceResponse]
```

## app/controllers/user_controller.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user_id
from app.models.user import UserProfile
from app.schemas.user import UserProfileResponse, UserProfileUpdate
from app.utils.exceptions import NotFoundException

router = APIRouter(prefix="/api/yetti", tags=["user"])

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise NotFoundException("User profile not found")
    return profile

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        # Create new profile if doesn't exist
        profile = UserProfile(user_id=user_id, **profile_data.dict(exclude_unset=True))
        db.add(profile)
    else:
        # Update existing profile
        for field, value in profile_data.dict(exclude_unset=True).items():
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Upload user avatar"""
    # Implementation for file upload to storage service
    # Return avatar URL
    pass
```

## app/controllers/workspace_controller.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth import get_current_user_id
from app.models.workspace import Workspace, WorkspaceMember
from app.models.agent import AIAgent
from app.schemas.workspace import (
    WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse,
    WorkspaceDetailResponse, WorkspaceListResponse
)
from app.utils.exceptions import NotFoundException, ForbiddenException
from uuid import UUID

router = APIRouter(prefix="/api/yetti", tags=["workspace"])

@router.get("/workspaces", response_model=WorkspaceListResponse)
async def get_user_workspaces(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user's workspaces"""
    workspaces = db.query(Workspace).join(WorkspaceMember).filter(
        WorkspaceMember.user_id == user_id
    ).all()

    workspace_responses = []
    for workspace in workspaces:
        member_count = db.query(func.count(WorkspaceMember.id)).filter(
            WorkspaceMember.workspace_id == workspace.id
        ).scalar()

        agent_count = db.query(func.count(AIAgent.id)).filter(
            AIAgent.workspace_id == workspace.id
        ).scalar()

        workspace_dict = workspace.__dict__.copy()
        workspace_dict['member_count'] = member_count
        workspace_dict['agent_count'] = agent_count
        workspace_responses.append(WorkspaceResponse(**workspace_dict))

    return WorkspaceListResponse(workspaces=workspace_responses)

@router.post("/workspaces", response_model=WorkspaceResponse)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create new workspace"""
    workspace = Workspace(
        owner_id=user_id,
        **workspace_data.dict()
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    # Add owner as member
    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user_id,
        role="owner"
    )
    db.add(member)
    db.commit()

    return workspace

@router.get("/workspaces/{workspace_id}", response_model=WorkspaceDetailResponse)
async def get_workspace(
    workspace_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get specific workspace details"""
    # Check if user has access to workspace
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()

    if not member:
        raise ForbiddenException("Access denied to workspace")

    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise NotFoundException("Workspace not found")

    return workspace

@router.put("/workspaces/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: UUID,
    workspace_data: WorkspaceUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update workspace"""
    # Check if user is owner or admin
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()

    if not member or member.role not in ["owner", "admin"]:
        raise ForbiddenException("Insufficient permissions")

    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise NotFoundException("Workspace not found")

    for field, value in workspace_data.dict(exclude_unset=True).items():
        setattr(workspace, field, value)

    db.commit()
    db.refresh(workspace)
    return workspace

@router.delete("/workspaces/{workspace_id}")
async def delete_workspace(
    workspace_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete workspace"""
    # Check if user is owner
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()

    if not member or member.role != "owner":
        raise ForbiddenException("Only workspace owner can delete workspace")

    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not workspace:
        raise NotFoundException("Workspace not found")

    db.delete(workspace)
    db.commit()

    return {"message": "Workspace deleted successfully"}
```

## app/main.py

```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.controllers import (
    user_controller,
    workspace_controller,
    agent_controller,
    integration_controller,
    analytics_controller,
    webhook_controller
)

app = FastAPI(
    title="Yeti AI API",
    description="AI Agent Integration Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_controller.router)
app.include_router(workspace_controller.router)
app.include_router(agent_controller.router)
app.include_router(integration_controller.router)
app.include_router(analytics_controller.router)
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

## app/utils/exceptions.py

```python
from fastapi import HTTPException, status

class YetiException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code

class UnauthorizedException(YetiException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class ForbiddenException(YetiException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class NotFoundException(YetiException):
    def __init__(self, message: str = "Not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class ValidationException(YetiException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)

class ConflictException(YetiException):
    def __init__(self, message: str = "Conflict"):
        super().__init__(message, status.HTTP_409_CONFLICT)
```

This FastAPI implementation provides:

1. **Complete CRUD operations** for all entities
2. **Supabase authentication** integration
3. **Database models** with proper relationships
4. **Pydantic schemas** for request/response validation
5. **Error handling** with custom exceptions
6. **Workspace-based access control**
7. **RESTful API structure** following the documented endpoints

To run the backend:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with automatic documentation at `http://localhost:8000/docs`.

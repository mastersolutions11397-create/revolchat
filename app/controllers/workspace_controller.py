from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_user_id
from app.models.workspace import Workspace, WorkspaceMember
from app.models.agent import AIAgent
from app.models.integration import Integration
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/yetti", tags=["workspaces"])

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    workspace_type: str = "personal"

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    workspace_type: str
    owner_id: str
    is_active: bool
    created_at: str
    updated_at: str

@router.post("/workspaces", response_model=WorkspaceResponse)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """Create new workspace"""
    try:
        # Validate workspace name
        if not workspace_data.name or len(workspace_data.name.strip()) == 0:
            raise HTTPException(status_code=400, detail="Workspace name is required")
        
        # Validate workspace type
        valid_types = ["personal", "business", "enterprise"]
        if workspace_data.workspace_type not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid workspace type. Must be one of: {', '.join(valid_types)}"
            )
        
        # Create workspace
        workspace = Workspace(
            name=workspace_data.name.strip(),
            description=workspace_data.description.strip() if workspace_data.description else None,
            workspace_type=workspace_data.workspace_type,
            owner_id=user_id,
            is_active=True
        )
        
        db.add(workspace)
        db.flush()  # Flush to get the workspace ID
        
        # Add owner as member with 'owner' role
        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=user_id,
            role="owner"
        )
        db.add(member)
        
        db.commit()
        db.refresh(workspace)
        
        return WorkspaceResponse(
            id=str(workspace.id),
            name=workspace.name,
            description=workspace.description,
            workspace_type=workspace.workspace_type,
            owner_id=str(workspace.owner_id),
            is_active=workspace.is_active,
            created_at=workspace.created_at.isoformat(),
            updated_at=workspace.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/workspaces", response_model=dict)
async def get_user_workspaces(
    user_id: str = Depends(get_user_id),
    db: Session = Depends(get_db)
):
    """Get user's workspaces"""
    try:
        from sqlalchemy import func
        
        # Get workspaces where user is a member
        workspaces = db.query(Workspace).join(
            WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id
        ).filter(WorkspaceMember.user_id == user_id).all()
        
        workspace_list = []
        for workspace in workspaces:
            # Get counts
            member_count = db.query(func.count(WorkspaceMember.id)).filter(
                WorkspaceMember.workspace_id == workspace.id
            ).scalar()
            
            agent_count = db.query(func.count(AIAgent.id)).filter(
                AIAgent.workspace_id == workspace.id
            ).scalar()
            
            workspace_list.append({
                "id": str(workspace.id),
                "name": workspace.name,
                "description": workspace.description,
                "workspace_type": workspace.workspace_type,
                "owner_id": str(workspace.owner_id),
                "is_active": workspace.is_active,
                "member_count": member_count,
                "agent_count": agent_count,
                "created_at": workspace.created_at.isoformat(),
                "updated_at": workspace.updated_at.isoformat()
            })
        
        return {"workspaces": workspace_list}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

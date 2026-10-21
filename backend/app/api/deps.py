import uuid
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError  # type: ignore
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.all_models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/auth/login")

def to_uuid(val):
    if val is None or isinstance(val, uuid.UUID):
        return val
    try:
        return uuid.UUID(str(val))
    except (ValueError, AttributeError):
        return val

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to header for testing and cross-origin API calls
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = db.query(User).filter(User.id == to_uuid(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or session expired. Please log in.")
    return user

def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter(User.id == to_uuid(user_id)).first()
    except Exception:
        return None

def get_current_workspace(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    workspace_id = request.headers.get("X-Workspace-ID")
    from app.models.all_models import WorkspaceMember, Workspace
    
    if not workspace_id:
        member = db.query(WorkspaceMember).filter(
            WorkspaceMember.user_id == to_uuid(current_user.id)
        ).first()
        if member:
            workspace_id = str(member.workspace_id)
        else:
            raise HTTPException(status_code=400, detail="X-Workspace-ID header is missing and user has no workspace")
    
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.user_id == to_uuid(current_user.id),
        WorkspaceMember.workspace_id == to_uuid(workspace_id)
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to access this workspace")
        
    workspace = db.query(Workspace).filter(Workspace.id == to_uuid(workspace_id)).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    return {"workspace": workspace, "member": member}

def require_role(allowed_roles: list[str]):
    def role_checker(context: dict = Depends(get_current_workspace)):
        if context["member"].role.value not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return context
    return role_checker

def get_current_brand(
    request: Request,
    db: Session = Depends(get_db),
    context: dict = Depends(get_current_workspace)
):
    brand_id = request.headers.get("X-Brand-ID")
    from app.models.all_models import Brand
    
    ws_id = to_uuid(context["workspace"].id)
    if not brand_id:
        brand = db.query(Brand).filter(
            Brand.workspace_id == ws_id
        ).first()
        if brand:
            return brand
        raise HTTPException(status_code=400, detail="X-Brand-ID header is missing and no brand found in workspace")
        
    brand = db.query(Brand).filter(
        Brand.id == to_uuid(brand_id),
        Brand.workspace_id == ws_id
    ).first()
    
    if not brand:
        raise HTTPException(status_code=403, detail="Not authorized to access this brand")
        
    return brand

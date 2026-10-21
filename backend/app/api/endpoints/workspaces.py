from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse
from app.models.all_models import Workspace, WorkspaceMember, UserRole, User
import uuid

router = APIRouter()

@router.post("", response_model=WorkspaceResponse)
@router.post("/", response_model=WorkspaceResponse)
def create_workspace(
    workspace_in: WorkspaceCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # simple slug generation
    slug = workspace_in.name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:8]
    workspace = Workspace(name=workspace_in.name, slug=slug, owner_id=current_user.id)
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    
    # create member record
    member = WorkspaceMember(user_id=current_user.id, workspace_id=workspace.id, role=UserRole.OWNER)
    db.add(member)
    db.commit()
    
    return workspace

@router.get("", response_model=list[WorkspaceResponse])
@router.get("/", response_model=list[WorkspaceResponse])
def get_workspaces(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    workspaces = db.query(Workspace).join(WorkspaceMember).filter(WorkspaceMember.user_id == current_user.id).all()
    return workspaces

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: uuid.UUID,
    context: dict = Depends(deps.get_current_workspace)
):
    return context["workspace"]

@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: uuid.UUID,
    workspace_in: dict, # Simplified for demo, should be Pydantic schema
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.require_role(["OWNER", "ADMIN"]))
):
    workspace = context["workspace"]
    if "name" in workspace_in:
        workspace.name = workspace_in["name"]
    db.commit()
    db.refresh(workspace)
    return workspace

@router.get("/{workspace_id}/plan")
def get_workspace_plan(
    workspace_id: uuid.UUID,
    context: dict = Depends(deps.get_current_workspace)
):
    ws = context["workspace"]
    plan = getattr(ws, "plan_tier", "FREE")
    quota = getattr(ws, "monthly_credit_quota", 50000)
    used = getattr(ws, "used_credits_this_month", 0)
    return {
        "workspace_id": str(ws.id),
        "plan_tier": plan,
        "monthly_credit_quota": quota,
        "used_credits_this_month": used,
        "remaining_credits": max(0, quota - used),
        "subscription_status": getattr(ws, "subscription_status", "active"),
        "unlocked_agents_count": 15 if plan in ["PRO", "ENTERPRISE"] else 3,
        "total_agents_count": 15
    }

@router.post("/{workspace_id}/upgrade")
def upgrade_workspace_plan(
    workspace_id: uuid.UUID,
    plan_data: dict,  # e.g. {"plan": "PRO"}
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.require_role(["OWNER", "ADMIN"])),
    current_user: User = Depends(deps.get_current_user)
):
    ws = context["workspace"]
    new_plan = plan_data.get("plan", "PRO").upper()
    if new_plan not in ["FREE", "PRO", "ENTERPRISE"]:
        raise HTTPException(status_code=400, detail="Invalid plan tier. Choose FREE, PRO, or ENTERPRISE.")
    
    from app.billing.service import BillingService
    billing_svc = BillingService(db)
    
    if new_plan == "FREE":
        res = billing_svc.cancel_subscription(workspace_id=ws.id, immediate=True)
        return {
            "status": "SUCCESS",
            "plan_tier": "FREE",
            "monthly_credit_quota": 50000,
            "message": res["message"]
        }
    
    amount = 4999.0 if new_plan == "PRO" else 19999.0
    res = billing_svc.process_successful_payment(
        workspace_id=ws.id,
        user_id=current_user.id,
        plan_tier=new_plan,
        billing_cycle="MONTHLY",
        amount=amount,
        provider="mock",
        provider_payment_id=f"pay_{uuid.uuid4().hex[:12]}",
        provider_order_id=f"ord_{uuid.uuid4().hex[:12]}"
    )
    return {
        "status": "SUCCESS",
        "plan_tier": ws.plan_tier,
        "monthly_credit_quota": ws.monthly_credit_quota,
        "used_credits_this_month": ws.used_credits_this_month or 0,
        "invoice_number": res.get("invoice_number"),
        "message": res.get("message")
    }


@router.get("/{workspace_id}/members")
def get_workspace_members(
    workspace_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.get_current_workspace)
):
    ws = context["workspace"]
    members = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws.id).all()
    results = []
    for m in members:
        u = db.query(User).filter(User.id == m.user_id).first()
        results.append({
            "id": str(m.id),
            "user_id": str(m.user_id),
            "email": u.email if u else "Unknown",
            "name": u.name if u else "User",
            "role": m.role.value if hasattr(m.role, "value") else str(m.role)
        })
    return results

@router.post("/{workspace_id}/members")
def invite_workspace_member(
    workspace_id: uuid.UUID,
    invite_data: dict,
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.require_role(["OWNER", "ADMIN"]))
):
    ws = context["workspace"]
    email = invite_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    role_str = invite_data.get("role", "MARKETER").upper()
    role_val = UserRole[role_str] if role_str in UserRole.__members__ else UserRole.MARKETER
    
    target_user = db.query(User).filter(User.email == email).first()
    if not target_user:
        target_user = User(
            id=uuid.uuid4(),
            email=email,
            name=email.split("@")[0].title(),
            hashed_password=""
        )
        db.add(target_user)
        db.commit()
        db.refresh(target_user)
        
    existing = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == ws.id,
        WorkspaceMember.user_id == target_user.id
    ).first()
    
    if existing:
        existing.role = role_val
    else:
        new_m = WorkspaceMember(
            id=uuid.uuid4(),
            workspace_id=ws.id,
            user_id=target_user.id,
            role=role_val
        )
        db.add(new_m)
        
    db.commit()
    return {"status": "SUCCESS", "message": f"Successfully added {email} to workspace as {role_str}."}

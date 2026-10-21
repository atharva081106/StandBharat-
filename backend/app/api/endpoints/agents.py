from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from typing import List, Optional
from app.api.deps import get_current_brand, get_current_user, get_optional_current_user, to_uuid
from app.models.all_models import Brand, User, AgentTask, AgentRun, Integration
from app.db.session import SessionLocal
from pydantic import BaseModel, Field
from app.agents.registry import agent_registry
from app.worker import execute_generic_agent, _execute_agent_run
import uuid

router = APIRouter()

OKARA_PARITY_IDS = {
    "analytics", "competitor", "growth", "content_strategy", 
    "content_writer", "performance", "seo_agent", "geo_agent", "ai_cmo"
}
STANDBHARAT_EXCLUSIVE_IDS = {
    "linkedin_agent", "x_agent", "reddit_agent", "coding_agent", 
    "influencer_agent", "ugc_agent"
}

class AgentResponse(BaseModel):
    id: str
    name: str
    description: str
    capabilities: List[str]
    status: str = "ACTIVE"
    tier: str = "PRO"
    resource_profile: str = "STANDARD"
    resourceProfile: str = "STANDARD"
    credit_cost: int = 1500
    creditCost: int = 1500
    isOkaraParity: bool = False
    isStandBharatExclusive: bool = False

def serialize_agent(a) -> dict:
    aid = a.agent_id
    tier = getattr(a, "tier", "PRO")
    res_prof = getattr(a, "resource_profile", "STANDARD")
    cost = getattr(a, "credit_cost", 1500)
    is_okara = aid in OKARA_PARITY_IDS
    is_exclusive = aid in STANDBHARAT_EXCLUSIVE_IDS
    return {
        "id": aid,
        "name": a.name,
        "description": a.description,
        "capabilities": a.capabilities or [],
        "status": "ACTIVE",
        "tier": tier,
        "resource_profile": res_prof,
        "resourceProfile": res_prof,
        "credit_cost": cost,
        "creditCost": cost,
        "isOkaraParity": is_okara,
        "isStandBharatExclusive": is_exclusive,
    }

@router.get("", response_model=List[AgentResponse])
@router.get("/", response_model=List[AgentResponse])
def list_agents(current_user: Optional[User] = Depends(get_optional_current_user)):
    agents = agent_registry.list_agents()
    return [
        serialize_agent(a)
        for a in agents
        if a.agent_id not in ("test", "test-agent")
    ]

@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: str, current_user: Optional[User] = Depends(get_optional_current_user)):
    try:
        a = agent_registry.get_agent(agent_id)
        return serialize_agent(a)
    except Exception:
        raise HTTPException(status_code=404, detail="Agent not found")

class RunRequest(BaseModel):
    input_data: Optional[dict] = Field(default_factory=dict)

    class Config:
        extra = "allow"

@router.post("/{agent_id}/run")
def run_agent(
    agent_id: str,
    req: RunRequest,
    background_tasks: BackgroundTasks,
    brand: Brand = Depends(get_current_brand),
    current_user: User = Depends(get_current_user)
):
    try:
        agent = agent_registry.get_agent(agent_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    db = SessionLocal()
    try:
        from app.models.all_models import Workspace
        ws = db.query(Workspace).filter(Workspace.id == to_uuid(brand.workspace_id)).first()
        if ws:
            agent_tier = getattr(agent, "tier", "PRO")
            if agent_tier == "PRO" and getattr(ws, "plan_tier", "FREE") == "FREE":
                raise HTTPException(
                    status_code=402,
                    detail=f"The '{agent.name}' is a Pro feature. Upgrade to StandBharat Pro to unlock all 15 autonomous agents."
                )
            if (ws.used_credits_this_month or 0) >= (ws.monthly_credit_quota or 50000):
                raise HTTPException(
                    status_code=402,
                    detail=f"Monthly AI credit limit reached ({ws.monthly_credit_quota} credits). Upgrade to Pro for 1,000,000 credits."
                )

        merged_input = dict(req.input_data or {})
        for k, v in req.model_dump().items():
            if k != "input_data" and v is not None and k not in merged_input:
                merged_input[k] = v

        task = AgentTask(
            workspace_id=to_uuid(brand.workspace_id),
            brand_id=to_uuid(brand.id),
            agent_type=agent.agent_id,
            task_type="manual_run",
            input_data=merged_input,
            created_by=to_uuid(current_user.id)
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        
        run = AgentRun(
            workspace_id=to_uuid(brand.workspace_id),
            brand_id=to_uuid(brand.id),
            agent_id=agent.agent_id,
            input_context=req.input_data
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        
        # Execute run asynchronously in background task, with celery fallback
        try:
            background_tasks.add_task(_execute_agent_run, str(run.id))
        except Exception:
            execute_generic_agent.delay(str(run.id))
        
        return {"task_id": str(task.id), "run_id": str(run.id)}
    finally:
        db.close()


class AgentConfigPayload(BaseModel):
    schedule: Optional[str] = "AUTONOMOUS"
    tone: Optional[str] = "BRAND_BRAIN"
    require_approval: Optional[bool] = True
    custom_directives: Optional[str] = ""
    target_channels: Optional[List[str]] = Field(default_factory=lambda: ["Brand Brain Knowledge Base", "Approvals Queue"])
    notification_email: Optional[bool] = True


@router.get("/{agent_id}/config")
def get_agent_config(
    agent_id: str,
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    try:
        agent_registry.get_agent(agent_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    default_config = {
        "schedule": "AUTONOMOUS",
        "tone": "BRAND_BRAIN",
        "require_approval": True,
        "custom_directives": "",
        "target_channels": ["Brand Brain Knowledge Base", "Approvals Queue"],
        "notification_email": True,
    }
    
    db = SessionLocal()
    try:
        ws_id = request.headers.get("X-Workspace-ID")
        if not ws_id and current_user:
            from app.models.all_models import WorkspaceMember
            mem = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == to_uuid(current_user.id)).first()
            if mem:
                ws_id = str(mem.workspace_id)
        if not ws_id:
            from app.models.all_models import Workspace
            ws = db.query(Workspace).first()
            if ws:
                ws_id = str(ws.id)
                
        if ws_id:
            integ = db.query(Integration).filter(
                Integration.workspace_id == to_uuid(ws_id),
                Integration.provider == f"agent_config:{agent_id}"
            ).first()
            if integ and integ.config:
                return {**default_config, **integ.config}
        return default_config
    except Exception:
        return default_config
    finally:
        db.close()


@router.post("/{agent_id}/config")
@router.patch("/{agent_id}/config")
@router.put("/{agent_id}/config")
def save_agent_config(
    agent_id: str,
    payload: AgentConfigPayload,
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    try:
        agent_registry.get_agent(agent_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    db = SessionLocal()
    try:
        from app.models.all_models import WorkspaceMember, Workspace, Brand
        ws_id = request.headers.get("X-Workspace-ID")
        if not ws_id and current_user:
            mem = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == to_uuid(current_user.id)).first()
            if mem:
                ws_id = str(mem.workspace_id)
        if not ws_id:
            ws = db.query(Workspace).first()
            if ws:
                ws_id = str(ws.id)
                
        brand_id = request.headers.get("X-Brand-ID")
        if not brand_id and ws_id:
            br = db.query(Brand).filter(Brand.workspace_id == to_uuid(ws_id)).first()
            if br:
                brand_id = str(br.id)
                
        config_data = payload.dict()
        if ws_id:
            provider_key = f"agent_config:{agent_id}"
            integ = db.query(Integration).filter(
                Integration.workspace_id == to_uuid(ws_id),
                Integration.provider == provider_key
            ).first()
            if not integ:
                integ = Integration(
                    workspace_id=to_uuid(ws_id),
                    brand_id=to_uuid(brand_id) if brand_id else None,
                    provider=provider_key,
                    status="CONFIGURED",
                    config=config_data
                )
                db.add(integ)
            else:
                integ.config = config_data
                integ.status = "CONFIGURED"
            db.commit()
            
        return {"success": True, "agent_id": agent_id, "config": config_data}
    finally:
        db.close()


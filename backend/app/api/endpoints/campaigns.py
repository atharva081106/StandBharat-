from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Any
import uuid

from app.api.deps import get_db, get_current_brand
from app.models.all_models import Brand, Campaign
from pydantic import ConfigDict, BaseModel

router = APIRouter()

class CampaignResponse(BaseModel):
    id: str
    workspace_id: str
    brand_id: str
    name: str
    description: str | None
    status: str
    budget: float | None
    spent: float | None
    start_date: str | None
    end_date: str | None
    
    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=List[CampaignResponse])
@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(
    brand: Brand = Depends(get_current_brand),
    db: Session = Depends(get_db)
):
    campaigns = db.query(Campaign).filter(Campaign.brand_id == brand.id).all()
    return [{
        "id": str(c.id),
        "workspace_id": str(c.workspace_id),
        "brand_id": str(c.brand_id),
        "name": c.name,
        "description": c.description,
        "status": c.status,
        "budget": c.budget,
        "spent": c.spent,
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None
    } for c in campaigns]

@router.post("")
@router.post("/", response_model=CampaignResponse)
def create_campaign(
    payload: dict = Body(...),
    brand: Brand = Depends(get_current_brand),
    db: Session = Depends(get_db)
):
    raw_budget = payload.get("budget")
    try:
        budget_val = float(raw_budget) if raw_budget is not None else None
    except (ValueError, TypeError):
        budget_val = None

    c = Campaign(
        workspace_id=brand.workspace_id,
        brand_id=brand.id,
        name=payload.get("name", "New Campaign"),
        description=payload.get("description"),
        budget=budget_val,
        status=payload.get("status", "ACTIVE")
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {
        "id": str(c.id),
        "workspace_id": str(c.workspace_id),
        "brand_id": str(c.brand_id),
        "name": c.name,
        "description": c.description,
        "status": c.status,
        "budget": c.budget,
        "spent": c.spent,
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None
    }

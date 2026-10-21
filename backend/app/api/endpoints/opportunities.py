from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.opportunity import OpportunityCreate, OpportunityUpdate, OpportunityResponse
from app.models.all_models import Opportunity, Brand
import uuid

router = APIRouter()

@router.get("", response_model=list[OpportunityResponse])
@router.get("/", response_model=list[OpportunityResponse])
def get_opportunities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    brand: Brand = Depends(deps.get_current_brand)
):
    ws_id = deps.to_uuid(brand.workspace_id)
    b_id = deps.to_uuid(brand.id)
    opportunities = db.query(Opportunity).filter(
        Opportunity.workspace_id == ws_id,
        Opportunity.brand_id == b_id
    ).order_by(Opportunity.priority.desc(), Opportunity.created_at.desc()).offset(skip).limit(limit).all()
    return opportunities

@router.get("/{id}", response_model=OpportunityResponse)
def get_opportunity(
    id: str,
    db: Session = Depends(deps.get_db),
    brand: Brand = Depends(deps.get_current_brand)
):
    opp_uuid = deps.to_uuid(id)
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opp_uuid,
        Opportunity.workspace_id == deps.to_uuid(brand.workspace_id),
        Opportunity.brand_id == deps.to_uuid(brand.id)
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opportunity

@router.post("", response_model=OpportunityResponse)
@router.post("/", response_model=OpportunityResponse)
def create_opportunity(
    opportunity_in: OpportunityCreate,
    db: Session = Depends(deps.get_db),
    brand: Brand = Depends(deps.get_current_brand)
):
    data = opportunity_in.model_dump()
    if data.get("confidence") is not None:
        data["confidence"] = str(data["confidence"])
    clean_data = {k: v for k, v in data.items() if hasattr(Opportunity, k)}
    opportunity = Opportunity(
        **clean_data,
        workspace_id=deps.to_uuid(brand.workspace_id),
        brand_id=deps.to_uuid(brand.id)
    )
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity

@router.patch("/{id}", response_model=OpportunityResponse)
def update_opportunity(
    id: str,
    opportunity_in: OpportunityUpdate,
    db: Session = Depends(deps.get_db),
    brand: Brand = Depends(deps.get_current_brand)
):
    opp_uuid = deps.to_uuid(id)
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opp_uuid,
        Opportunity.workspace_id == deps.to_uuid(brand.workspace_id),
        Opportunity.brand_id == deps.to_uuid(brand.id)
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    update_data = opportunity_in.model_dump(exclude_unset=True)
    if "confidence" in update_data and update_data["confidence"] is not None:
        update_data["confidence"] = str(update_data["confidence"])
    for field, value in update_data.items():
        if hasattr(opportunity, field):
            setattr(opportunity, field, value)
        
    db.commit()
    db.refresh(opportunity)
    return opportunity

@router.delete("/{id}")
def delete_opportunity(
    id: str,
    db: Session = Depends(deps.get_db),
    brand: Brand = Depends(deps.get_current_brand)
):
    opp_uuid = deps.to_uuid(id)
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opp_uuid,
        Opportunity.workspace_id == deps.to_uuid(brand.workspace_id),
        Opportunity.brand_id == deps.to_uuid(brand.id)
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    db.delete(opportunity)
    db.commit()
    return {"message": "Opportunity deleted"}

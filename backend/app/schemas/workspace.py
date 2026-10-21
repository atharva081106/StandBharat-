from pydantic import ConfigDict, BaseModel
import uuid
from typing import Optional

class WorkspaceCreate(BaseModel):
    name: str

class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    owner_id: uuid.UUID
    plan_tier: Optional[str] = "FREE"
    monthly_credit_quota: Optional[int] = 50000
    used_credits_this_month: Optional[int] = 0
    subscription_status: Optional[str] = "active"

    model_config = ConfigDict(from_attributes=True)

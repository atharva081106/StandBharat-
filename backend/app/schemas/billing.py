from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CheckoutRequest(BaseModel):
    plan_tier: str = Field(..., description="Plan tier: FREE, PRO, or ENTERPRISE")
    billing_cycle: str = Field("MONTHLY", description="Billing cycle: MONTHLY or ANNUAL")
    provider: str = Field("mock", description="Payment provider: stripe, razorpay, or mock")
    instant_activate: bool = Field(True, description="Instantly activate in simulated or test mode")

class CancelSubscriptionRequest(BaseModel):
    immediate: bool = Field(False, description="Whether to cancel immediately or at period end")

class SubscriptionStatus(BaseModel):
    id: Optional[str] = None
    status: str
    billing_cycle: str
    amount: float
    currency: str
    current_period_start: Optional[str] = None
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool
    provider: str

class CreditUsage(BaseModel):
    monthly_quota: int
    used_credits: int
    remaining_credits: int
    percent_used: int

class TransactionItem(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    plan_tier: str
    billing_cycle: str
    provider: str
    provider_payment_id: Optional[str] = None
    created_at: Optional[str] = None

class InvoiceItem(BaseModel):
    id: str
    invoice_number: str
    amount_paid: float
    currency: str
    status: str
    description: str
    created_at: Optional[str] = None

class BillingOverviewResponse(BaseModel):
    workspace_id: str
    plan_tier: str
    plan_name: str
    subscription: SubscriptionStatus
    credits: CreditUsage
    features: List[str]
    transactions: List[TransactionItem]
    invoices: List[InvoiceItem]

class PricingPlanDetail(BaseModel):
    name: str
    monthly_price: float
    annual_price: float
    currency: str
    monthly_credit_quota: int
    unlocked_agents: int
    features: List[str]

class PricingCatalogResponse(BaseModel):
    plans: Dict[str, PricingPlanDetail]
    currency: str
    supported_providers: List[str]
    mock_mode: bool

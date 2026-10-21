import uuid
import json
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
from sqlalchemy.orm import Session

from app.api import deps
from app.billing.service import BillingService
from app.schemas.billing import (
    CheckoutRequest,
    CancelSubscriptionRequest,
    BillingOverviewResponse,
    PricingCatalogResponse,
    InvoiceItem,
)
from app.models.all_models import User, Invoice, Workspace
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/plans", response_model=PricingCatalogResponse)
def get_plans(db: Session = Depends(deps.get_db)):
    """Public/Authenticated endpoint to fetch all available pricing plans and features."""
    service = BillingService(db)
    return service.get_pricing_catalog()


@router.get("/overview", response_model=BillingOverviewResponse)
def get_billing_overview(
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.get_current_workspace),
    current_user: User = Depends(deps.get_current_user),
):
    """Fetches comprehensive billing overview for the active workspace."""
    workspace = context["workspace"]
    service = BillingService(db)
    try:
        return service.get_billing_overview(workspace.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/checkout")
def create_checkout(
    checkout_in: CheckoutRequest,
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.require_role(["OWNER", "ADMIN"])),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Creates a checkout session or immediately upgrades workspace in simulated/test mode.
    Requires workspace OWNER or ADMIN role.
    """
    workspace = context["workspace"]
    service = BillingService(db)
    try:
        result = service.create_checkout_session(
            workspace_id=workspace.id,
            user_id=current_user.id,
            plan_tier=checkout_in.plan_tier,
            billing_cycle=checkout_in.billing_cycle,
            provider=checkout_in.provider,
            instant_activate=checkout_in.instant_activate,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Billing checkout error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Checkout processing error")


@router.post("/cancel")
def cancel_subscription(
    cancel_in: CancelSubscriptionRequest,
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.require_role(["OWNER", "ADMIN"])),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Cancels an active subscription (either at period end or immediately).
    Requires workspace OWNER or ADMIN role.
    """
    workspace = context["workspace"]
    service = BillingService(db)
    try:
        return service.cancel_subscription(workspace.id, immediate=cancel_in.immediate)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/invoices", response_model=List[InvoiceItem])
def list_invoices(
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.get_current_workspace),
):
    """Lists past invoices for the active workspace."""
    workspace = context["workspace"]
    invoices = (
        db.query(Invoice)
        .filter(Invoice.workspace_id == workspace.id)
        .order_by(Invoice.created_at.desc())
        .all()
    )
    return [
        InvoiceItem(
            id=str(inv.id),
            invoice_number=inv.invoice_number,
            amount_paid=inv.amount_paid,
            currency=inv.currency,
            status=inv.status,
            description=inv.description,
            created_at=inv.created_at.isoformat() if inv.created_at else None,
        )
        for inv in invoices
    ]


@router.get("/invoices/{invoice_id}/receipt")
def get_invoice_receipt(
    invoice_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    context: dict = Depends(deps.get_current_workspace),
):
    """Fetches printable receipt details for a specific invoice."""
    workspace = context["workspace"]
    inv = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.workspace_id == workspace.id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    return {
        "invoice_number": inv.invoice_number,
        "workspace_name": workspace.name,
        "amount_paid": inv.amount_paid,
        "currency": inv.currency,
        "status": inv.status,
        "description": inv.description,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "period_start": inv.period_start.isoformat() if inv.period_start else None,
        "period_end": inv.period_end.isoformat() if inv.period_end else None,
        "payment_method": "Credit Card / NetBanking",
        "merchant": "StandBharat Autonomous AI Marketing Pvt Ltd",
        "tax_identifier": "GSTIN27AABCS1429B1Z",
    }


@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: Session = Depends(deps.get_db),
    x_signature: str = Header(None, alias="X-Signature"),
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
):
    """
    Webhook handler for Stripe / Razorpay / external payment providers.
    Verifies HMAC signatures and automatically reconciles workspace subscription state.
    """
    payload_bytes = await request.body()
    signature = x_signature or stripe_signature or razorpay_signature

    webhook_secret = getattr(settings, "PAYMENT_WEBHOOK_SECRET", None) or "standbharat_webhook_secret_dev"

    if webhook_secret and signature:
        if not BillingService.verify_webhook_signature(payload_bytes, signature, webhook_secret):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    try:
        event = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("type") or event.get("event")
    data = event.get("data", {}).get("object", {}) or event.get("payload", {}).get("payment", {}).get("entity", {})

    logger.info(f"Received billing webhook event: {event_type}")

    if event_type in ["checkout.session.completed", "payment.captured", "invoice.payment_succeeded"]:
        metadata = data.get("metadata", {})
        workspace_id_str = metadata.get("workspace_id")
        user_id_str = metadata.get("user_id")
        plan_tier = metadata.get("plan_tier", "PRO")
        billing_cycle = metadata.get("billing_cycle", "MONTHLY")
        amount = float(data.get("amount", 499900)) / 100.0  # normalize cents/paise
        provider_id = data.get("id", f"pay_{uuid.uuid4().hex[:8]}")

        if workspace_id_str and user_id_str:
            service = BillingService(db)
            try:
                service.process_successful_payment(
                    workspace_id=uuid.UUID(workspace_id_str),
                    user_id=uuid.UUID(user_id_str),
                    plan_tier=plan_tier,
                    billing_cycle=billing_cycle,
                    amount=amount,
                    provider="stripe" if stripe_signature else "razorpay",
                    provider_payment_id=provider_id,
                    provider_order_id=data.get("order_id", f"ord_{uuid.uuid4().hex[:8]}"),
                )
            except Exception as e:
                logger.error(f"Error provisioning webhook payment: {e}", exc_info=True)
                raise HTTPException(status_code=500, detail=str(e))

    return {"status": "received", "event": event_type}

import uuid
import datetime
import hmac
import hashlib
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.all_models import Workspace, User, Subscription, PaymentTransaction, Invoice
from app.core.config import settings

logger = logging.getLogger(__name__)

# Plan definition matrix
PRICING_PLANS = {
    "FREE": {
        "name": "Starter",
        "monthly_price": 0.0,
        "annual_price": 0.0,
        "currency": "INR",
        "monthly_credit_quota": 50000,
        "unlocked_agents": 3,
        "features": [
            "3 Basic Marketing Agents",
            "50,000 AI Token Credits / mo",
            "Single Brand Brain Sandbox",
            "Community Support"
        ]
    },
    "PRO": {
        "name": "Pro Marketer",
        "monthly_price": 4999.0,
        "annual_price": 47990.0,  # 20% savings
        "currency": "INR",
        "monthly_credit_quota": 1000000,
        "unlocked_agents": 15,
        "features": [
            "All 15 Autonomous Specialized Agents",
            "1,000,000 AI Token Credits / mo",
            "WhatsApp Business & Indic Tone Integration",
            "Multi-Touch Revenue Attribution Funnel (INR)",
            "Multi-Channel Social Auto-Publishing",
            "Competitive Intelligence Radar (Indian & Global)",
            "GST Invoices with 18% Input Tax Credit",
            "Priority Support"
        ]
    },
    "ENTERPRISE": {
        "name": "Enterprise CMO",
        "monthly_price": 19999.0,
        "annual_price": 191990.0,  # 20% savings
        "currency": "INR",
        "monthly_credit_quota": 10000000,
        "unlocked_agents": 15,
        "features": [
            "Unlimited Autonomous Agent Concurrency",
            "10,000,000 AI Token Credits / mo",
            "Custom LLM Gateway & Dedicated Key Isolation",
            "Cross-Tenant Team Role Management (RBAC)",
            "Dedicated Account Strategist & SLA"
        ]
    }
}


class BillingService:
    def __init__(self, db: Session):
        self.db = db

    def get_pricing_catalog(self) -> Dict[str, Any]:
        """Returns the public and authenticated pricing plan catalog."""
        return {
            "plans": PRICING_PLANS,
            "currency": "INR",
            "supported_providers": ["stripe", "razorpay", "mock"],
            "mock_mode": not bool(getattr(settings, "STRIPE_SECRET_KEY", None))
        }

    def get_billing_overview(self, workspace_id: uuid.UUID) -> Dict[str, Any]:
        """Returns comprehensive billing status, active subscription, credit usage, and invoices."""
        ws = self.db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not ws:
            raise ValueError(f"Workspace {workspace_id} not found")

        sub = self.db.query(Subscription).filter(Subscription.workspace_id == workspace_id).first()
        plan_tier = ws.plan_tier or "FREE"
        plan_meta = PRICING_PLANS.get(plan_tier, PRICING_PLANS["FREE"])

        # Fetch recent transactions
        transactions = (
            self.db.query(PaymentTransaction)
            .filter(PaymentTransaction.workspace_id == workspace_id)
            .order_by(PaymentTransaction.created_at.desc())
            .limit(10)
            .all()
        )

        # Fetch recent invoices
        invoices = (
            self.db.query(Invoice)
            .filter(Invoice.workspace_id == workspace_id)
            .order_by(Invoice.created_at.desc())
            .limit(10)
            .all()
        )

        quota = ws.monthly_credit_quota or plan_meta["monthly_credit_quota"]
        used = ws.used_credits_this_month or 0
        remaining = max(0, quota - used)
        percent_used = min(100, round((used / quota) * 100)) if quota > 0 else 0

        return {
            "workspace_id": str(ws.id),
            "plan_tier": plan_tier,
            "plan_name": plan_meta["name"],
            "subscription": {
                "id": str(sub.id) if sub else None,
                "status": sub.status if sub else "ACTIVE",
                "billing_cycle": sub.billing_cycle if sub else "MONTHLY",
                "amount": sub.amount if sub else 0.0,
                "currency": sub.currency if sub else "INR",
                "current_period_start": sub.current_period_start.isoformat() if sub and sub.current_period_start else None,
                "current_period_end": sub.current_period_end.isoformat() if sub and sub.current_period_end else None,
                "cancel_at_period_end": sub.cancel_at_period_end if sub else False,
                "provider": sub.provider if sub else "mock",
            },
            "credits": {
                "monthly_quota": quota,
                "used_credits": used,
                "remaining_credits": remaining,
                "percent_used": percent_used,
            },
            "features": plan_meta["features"],
            "transactions": [
                {
                    "id": str(t.id),
                    "amount": t.amount,
                    "currency": t.currency,
                    "status": t.status,
                    "plan_tier": t.plan_tier,
                    "billing_cycle": t.billing_cycle,
                    "provider": t.provider,
                    "provider_payment_id": t.provider_payment_id,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
                for t in transactions
            ],
            "invoices": [
                {
                    "id": str(inv.id),
                    "invoice_number": inv.invoice_number,
                    "amount_paid": inv.amount_paid,
                    "currency": inv.currency,
                    "status": inv.status,
                    "description": inv.description,
                    "created_at": inv.created_at.isoformat() if inv.created_at else None,
                }
                for inv in invoices
            ]
        }

    def create_checkout_session(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        plan_tier: str,
        billing_cycle: str = "MONTHLY",
        provider: str = "mock",
        instant_activate: bool = True
    ) -> Dict[str, Any]:
        """Creates a checkout session or immediately activates plan in test/mock mode."""
        plan_tier = plan_tier.upper()
        if plan_tier not in ["PRO", "ENTERPRISE", "FREE"]:
            raise ValueError(f"Invalid plan tier '{plan_tier}'. Available: FREE, PRO, ENTERPRISE")

        billing_cycle = billing_cycle.upper()
        if billing_cycle not in ["MONTHLY", "ANNUAL"]:
            billing_cycle = "MONTHLY"

        plan_meta = PRICING_PLANS.get(plan_tier, PRICING_PLANS["FREE"])
        price = plan_meta["annual_price"] if billing_cycle == "ANNUAL" else plan_meta["monthly_price"]
        order_id = f"ord_{uuid.uuid4().hex[:12]}"
        payment_id = f"pay_{uuid.uuid4().hex[:12]}"

        # Record pending transaction
        transaction = PaymentTransaction(
            workspace_id=workspace_id,
            user_id=user_id,
            amount=price,
            currency="INR",
            status="PENDING",
            plan_tier=plan_tier,
            billing_cycle=billing_cycle,
            provider=provider,
            provider_order_id=order_id,
            provider_payment_id=payment_id
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)

        if instant_activate or provider == "mock":
            # Instantly complete mock payment and provision workspace
            return self.process_successful_payment(
                workspace_id=workspace_id,
                user_id=user_id,
                plan_tier=plan_tier,
                billing_cycle=billing_cycle,
                amount=price,
                provider=provider,
                provider_payment_id=payment_id,
                provider_order_id=order_id,
                transaction_id=transaction.id
            )

        # In production with Stripe keys
        checkout_url = f"/app/settings/billing?session_id={order_id}"
        return {
            "status": "CHECKOUT_CREATED",
            "order_id": order_id,
            "checkout_url": checkout_url,
            "amount": price,
            "currency": "INR",
            "plan_tier": plan_tier,
            "billing_cycle": billing_cycle
        }

    def process_successful_payment(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        plan_tier: str,
        billing_cycle: str,
        amount: float,
        provider: str,
        provider_payment_id: str,
        provider_order_id: str,
        transaction_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Provisions subscription, upgrades workspace quota, records invoice, and marks transaction success."""
        ws = self.db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not ws:
            raise ValueError(f"Workspace {workspace_id} not found")

        plan_tier = plan_tier.upper()
        plan_meta = PRICING_PLANS.get(plan_tier, PRICING_PLANS["FREE"])

        # 1. Upgrade workspace
        ws.plan_tier = plan_tier
        ws.monthly_credit_quota = plan_meta["monthly_credit_quota"]
        ws.subscription_status = "ACTIVE"
        ws.quota_reset_at = datetime.datetime.utcnow()

        # 2. Update or create transaction
        if transaction_id:
            tx = self.db.query(PaymentTransaction).filter(PaymentTransaction.id == transaction_id).first()
            if tx:
                tx.status = "SUCCESS"
                tx.provider_payment_id = provider_payment_id
        else:
            tx = PaymentTransaction(
                workspace_id=workspace_id,
                user_id=user_id,
                amount=amount,
                currency="INR",
                status="SUCCESS",
                plan_tier=plan_tier,
                billing_cycle=billing_cycle,
                provider=provider,
                provider_order_id=provider_order_id,
                provider_payment_id=provider_payment_id
            )
            self.db.add(tx)

        # 3. Calculate period end
        now = datetime.datetime.utcnow()
        days = 365 if billing_cycle == "ANNUAL" else 30
        period_end = now + datetime.timedelta(days=days)

        # 4. Upsert subscription
        sub = self.db.query(Subscription).filter(Subscription.workspace_id == workspace_id).first()
        if not sub:
            sub = Subscription(
                workspace_id=workspace_id,
                plan_tier=plan_tier,
                status="ACTIVE",
                billing_cycle=billing_cycle,
                amount=amount,
                currency="INR",
                current_period_start=now,
                current_period_end=period_end,
                cancel_at_period_end=False,
                provider=provider,
                provider_subscription_id=f"sub_{uuid.uuid4().hex[:12]}",
                provider_customer_id=f"cus_{uuid.uuid4().hex[:12]}"
            )
            self.db.add(sub)
        else:
            sub.plan_tier = plan_tier
            sub.status = "ACTIVE"
            sub.billing_cycle = billing_cycle
            sub.amount = amount
            sub.current_period_start = now
            sub.current_period_end = period_end
            sub.cancel_at_period_end = False
            sub.provider = provider

        # 5. Generate Tax Invoice
        inv_number = f"INV-{now.strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        invoice = Invoice(
            workspace_id=workspace_id,
            invoice_number=inv_number,
            amount_paid=amount,
            currency="INR",
            status="PAID",
            description=f"StandBharat {plan_meta['name']} Subscription ({billing_cycle.title()})",
            period_start=now,
            period_end=period_end
        )
        self.db.add(invoice)

        self.db.commit()
        self.db.refresh(ws)

        logger.info(
            f"Successfully provisioned {plan_tier} ({billing_cycle}) for workspace {workspace_id}. "
            f"Quota set to {ws.monthly_credit_quota:,} credits."
        )

        return {
            "status": "SUCCESS",
            "message": f"Successfully activated {plan_meta['name']} plan! All 15 autonomous agents and {ws.monthly_credit_quota:,} compute credits are now active.",
            "workspace_id": str(ws.id),
            "plan_tier": ws.plan_tier,
            "monthly_credit_quota": ws.monthly_credit_quota,
            "invoice_number": inv_number,
            "amount_paid": amount,
            "billing_cycle": billing_cycle,
            "current_period_end": period_end.isoformat()
        }

    def cancel_subscription(self, workspace_id: uuid.UUID, immediate: bool = False) -> Dict[str, Any]:
        """Cancels an active subscription either at the end of the current period or immediately."""
        ws = self.db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if not ws:
            raise ValueError(f"Workspace {workspace_id} not found")

        sub = self.db.query(Subscription).filter(Subscription.workspace_id == workspace_id).first()
        if not sub:
            raise ValueError("No active subscription found to cancel.")

        if immediate:
            sub.status = "CANCELED"
            ws.plan_tier = "FREE"
            ws.monthly_credit_quota = 50000
            ws.subscription_status = "CANCELED"
            self.db.commit()
            return {
                "status": "CANCELED_IMMEDIATELY",
                "message": "Subscription cancelled immediately. Workspace reverted to Free tier."
            }
        else:
            sub.cancel_at_period_end = True
            self.db.commit()
            period_end_str = sub.current_period_end.strftime("%B %d, %Y") if sub.current_period_end else "the current billing period"
            return {
                "status": "CANCEL_SCHEDULED",
                "message": f"Subscription will remain active until {period_end_str}, after which it will not renew."
            }

    @staticmethod
    def verify_webhook_signature(payload_bytes: bytes, signature_header: str, secret: str) -> bool:
        """Cryptographically verifies HMAC-SHA256 signature for incoming payment webhooks."""
        if not signature_header or not secret:
            return False
        computed = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
        return hmac.compare_digest(computed, signature_header)

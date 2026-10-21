import uuid
import hmac
import hashlib
import json
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.all_models import User, Workspace, WorkspaceMember, UserRole, Subscription, PaymentTransaction, Invoice
from app.core.security import create_access_token
from app.billing.service import BillingService, PRICING_PLANS


@pytest.fixture
def auth_headers(db: Session):
    # Create test user
    user = User(
        id=uuid.uuid4(),
        email=f"billing_user_{uuid.uuid4().hex[:6]}@example.com",
        name="Billing Test User",
        hashed_password="fakehashpassword"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create test workspace
    workspace = Workspace(
        id=uuid.uuid4(),
        name="Billing Test Workspace",
        slug=f"billing-ws-{uuid.uuid4().hex[:6]}",
        owner_id=user.id,
        plan_tier="FREE",
        monthly_credit_quota=50000,
        used_credits_this_month=1200
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    # Add member
    member = WorkspaceMember(
        id=uuid.uuid4(),
        user_id=user.id,
        workspace_id=workspace.id,
        role=UserRole.OWNER
    )
    db.add(member)
    db.commit()

    token = create_access_token(user.id)
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Workspace-ID": str(workspace.id)
    }
    return {
        "headers": headers,
        "user": user,
        "workspace": workspace
    }


def test_get_pricing_catalog(client: TestClient):
    """Test getting public pricing catalog."""
    response = client.get("/api/billing/plans")
    assert response.status_code == 200
    data = response.json()
    assert "plans" in data
    assert "FREE" in data["plans"]
    assert "PRO" in data["plans"]
    assert "ENTERPRISE" in data["plans"]
    assert data["plans"]["PRO"]["monthly_price"] == 4999.0
    assert data["plans"]["PRO"]["monthly_credit_quota"] == 1000000
    assert data["plans"]["ENTERPRISE"]["unlocked_agents"] == 15


def test_get_billing_overview(client: TestClient, auth_headers: dict):
    """Test fetching overview for authenticated workspace."""
    headers = auth_headers["headers"]
    response = client.get("/api/billing/overview", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["plan_tier"] == "FREE"
    assert data["credits"]["monthly_quota"] == 50000
    assert data["credits"]["used_credits"] == 1200
    assert data["credits"]["remaining_credits"] == 48800
    assert "subscription" in data
    assert "transactions" in data
    assert "invoices" in data


def test_checkout_and_upgrade_to_pro(client: TestClient, auth_headers: dict, db: Session):
    """Test upgrading workspace to PRO plan with instant mock checkout."""
    headers = auth_headers["headers"]
    ws_id = auth_headers["workspace"].id

    payload = {
        "plan_tier": "PRO",
        "billing_cycle": "MONTHLY",
        "provider": "mock",
        "instant_activate": True
    }
    response = client.post("/api/billing/checkout", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["plan_tier"] == "PRO"
    assert data["monthly_credit_quota"] == 1000000
    assert "invoice_number" in data

    # Verify database state
    db.expire_all()
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    assert ws.plan_tier == "PRO"
    assert ws.monthly_credit_quota == 1000000
    assert ws.subscription_status == "ACTIVE"

    # Verify subscription record
    sub = db.query(Subscription).filter(Subscription.workspace_id == ws_id).first()
    assert sub is not None
    assert sub.status == "ACTIVE"
    assert sub.plan_tier == "PRO"
    assert sub.amount == 4999.0

    # Verify invoice record
    invoices = db.query(Invoice).filter(Invoice.workspace_id == ws_id).all()
    assert len(invoices) >= 1
    assert invoices[0].amount_paid == 4999.0
    assert invoices[0].status == "PAID"


def test_invoices_and_receipt(client: TestClient, auth_headers: dict):
    """Test invoice listing and individual receipt generation."""
    headers = auth_headers["headers"]

    # First perform upgrade to generate invoice
    client.post("/api/billing/checkout", json={"plan_tier": "PRO", "billing_cycle": "MONTHLY"}, headers=headers)

    # Fetch invoices
    response = client.get("/api/billing/invoices", headers=headers)
    assert response.status_code == 200
    invoices = response.json()
    assert len(invoices) > 0
    inv_id = invoices[0]["id"]

    # Fetch receipt
    receipt_resp = client.get(f"/api/billing/invoices/{inv_id}/receipt", headers=headers)
    assert receipt_resp.status_code == 200
    receipt = receipt_resp.json()
    assert receipt["invoice_number"] == invoices[0]["invoice_number"]
    assert "GSTIN" in receipt["tax_identifier"]
    assert receipt["amount_paid"] == 4999.0


def test_cancel_subscription(client: TestClient, auth_headers: dict, db: Session):
    """Test cancelling subscription."""
    headers = auth_headers["headers"]
    ws_id = auth_headers["workspace"].id

    # Upgrade to PRO first
    client.post("/api/billing/checkout", json={"plan_tier": "PRO", "billing_cycle": "MONTHLY"}, headers=headers)

    # Cancel at period end
    resp = client.post("/api/billing/cancel", json={"immediate": False}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "CANCEL_SCHEDULED"

    sub = db.query(Subscription).filter(Subscription.workspace_id == ws_id).first()
    assert sub.cancel_at_period_end is True

    # Immediate cancel
    resp_imm = client.post("/api/billing/cancel", json={"immediate": True}, headers=headers)
    assert resp_imm.status_code == 200
    assert resp_imm.json()["status"] == "CANCELED_IMMEDIATELY"

    db.expire_all()
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    assert ws.plan_tier == "FREE"
    assert ws.monthly_credit_quota == 50000


def test_webhook_signature_verification():
    """Test HMAC SHA256 webhook signature validation."""
    payload = b'{"type":"checkout.session.completed","data":{"id":"cs_123"}}'
    secret = "test_webhook_secret_key"
    sig = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()

    assert BillingService.verify_webhook_signature(payload, sig, secret) is True
    assert BillingService.verify_webhook_signature(payload, "invalid_sig", secret) is False
    assert BillingService.verify_webhook_signature(payload, "", secret) is False


def test_webhook_payment_success(client: TestClient, auth_headers: dict, db: Session):
    """Test incoming webhook provisioning subscription."""
    ws = auth_headers["workspace"]
    user = auth_headers["user"]

    secret = "standbharat_webhook_secret_dev"
    event_payload = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "pay_stripe_123456",
                "amount": 499900,
                "metadata": {
                    "workspace_id": str(ws.id),
                    "user_id": str(user.id),
                    "plan_tier": "PRO",
                    "billing_cycle": "MONTHLY"
                }
            }
        }
    }
    payload_bytes = json.dumps(event_payload).encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()

    resp = client.post(
        "/api/billing/webhook",
        content=payload_bytes,
        headers={"Content-Type": "application/json", "X-Signature": signature}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "received"

    # Verify workspace upgraded to PRO
    db.refresh(ws)
    assert ws.plan_tier == "PRO"
    assert ws.monthly_credit_quota == 1000000

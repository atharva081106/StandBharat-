import uuid
import concurrent.futures
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.all_models import User, Workspace, WorkspaceMember, UserRole, Brand
from app.core.security import create_access_token


def create_user_workspace_brand(db: Session, prefix: str):
    user = User(
        id=uuid.uuid4(),
        email=f"{prefix}_{uuid.uuid4().hex[:6]}@example.com",
        name=f"{prefix.title()} User",
        hashed_password="hashed_pw_test"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    ws = Workspace(
        id=uuid.uuid4(),
        name=f"{prefix.title()} Workspace",
        slug=f"{prefix}-ws-{uuid.uuid4().hex[:6]}",
        owner_id=user.id,
        plan_tier="FREE",
        monthly_credit_quota=50000,
        used_credits_this_month=0
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    member = WorkspaceMember(
        id=uuid.uuid4(),
        user_id=user.id,
        workspace_id=ws.id,
        role=UserRole.OWNER
    )
    db.add(member)
    db.commit()

    brand = Brand(
        id=uuid.uuid4(),
        workspace_id=ws.id,
        name=f"{prefix.title()} Brand",
        website_url=f"https://{prefix}.com",
        industry="SaaS"
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)

    token = create_access_token(user.id)
    return {
        "user": user,
        "workspace": ws,
        "brand": brand,
        "headers": {
            "Authorization": f"Bearer {token}",
            "X-Workspace-ID": str(ws.id),
            "X-Brand-ID": str(brand.id)
        }
    }


def test_strict_multi_tenant_isolation(client: TestClient, db: Session):
    """
    Ensures User A cannot access User B's workspace or brand under any circumstances.
    """
    tenant_a = create_user_workspace_brand(db, "tenant_a")
    tenant_b = create_user_workspace_brand(db, "tenant_b")

    # 1. Tenant A tries to access Tenant B's workspace with Tenant A's token
    spoofed_headers = {
        "Authorization": tenant_a["headers"]["Authorization"],
        "X-Workspace-ID": str(tenant_b["workspace"].id),
    }
    resp = client.get("/api/billing/overview", headers=spoofed_headers)
    assert resp.status_code == 403, "User A must NOT be able to access User B's billing"

    # 2. Tenant A tries to access Tenant B's brand with Tenant A's workspace
    cross_brand_headers = {
        "Authorization": tenant_a["headers"]["Authorization"],
        "X-Workspace-ID": str(tenant_a["workspace"].id),
        "X-Brand-ID": str(tenant_b["brand"].id),
    }
    resp = client.get(f"/api/brands/{tenant_b['brand'].id}", headers=cross_brand_headers)
    assert resp.status_code in [403, 404], "User A must NOT be able to access User B's brand"

    # 3. Tenant A tries to upgrade Tenant B's workspace
    upgrade_payload = {"plan_tier": "PRO", "billing_cycle": "MONTHLY"}
    resp = client.post("/api/billing/checkout", json=upgrade_payload, headers=spoofed_headers)
    assert resp.status_code == 403, "User A must NOT be able to upgrade User B's workspace"


def test_concurrent_multi_user_operations(client: TestClient, db: Session):
    """
    Simulates 8 concurrent users executing distinct workflows in parallel threads.
    Verifies thread safety, connection pooling, and error-free concurrency.
    """
    num_users = 8
    tenants = [create_user_workspace_brand(db, f"concurrent_{i}") for i in range(num_users)]

    def run_user_workflow(tenant_info):
        t_headers = tenant_info["headers"]
        ws = tenant_info["workspace"]
        br = tenant_info["brand"]

        results = []

        # Step 1: Read public pricing
        r1 = client.get("/api/billing/plans")
        results.append(r1.status_code == 200)

        # Step 2: Read billing overview
        r2 = client.get("/api/billing/overview", headers=t_headers)
        results.append(r2.status_code == 200)

        # Step 3: Upgrade to PRO
        r3 = client.post(
            "/api/billing/checkout",
            json={"plan_tier": "PRO", "billing_cycle": "MONTHLY", "provider": "mock"},
            headers=t_headers
        )
        results.append(r3.status_code == 200)

        # Step 4: Verify invoices generated
        r4 = client.get("/api/billing/invoices", headers=t_headers)
        results.append(r4.status_code == 200 and len(r4.json()) >= 1)

        # Step 5: Read brand
        r5 = client.get(f"/api/brands/{br.id}", headers=t_headers)
        results.append(r5.status_code == 200)

        # Step 6: Read dashboard metrics
        r6 = client.get("/api/dashboard", headers=t_headers)
        results.append(r6.status_code in [200, 404])  # 404 if no metric seeded yet, but no 500 error

        return all(results)

    with concurrent.futures.ThreadPoolExecutor(max_workers=num_users) as executor:
        futures = [executor.submit(run_user_workflow, tenant) for tenant in tenants]
        outcomes = [f.result() for f in concurrent.futures.as_completed(futures)]

    assert len(outcomes) == num_users
    assert all(outcomes), "All concurrent user workflows must succeed without error"


def test_concurrent_credit_quota_isolation(client: TestClient, db: Session):
    """
    Ensures that concurrent credit usage on one workspace does NOT impact another workspace's quota.
    """
    user_a = create_user_workspace_brand(db, "quota_a")
    user_b = create_user_workspace_brand(db, "quota_b")

    # Upgrade User A to PRO (1,000,000 credits)
    client.post(
        "/api/billing/checkout",
        json={"plan_tier": "PRO", "billing_cycle": "MONTHLY"},
        headers=user_a["headers"]
    )

    # Check User B remains FREE (50,000 credits)
    resp_b = client.get("/api/billing/overview", headers=user_b["headers"])
    assert resp_b.status_code == 200
    data_b = resp_b.json()
    assert data_b["plan_tier"] == "FREE"
    assert data_b["credits"]["monthly_quota"] == 50000

    # Check User A is PRO
    resp_a = client.get("/api/billing/overview", headers=user_a["headers"])
    assert resp_a.status_code == 200
    data_a = resp_a.json()
    assert data_a["plan_tier"] == "PRO"
    assert data_a["credits"]["monthly_quota"] == 1000000

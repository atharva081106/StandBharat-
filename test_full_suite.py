import json
import sys
import urllib.error
import urllib.parse
import urllib.request

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://127.0.0.1:8000"

ROUTES = [
    "/",
    "/login",
    "/onboarding",
    "/pricing",
    "/app",
    "/app/ai-cmo",
    "/app/agents",
    "/app/agents/writer",
    "/app/agent-log",
    "/app/campaigns",
    "/app/content",
    "/app/approvals",
    "/app/opportunities",
    "/app/brand-brain",
    "/app/competitors",
    "/app/calendar",
    "/app/revenue",
    "/app/analytics",
    "/app/integrations",
    "/app/settings",
]

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    body = None
    if data is not None:
        if isinstance(data, dict):
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body = data
    elif method == "POST":
        body = b""
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as res:
        res_data = res.read().decode("utf-8", errors="ignore")
        return res.status, res_data

def test_frontend_routes():
    print("\n==========================================")
    print(" 1. TESTING FRONTEND ROUTINGS (Next.js)   ")
    print("==========================================")
    results = {}
    for route in ROUTES:
        url = f"{FRONTEND_URL}{route}"
        try:
            status, body = make_request(url, headers={"User-Agent": "Mozilla/5.0"})
            has_error = "Server Error" in body or "Unhandled Runtime Error" in body or "Failed to compile" in body
            if status == 200 and not has_error:
                results[route] = "PASS (200)"
                print(f" [PASS] {route:<25} -> 200 OK")
            else:
                results[route] = f"FAIL (HTTP {status}, error_marker={has_error})"
                print(f" [FAIL] {route:<25} -> {status} (has_error={has_error})")
        except urllib.error.HTTPError as e:
            results[route] = f"FAIL (HTTP {e.code})"
            print(f" [FAIL] {route:<25} -> HTTP {e.code}")
        except Exception as e:
            results[route] = f"ERROR ({str(e)})"
            print(f" [ERR]  {route:<25} -> {str(e)}")
    return results

def test_backend_auth_and_apis():
    print("\n==========================================")
    print(" 2. TESTING BACKEND APIS & AUTHENTICATION ")
    print("==========================================")
    
    # 1. Health checks
    try:
        st, b = make_request(f"{BACKEND_URL}/health")
        print(f" [PASS] GET /health                    -> {st} ({b.strip()})")
        st, b = make_request(f"{BACKEND_URL}/health/db")
        print(f" [PASS] GET /health/db                 -> {st} ({b.strip()})")
    except Exception as e:
        print(f" [FAIL] Health check failed: {e}")

    # 2. Login to obtain JWT
    token = None
    try:
        login_url = f"{BACKEND_URL}/api/auth/login"
        st, b = make_request(login_url, method="POST", data={"email": "demo@standbharat.ai", "password": "demo"})
        login_json = json.loads(b)
        token = login_json.get("access_token")
        print(f" [PASS] POST /api/auth/login           -> {st} (Token obtained: {bool(token)})")
    except Exception as e:
        print(f" [FAIL] Login failed: {e}")
        return False

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    endpoints = [
        ("GET", "/api/auth/me", None),
        ("GET", "/api/workspaces/", None),
        ("GET", "/api/brands/", None),
        ("GET", "/api/brand-brain/", None),
        ("GET", "/api/integrations/", None),
        ("GET", "/api/integrations/instagram/status", None),
        ("GET", "/api/integrations/meta_ads/status", None),
        ("GET", "/api/opportunities/", None),
        ("GET", "/api/dashboard/", None),
        ("GET", "/api/dashboard/website-analytics", None),
        ("GET", "/api/content/drafts", None),
        ("GET", "/api/content/projects", None),
        ("GET", "/api/publications", None),
        ("GET", "/api/approvals/", None),
        ("GET", "/api/campaigns/", None),
        ("GET", "/api/agents/", None),
    ]

    for method, ep, payload in endpoints:
        url = f"{BACKEND_URL}{ep}"
        try:
            st, b = make_request(url, method=method, data=payload, headers=auth_headers)
            summary = b[:60].replace("\n", " ") + "..." if len(b) > 60 else b
            print(f" [PASS] {method} {ep:<30} -> {st} ({summary})")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            print(f" [FAIL] {method} {ep:<30} -> HTTP {e.code} : {err_body[:80]}")
        except Exception as e:
            print(f" [ERR]  {method} {ep:<30} -> {e}")

    print("\n==========================================")
    print(" 3. TESTING DELIVERABLES & SYNC FLOWS     ")
    print("==========================================")

    # 3. Test Connecting Instagram with sandbox credentials
    try:
        st, b = make_request(
            f"{BACKEND_URL}/api/integrations/instagram/connect",
            method="POST",
            data={
                "access_token": "sandbox_instagram_demo_token",
                "instagram_account_id": "17841400000000"
            },
            headers=auth_headers
        )
        print(f" [PASS] POST /api/integrations/instagram/connect -> {st} ({b[:60]})")
    except Exception as e:
        print(f" [FAIL] Instagram connect failed: {e}")

    # 4. Test Connecting Meta Ads with sandbox credentials
    try:
        st, b = make_request(
            f"{BACKEND_URL}/api/integrations/meta_ads/connect",
            method="POST",
            data={
                "access_token": "sandbox_meta_ads_token",
                "ad_account_id": "act_1020304050"
            },
            headers=auth_headers
        )
        print(f" [PASS] POST /api/integrations/meta_ads/connect -> {st} ({b[:60]})")
    except Exception as e:
        print(f" [FAIL] Meta Ads connect failed: {e}")

    # 5. Test Instagram sync
    try:
        st, b = make_request(f"{BACKEND_URL}/api/integrations/instagram/sync", method="POST", headers=auth_headers)
        print(f" [PASS] POST /api/integrations/instagram/sync   -> {st} ({b[:80]})")
    except Exception as e:
        print(f" [FAIL] Instagram sync error: {e}")

    # 6. Test Meta Ads sync
    try:
        st, b = make_request(f"{BACKEND_URL}/api/integrations/meta_ads/sync", method="POST", headers=auth_headers)
        print(f" [PASS] POST /api/integrations/meta_ads/sync    -> {st} ({b[:80]})")
    except Exception as e:
        print(f" [FAIL] Meta Ads sync error: {e}")

    # 7. Test Content Draft Deliverable Creation
    draft_id = None
    project_id = None
    try:
        st, b = make_request(
            f"{BACKEND_URL}/api/content/drafts",
            method="POST",
            data={
                "title": "Autonomous Growth Strategy Q4 Deliverable",
                "content_type": "blog",
                "body": "Comprehensive market penetration strategy focusing on high-ROI channels, AI search optimization, and automated conversion workflows.",
                "status": "DRAFT"
            },
            headers=auth_headers
        )
        created = json.loads(b)
        draft_id = created.get("id")
        project_id = created.get("content_project_id")
        print(f" [PASS] POST /api/content/drafts (Created Deliverable) -> {st} (Draft ID: {draft_id}, Project ID: {project_id})")
    except Exception as e:
        print(f" [FAIL] Content creation error: {e}")

    # 8. Test Submit Content Draft for Approval
    approval_id = None
    if draft_id and project_id:
        try:
            st, b = make_request(
                f"{BACKEND_URL}/api/approvals/projects/{project_id}/submit-review",
                method="POST",
                data={
                    "content_draft_id": draft_id
                },
                headers=auth_headers
            )
            approval_res = json.loads(b)
            approval_id = approval_res.get("id")
            print(f" [PASS] POST /api/approvals/projects/{project_id}/submit-review -> {st} (Approval ID: {approval_id}, Status: {approval_res.get('status')})")
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="ignore")
            print(f" [FAIL] Approval submit HTTP Error -> {e.code} ({err[:80]})")
        except Exception as e:
            print(f" [FAIL] Approval submit error: {e}")

    # 9. Test Approving the Deliverable
    if approval_id:
        try:
            st, b = make_request(
                f"{BACKEND_URL}/api/approvals/{approval_id}/approve",
                method="POST",
                headers=auth_headers
            )
            approve_res = json.loads(b)
            print(f" [PASS] POST /api/approvals/{approval_id}/approve  -> {st} (New Status: {approve_res.get('status')})")
        except Exception as e:
            print(f" [FAIL] Approve error: {e}")

    return True

if __name__ == "__main__":
    fe_results = test_frontend_routes()
    be_results = test_backend_auth_and_apis()
    
    fe_passed = sum(1 for v in fe_results.values() if "PASS" in v)
    print(f"\n==========================================")
    print(f" FINAL SUMMARY: {fe_passed}/{len(fe_results)} FRONTEND ROUTES PASSING")
    print(f"==========================================")

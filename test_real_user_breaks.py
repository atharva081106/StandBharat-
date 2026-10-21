import json
import sys
import urllib.error
import urllib.parse
import urllib.request

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BACKEND_URL = "http://127.0.0.1:8000"

def make_req(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    body = None
    if data is not None:
        if isinstance(data, dict):
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body = data
    elif method == "POST" or method == "PATCH":
        body = b"{}"
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            res_data = res.read().decode("utf-8", errors="ignore")
            return res.status, res_data, None
    except urllib.error.HTTPError as e:
        err_data = e.read().decode("utf-8", errors="ignore")
        return e.code, None, err_data
    except Exception as e:
        return 500, None, str(e)

# 1. Login to get token and brand ID
login_url = f"{BACKEND_URL}/api/auth/login"
st, b, err = make_req(login_url, method="POST", data={"email": "demo@standbharat.ai", "password": "demo"})
token = json.loads(b)["access_token"]

auth_headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/json"
}

# Get brand and workspace
st, b, err = make_req(f"{BACKEND_URL}/api/brands/", headers=auth_headers)
brands = json.loads(b)
brand_id = brands[0]["id"]
ws_id = brands[0]["workspace_id"]
auth_headers["X-Workspace-ID"] = ws_id
auth_headers["X-Brand-ID"] = brand_id

print(f"Logged in: Brand ID = {brand_id}, Workspace ID = {ws_id}\n")

# List of endpoints real users trigger in frontend:
test_cases = [
    # Workflow status & notifications
    ("GET", f"/api/brands/{brand_id}/workflow-status", None),
    ("GET", f"/api/brands/{brand_id}/website-analysis", None),
    ("POST", f"/api/brands/{brand_id}/website-analysis", {}),
    ("GET", "/api/notifications", None),
    ("GET", "/api/notifications/unread-count", None),
    
    # Dashboard stats & command center
    ("GET", "/api/dashboard/command-center", None),
    ("GET", "/api/dashboard/stats", None),
    ("GET", "/api/dashboard/website-analytics", None),
    ("GET", "/api/dashboard/", None),

    # AI CMO & Chat
    ("POST", "/api/ai/cmo/chat", {"message": "Give me top 3 growth strategies for Q4"}),

    # Orchestrator
    ("GET", "/api/orchestrator/status", None),
    ("GET", "/api/orchestrator/runs", None),
    ("POST", "/api/orchestrator/tick", {}),

    # Agent execution
    ("GET", "/api/agents", None),
    ("GET", "/api/agents/writer", None),
    ("GET", "/api/agents/writer/config", None),
    ("POST", "/api/agents/writer/run", {"topic": "Autonomous marketing workflows", "channel": "blog"}),
    ("GET", "/api/agent-runs", None),

    # Opportunities
    ("GET", "/api/opportunities/", None),

    # Brand Brain features
    ("GET", "/api/brand-brain/", None),
    ("GET", "/api/brand-brain/competitors", None),
    ("POST", "/api/brand-brain/competitors/auto-discover", {}),

    # Content & Publications
    ("GET", "/api/content/drafts", None),
    ("GET", "/api/content/projects", None),
    ("GET", "/api/publications", None),
    ("GET", "/api/publishers", None),

    # Approvals
    ("GET", "/api/approvals", None),
    ("GET", "/api/approvals?status=PENDING", None),

    # Billing
    ("GET", "/api/billing/plans", None),
    ("GET", "/api/billing/overview", None),

    # Team & Settings
    ("GET", f"/api/workspaces/{ws_id}/members", None),
]

passed = 0
failed = 0

for method, path, payload in test_cases:
    url = f"{BACKEND_URL}{path}"
    st, resp, err_msg = make_req(url, method=method, data=payload, headers=auth_headers)
    if st in [200, 201]:
        passed += 1
        summary = (resp[:70].replace("\n", " ") + "...") if resp and len(resp) > 70 else resp
        print(f" [OK]  {st} {method:<5} {path:<48} -> {summary}")
    else:
        failed += 1
        print(f" [ERR] {st} {method:<5} {path:<48} -> {err_msg[:120] if err_msg else 'No details'}")

print(f"\nResults: {passed} passed, {failed} failed out of {len(test_cases)} endpoints")

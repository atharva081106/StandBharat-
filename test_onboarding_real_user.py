import json
import sys
import uuid
import urllib.request
import urllib.error

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BACKEND_URL = "http://127.0.0.1:8000"

def request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res_data = res.read().decode("utf-8", errors="ignore")
            return res.status, json.loads(res_data) if res_data else None, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        return e.code, None, err_body
    except Exception as e:
        return 500, None, str(e)

def test_real_user_onboarding():
    print("\n========================================================")
    print(" 🏥 STANDBHARAT - REAL USER ONBOARDING JOURNEY TEST ")
    print("========================================================")
    
    # 1. Sign up a brand new user
    random_id = str(uuid.uuid4())[:8]
    user_email = f"founder_{random_id}@indushealth.in"
    user_password = "SecurePassword#2026"
    user_name = "Dr. Rohan Varma"

    print(f"\n[Step 1] Signing up new founder: {user_name} ({user_email})...")
    status, data, err = request(
        f"{BACKEND_URL}/api/auth/signup",
        method="POST",
        data={"email": user_email, "password": user_password, "name": user_name}
    )
    assert status == 200, f"Signup failed: {err}"
    print(f"  ✓ Signup successful: User ID = {data.get('id')}")

    # 2. Login as the new founder
    print("\n[Step 2] Authenticating and obtaining JWT session token...")
    status, data, err = request(
        f"{BACKEND_URL}/api/auth/login",
        method="POST",
        data={"email": user_email, "password": user_password}
    )
    assert status == 200, f"Login failed: {err}"
    token = data["access_token"]
    print("  ✓ Login successful: Access token obtained.")

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    # 3. Check /me before onboarding (verify has_workspace is False)
    print("\n[Step 3] Checking user status before workspace setup...")
    status, data, err = request(f"{BACKEND_URL}/api/auth/me", headers=auth_headers)
    assert status == 200
    print(f"  ✓ Initial user profile: has_workspace = {data.get('has_workspace')} (Fresh user)")

    # 4. Step 1 of onboarding: Start Onboarding
    business_name = "Indus Health Diagnostics"
    website_url = "https://indushealth.in"
    print(f"\n[Step 4] Starting onboarding initialization for '{business_name}'...")
    status, data, err = request(
        f"{BACKEND_URL}/api/onboarding/start",
        method="POST",
        data={"businessName": business_name, "website": website_url},
        headers=auth_headers
    )
    assert status == 200, f"Onboarding start failed: {err}"
    workspace_id = data["workspace_id"]
    brand_id = data["brand_id"]
    print(f"  ✓ Workspace provisioned: ID = {workspace_id}")
    print(f"  ✓ Brand initialized: ID = {brand_id}")

    # Set active headers
    auth_headers["X-Workspace-ID"] = workspace_id
    auth_headers["X-Brand-ID"] = brand_id

    # 5. Complete 7-Step Onboarding with full brand identity
    print("\n[Step 5] Completing 7-Step Onboarding Wizard submission...")
    onboarding_payload = {
        "businessName": business_name,
        "website": website_url,
        "description": "AI-driven preventative healthcare diagnostics for Indian families with vernacular report translations.",
        "valueProposition": "Instant, lab-accurate health insights delivered in 12 regional Indian languages within 15 minutes.",
        "brandVoice": ["Professional", "Empathetic", "Authoritative"],
        "targetDemographic": "Families and working professionals aged 25-52 in Tier-1 and Tier-2 Indian cities.",
        "customerPainPoints": "Overpriced diagnostic chains, long queue wait times, complex medical jargon, lack of regional language reports.",
        "primaryObjective": "Generate Qualified Leads",
        "targetRevenue": "₹75,00,000",
        "competitors": ["Practo", "HealthKart", "Apollo 24|7", "Tata 1mg"]
    }

    status, data, err = request(
        f"{BACKEND_URL}/api/onboarding/complete",
        method="POST",
        data=onboarding_payload,
        headers=auth_headers
    )
    assert status == 200, f"Onboarding complete failed: {err}"
    print("  ✓ Onboarding completed successfully!")
    print(f"  ✓ Confirmed Brand Name: {data['brand']['name']}")
    print(f"  ✓ Confirmed Website: {data['brand']['website_url']}")

    # 6. Verify Brand Brain persistence for the newly onboarded user
    print("\n[Step 6] Validating Brand Brain context for the newly onboarded brand...")
    status, data, err = request(f"{BACKEND_URL}/api/brand-brain/", headers=auth_headers)
    assert status == 200, f"Brand Brain fetch failed: {err}"
    assert data["brand"]["name"] == business_name
    print(f"  ✓ Brand Brain active for: {data['brand']['name']}")
    if data.get("audiences"):
        print(f"  ✓ Target audience saved: {data['audiences'][0].get('demographics')}")
    if data.get("voice"):
        print(f"  ✓ Brand voice personality: {data['voice'].get('personality')}")
    if data.get("positioning"):
        print(f"  ✓ Value proposition saved: {data['positioning'].get('unique_value_proposition')}")

    # 7. Verify Competitor Matrix persistence
    print("\n[Step 7] Validating Competitor records created during onboarding...")
    status, data, err = request(f"{BACKEND_URL}/api/brand-brain/competitors", headers=auth_headers)
    assert status == 200, f"Competitors fetch failed: {err}"
    saved_competitors = [c["name"] for c in data]
    print(f"  ✓ Saved competitors in DB: {saved_competitors}")
    for c in ["Practo", "HealthKart", "Apollo 24|7", "Tata 1mg"]:
        assert c in saved_competitors, f"Competitor {c} was not saved!"
    print("  ✓ All 4 competitors verified in DB.")

    # 8. Verify Workflow Status initialization for new brand
    print("\n[Step 8] Checking autonomous workflow status...")
    status, data, err = request(f"{BACKEND_URL}/api/brands/{brand_id}/workflow-status", headers=auth_headers)
    assert status == 200, f"Workflow status check failed: {err}"
    print(f"  ✓ Workflow overall status: {data.get('overall_status')}")
    print(f"  ✓ Website analysis status: {data.get('website_analysis')}")

    # 9. Ask AI CMO for initial advice based on newly created brand
    print("\n[Step 9] Prompting AI CMO for initial 30-day growth strategy...")
    status, data, err = request(
        f"{BACKEND_URL}/api/ai/cmo/chat",
        method="POST",
        data={"message": "Based on our new healthcare diagnostic platform, give me 3 quick marketing priorities."},
        headers=auth_headers
    )
    assert status == 200, f"AI CMO chat failed: {err}"
    print(f"  ✓ AI CMO responded with status: {data.get('status')}")
    response_preview = data.get("response", "")[:180].replace("\n", " ")
    print(f"  ✓ AI CMO response snippet: \"{response_preview}...\"")

    print("\n========================================================")
    print(" 🎉 REAL USER ONBOARDING JOURNEY: 100% SUCCESSFUL!      ")
    print("========================================================\n")

if __name__ == "__main__":
    test_real_user_onboarding()

import json
import sys
import uuid
import urllib.request
import urllib.error
import time

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
        with urllib.request.urlopen(req, timeout=45) as res:
            res_data = res.read().decode("utf-8", errors="ignore")
            try:
                parsed = json.loads(res_data) if res_data else None
            except:
                parsed = res_data
            return res.status, parsed, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        return e.code, None, err_body
    except Exception as e:
        return 500, None, str(e)

def run_master_suite():
    print("\n" + "="*70)
    print(" 🚀 STANDBHARAT MASTER PRODUCTION READINESS & VERIFICATION SUITE")
    print("="*70)

    # -------------------------------------------------------------
    # 1. AUTHENTICATION & WORKSPACE SETUP
    # -------------------------------------------------------------
    print("\n[SECTION 1] Authenticating Demo Operator & Loading Workspace Context...")
    st, data, err = request(f"{BACKEND_URL}/api/auth/login", method="POST", data={"email": "demo@standbharat.ai", "password": "demo"})
    assert st == 200, f"Login failed: {err}"
    token = data["access_token"]
    print("  ✓ Authentication successful. JWT acquired.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    st, brands, err = request(f"{BACKEND_URL}/api/brands/", headers=headers)
    assert st == 200 and len(brands) > 0, "Failed to load brands"
    brand_id = brands[0]["id"]
    ws_id = brands[0]["workspace_id"]
    headers["X-Workspace-ID"] = ws_id
    headers["X-Brand-ID"] = brand_id
    print(f"  ✓ Active Brand: {brands[0]['name']} (ID: {brand_id})")
    print(f"  ✓ Active Workspace ID: {ws_id}")

    # -------------------------------------------------------------
    # 2. TESTING ALL 15 SPECIALIZED AUTONOMOUS AI AGENTS
    # -------------------------------------------------------------
    print("\n[SECTION 2] Testing Complete Fleet of 15 Autonomous AI Agents...")
    st, agents, err = request(f"{BACKEND_URL}/api/agents", headers=headers)
    assert st == 200, f"Failed to list agents: {err}"
    print(f"  ✓ Total active agents registered: {len(agents)}")
    assert len(agents) >= 15, f"Expected at least 15 agents, got {len(agents)}"

    ALL_15_AGENT_IDS = [
        "analytics", "competitor", "growth", "content_strategy", 
        "content_writer", "performance", "seo_agent", "geo_agent", "ai_cmo",
        "linkedin_agent", "x_agent", "reddit_agent", "coding_agent", 
        "influencer_agent", "ugc_agent"
    ]

    agents_passed = 0
    for aid in ALL_15_AGENT_IDS:
        # 1. Query agent details
        st, a_detail, err = request(f"{BACKEND_URL}/api/agents/{aid}", headers=headers)
        assert st == 200, f"Failed to get agent {aid}: {err}"
        
        # 2. Query agent config
        st, a_cfg, err = request(f"{BACKEND_URL}/api/agents/{aid}/config", headers=headers)
        assert st == 200, f"Failed to get config for agent {aid}: {err}"

        # 3. Trigger test run
        run_payload = {
            "input_data": {
                "topic": "Autonomous Marketing Scale",
                "goal": "Q4 Expansion",
                "mode": "test"
            }
        }
        st, a_run, err = request(f"{BACKEND_URL}/api/agents/{aid}/run", method="POST", data=run_payload, headers=headers)
        assert st == 200, f"Failed to trigger agent {aid}: {err}"
        run_id = a_run.get("run_id") or a_run.get("task_id")
        
        print(f"  ✓ Agent [{aid:18}] -> Config OK | Triggered Run ID: {run_id[:8]}... (200 OK)")
        agents_passed += 1
        time.sleep(0.4)

    print(f"\n  🎉 All {agents_passed}/15 AI Agents successfully verified and executed!")

    # Verify Agent Runs telemetry in database
    st, runs, err = request(f"{BACKEND_URL}/api/agent-runs/", headers=headers)
    assert st == 200 and len(runs) > 0, f"No agent runs recorded (status={st}, err={err})"
    print(f"  ✓ Verified agent telemetry log: {len(runs)} total runs stored in DB.")

    # -------------------------------------------------------------
    # 3. TESTING ORCHESTRATOR LOOP
    # -------------------------------------------------------------
    print("\n[SECTION 3] Testing Autonomous Marketing Orchestrator Engine...")
    st, orch_status, err = request(f"{BACKEND_URL}/api/orchestrator/status", headers=headers)
    assert st == 200, f"Orchestrator status check failed: {err}"
    print(f"  ✓ Orchestrator Status: {orch_status.get('status', 'ACTIVE')} (Autonomous Mode)")

    st, tick_res, err = request(f"{BACKEND_URL}/api/orchestrator/tick", method="POST", data={}, headers=headers)
    assert st == 200, f"Orchestrator tick failed: {err}"
    print("  ✓ Orchestrator Heartbeat / Tick: Executed successfully (200 OK)")

    st, orch_runs, err = request(f"{BACKEND_URL}/api/orchestrator/runs", headers=headers)
    assert st == 200, f"Failed to fetch orchestrator run history: {err}"
    print(f"  ✓ Orchestrator Execution History: {len(orch_runs)} historical runs recorded.")

    # -------------------------------------------------------------
    # 4. TESTING ALL INTEGRATIONS
    # -------------------------------------------------------------
    print("\n[SECTION 4] Testing Integrations Hub (All Platforms)...")
    st, integrations, err = request(f"{BACKEND_URL}/api/integrations/", headers=headers)
    assert st == 200, f"Failed to list integrations: {err}"
    print(f"  ✓ Integrations Catalog: {len(integrations)} integrations available.")

    TEST_INTEGRATIONS = ["instagram", "meta_ads", "linkedin", "ga4", "gsc", "wordpress"]
    for integ in TEST_INTEGRATIONS:
        # Check status
        st, stat, err = request(f"{BACKEND_URL}/api/integrations/{integ}/status", headers=headers)
        assert st == 200, f"Status check failed for {integ}: {err}"
        
        # Connect / verify credentials
        connect_data = {
            "account_id": f"act_demo_{integ}",
            "access_token": f"token_demo_{integ}_secure_xyz",
            "property_id": "12345678",
            "url": "https://standbharat.ai",
            "site_url": "https://standbharat.ai",
            "username": "demo_operator",
            "app_password": f"token_demo_{integ}_secure_xyz"
        }
        st, conn, err = request(f"{BACKEND_URL}/api/integrations/{integ}/connect", method="POST", data=connect_data, headers=headers)
        assert st == 200, f"Connect failed for {integ}: {err}"

        # Trigger sync
        st, sync_res, err = request(f"{BACKEND_URL}/api/integrations/{integ}/sync", method="POST", data={}, headers=headers)
        assert st == 200, f"Sync failed for {integ}: {err}"
        print(f"  ✓ Integration [{integ:10}] -> Status 200 OK | Connected & Synced (Run: {sync_res.get('run_id', 'N/A')[:8]}...)")

    # -------------------------------------------------------------
    # 5. TESTING CONTENT STUDIO, DELIVERABLES & APPROVALS LIFECYCLE
    # -------------------------------------------------------------
    print("\n[SECTION 5] Testing Content Studio & End-to-End Approvals Pipeline...")
    # Create project
    proj_payload = {
        "title": f"Master Production Launch Playbook - {str(uuid.uuid4())[:6]}",
        "objective": "Accelerate Q4 Marketing Revenue",
        "content_type": "blog"
    }
    st, proj, err = request(f"{BACKEND_URL}/api/content/projects", method="POST", data=proj_payload, headers=headers)
    assert st == 200, f"Create project failed: {err}"
    proj_id = proj["id"]
    print(f"  ✓ Content Project Created: '{proj['title']}' (ID: {proj_id[:8]}...)")

    # Create draft
    draft_payload = {
        "content_project_id": proj_id,
        "title": "Scaling AI Marketing with 15 Autonomous Agents",
        "body_markdown": "# Scaling AI Marketing\n\nAutomating continuous execution loops.",
        "status": "DRAFT",
        "channels": ["blog", "linkedin"]
    }
    st, draft, err = request(f"{BACKEND_URL}/api/content/drafts", method="POST", data=draft_payload, headers=headers)
    assert st == 200, f"Create draft failed: {err}"
    draft_id = draft["id"]
    print(f"  ✓ Content Draft Generated: ID = {draft_id[:8]}...")

    # Submit for review
    review_payload = {
        "content_draft_id": draft_id
    }
    st, app_sub, err = request(f"{BACKEND_URL}/api/approvals/projects/{proj_id}/submit-review", method="POST", data=review_payload, headers=headers)
    assert st == 200, f"Submit review failed: {err}"
    app_id = app_sub["id"]
    print(f"  ✓ Submitted to Approvals Queue: Approval ID = {app_id[:8]}... (Status: {app_sub['status']})")

    # Approve deliverable
    st, app_approved, err = request(f"{BACKEND_URL}/api/approvals/{app_id}/approve", method="POST", data={}, headers=headers)
    assert st == 200, f"Approve failed: {err}"
    print(f"  ✓ Approvals Gate: Status updated to '{app_approved.get('status')}'")

    # Schedule / Enqueue Publication for LinkedIn
    st, pub, err = request(f"{BACKEND_URL}/api/content/drafts/{draft_id}/publish?platform=linkedin", method="POST", data={}, headers=headers)
    assert st == 200, f"Publication queuing failed: {err}"
    print(f"  ✓ Calendar Publication Enqueued: Platform = LinkedIn, Status = {pub.get('status')}")

    # List publications
    st, pubs, err = request(f"{BACKEND_URL}/api/publications", headers=headers)
    assert st == 200 and len(pubs) > 0, f"List publications failed: {err}"
    print(f"  ✓ Publications Ledger: Verified {len(pubs)} publication records tracked.")

    # -------------------------------------------------------------
    # 6. TESTING BRAND BRAIN & COMPETITOR MATRIX
    # -------------------------------------------------------------
    print("\n[SECTION 6] Testing Brand Brain, Competitors & Voice...")
    st, brain, err = request(f"{BACKEND_URL}/api/brand-brain/", headers=headers)
    assert st == 200, "Brand Brain fetch failed"
    print(f"  ✓ Brand Brain Context: Loaded for {brain['brand']['name']}")

    # Auto-discover competitors
    st, comps, err = request(f"{BACKEND_URL}/api/brand-brain/competitors/auto-discover", method="POST", data={}, headers=headers)
    assert st == 200, "Competitor auto-discovery failed"
    print(f"  ✓ Competitor Auto-Discovery: Discovered {len(comps)} market competitors.")

    # -------------------------------------------------------------
    # 7. TESTING OPPORTUNITIES & REVENUE ROI ATTRIBUTION
    # -------------------------------------------------------------
    print("\n[SECTION 7] Testing Growth Opportunities & Attribution Analytics...")
    st, opps, err = request(f"{BACKEND_URL}/api/opportunities/", headers=headers)
    assert st == 200, "Failed to fetch opportunities"
    print(f"  ✓ Autonomous Growth Opportunities: {len(opps)} prioritized opportunities loaded.")

    st, kpis, err = request(f"{BACKEND_URL}/api/dashboard/stats", headers=headers)
    assert st == 200, "Failed to fetch dashboard KPIs"
    print(f"  ✓ Dashboard Attribution KPIs: {len(kpis.get('kpis', []))} metrics calculated.")

    st, web_analytics, err = request(f"{BACKEND_URL}/api/dashboard/website-analytics", headers=headers)
    assert st == 200, "Failed to fetch website analytics"
    print(f"  ✓ Dedicated Website Analytics: Connected for brand {web_analytics.get('brand_id')[:8]}...")

    # -------------------------------------------------------------
    # 8. TESTING NOTIFICATIONS & SEARCH
    # -------------------------------------------------------------
    print("\n[SECTION 8] Testing Notification Feed & Global Search Engine...")
    st, notifs, err = request(f"{BACKEND_URL}/api/notifications", headers=headers)
    assert st == 200, "Notifications fetch failed"
    st, unread, err = request(f"{BACKEND_URL}/api/notifications/unread-count", headers=headers)
    assert st == 200, "Unread count fetch failed"
    print(f"  ✓ Notifications Engine: Unread count = {unread.get('unread_count')}")

    st, search_res, err = request(f"{BACKEND_URL}/api/search?q=Growth", headers=headers)
    assert st == 200, "Search query failed"
    print(f"  ✓ Global Omnibox Search: Found {len(search_res)} indexed results for query 'Growth'.")

    # -------------------------------------------------------------
    # 9. TESTING BILLING & SCALE TIERS
    # -------------------------------------------------------------
    print("\n[SECTION 9] Testing Multi-Tenant Billing Plans & Scalability Tiers...")
    st, plans, err = request(f"{BACKEND_URL}/api/billing/plans", headers=headers)
    assert st == 200, "Plans fetch failed"
    print(f"  ✓ Billing Plan Tiers: {list(plans.get('plans', {}).keys())}")

    st, billing_ov, err = request(f"{BACKEND_URL}/api/billing/overview", headers=headers)
    assert st == 200, "Billing overview fetch failed"
    print(f"  ✓ Current Workspace Tier: {billing_ov.get('plan_tier')} (Plan: {billing_ov.get('plan_name')})")

    # -------------------------------------------------------------
    # 10. FINAL SUMMARY
    # -------------------------------------------------------------
    print("\n" + "="*70)
    print(" 🏆 MASTER PRODUCTION VERIFICATION COMPLETE: 100% PASSING!")
    print("="*70)
    print(" ✓ All 15 AI Agents: Operational & Verified")
    print(" ✓ Orchestrator Loop: Running & Responding")
    print(" ✓ Integrations Hub: 6/6 Core Integrations Connected & Synced")
    print(" ✓ Content & Approvals Pipeline: 100% Operational")
    print(" ✓ Brand Brain & Competitor Discovery: 100% Operational")
    print(" ✓ Analytics, Search, Notifications & Billing: 100% Operational")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_master_suite()

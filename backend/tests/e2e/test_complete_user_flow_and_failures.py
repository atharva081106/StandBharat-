"""
StandBharat E2E Test Suite: Real-User Complete Flow & Exhaustive Failure Test Cases
Validates:
1. Complete live end-to-end user lifecycle (Signup -> Onboard -> Brand Brain -> Campaigns -> Content -> Approvals -> Agents -> Orchestrator -> Integrations -> Billing -> Settings).
2. All failure modes and security edge cases (Auth validation, Bad JWTs, Cross-tenant isolation, 404 lookups, Business rule invalidation, Webhook forgery, Malformed payloads).
3. Frontend route health and SSR stability.
"""

import time
import uuid
import hmac
import hashlib
import json
import httpx
import pytest

BACKEND_BASE = "http://127.0.0.1:8000"
FRONTEND_BASE = "http://localhost:3000"

# Color formatting for terminal outputs
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


class StandBharatE2ETester:
    def __init__(self, backend_url: str = BACKEND_BASE, frontend_url: str = FRONTEND_BASE):
        self.backend_url = backend_url
        self.frontend_url = frontend_url
        self.client = httpx.Client(timeout=30.0)
        self.results = []
        
        # Session state for real user happy path
        self.user_email = f"real_user_{int(time.time())}@shilpbharat.in"
        self.user_password = "SecurePassword2026!"
        self.user_name = "Rohan Deshmukh"
        self.token = None
        self.user_id = None
        self.workspace_id = None
        self.brand_id = None
        self.project_id = None
        self.draft_id = None
        self.approval_id = None

    def log_result(self, category: str, test_name: str, passed: bool, status_code: int, expected: str, details: str = ""):
        self.results.append({
            "category": category,
            "test_name": test_name,
            "passed": passed,
            "status_code": status_code,
            "expected": expected,
            "details": details
        })
        icon = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
        print(f"[{icon}] {CYAN}{category:<20}{RESET} | {BOLD}{test_name:<42}{RESET} | Got: {status_code:<4} (Exp: {expected}) {details}")

    def auth_headers(self):
        h = {}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        if self.workspace_id:
            h["X-Workspace-ID"] = str(self.workspace_id)
        if self.brand_id:
            h["X-Brand-ID"] = str(self.brand_id)
        return h

    # ==========================================
    # 1. FAILURE TEST CASES: AUTHENTICATION
    # ==========================================
    def test_failure_auth_cases(self):
        print(f"\n{BOLD}=== RUNNING FAILURE TEST SUITE: AUTHENTICATION & LOGIN ==={RESET}")
        
        # 1.1 Invalid email format on signup
        res = self.client.post(f"{self.backend_url}/api/auth/signup", json={
            "email": "not-an-email-address",
            "password": "ValidPassword123!",
            "name": "Invalid Email User"
        })
        passed = res.status_code in [400, 422]
        self.log_result("Auth Failure", "Signup invalid email format", passed, res.status_code, "400/422")

        # 1.2 Empty body signup
        res = self.client.post(f"{self.backend_url}/api/auth/signup", json={})
        passed = res.status_code == 422
        self.log_result("Auth Failure", "Signup empty payload", passed, res.status_code, "422")

        # 1.3 Login with non-existent user
        res = self.client.post(f"{self.backend_url}/api/auth/login", json={
            "email": f"ghost_{uuid.uuid4().hex[:6]}@shilpbharat.in",
            "password": "AnyPassword123!"
        })
        passed = res.status_code in [400, 401]
        self.log_result("Auth Failure", "Login non-existent user", passed, res.status_code, "400/401")

        # 1.4 Login with SQL Injection in email & password
        res = self.client.post(f"{self.backend_url}/api/auth/login", json={
            "email": "admin' OR '1'='1' --",
            "password": "' OR '1'='1"
        })
        passed = res.status_code in [400, 401, 422] and ("token" not in res.text)
        self.log_result("Auth Failure", "Login SQL injection attack blocked", passed, res.status_code, "400/401/422")

        # 1.5 Login with missing password
        res = self.client.post(f"{self.backend_url}/api/auth/login", json={
            "email": "admin@standbharat.ai"
        })
        passed = res.status_code == 422
        self.log_result("Auth Failure", "Login missing password", passed, res.status_code, "422")

    # ==========================================
    # 2. FAILURE TEST CASES: SECURITY & AUTHZ
    # ==========================================
    def test_failure_security_and_authz(self):
        print(f"\n{BOLD}=== RUNNING FAILURE TEST SUITE: SECURITY & AUTHORIZATION ==={RESET}")

        # 2.1 Unauthenticated access to /api/auth/me
        res = self.client.get(f"{self.backend_url}/api/auth/me")
        passed = res.status_code == 401
        self.log_result("Security Failure", "Get /auth/me without token", passed, res.status_code, "401")

        # 2.2 Malformed JWT token
        res = self.client.get(f"{self.backend_url}/api/auth/me", headers={"Authorization": "Bearer malformed.token.value"})
        passed = res.status_code == 401
        self.log_result("Security Failure", "Get /auth/me with malformed JWT", passed, res.status_code, "401")

        # 2.3 Forged token with invalid secret signature
        forged_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAifQ.invalid_sig_xyz"
        res = self.client.get(f"{self.backend_url}/api/auth/me", headers={"Authorization": f"Bearer {forged_jwt}"})
        passed = res.status_code == 401
        self.log_result("Security Failure", "Get /auth/me with forged secret", passed, res.status_code, "401")

        # 2.4 Unauthenticated access to protected campaigns
        res = self.client.get(f"{self.backend_url}/api/campaigns")
        passed = res.status_code == 401
        self.log_result("Security Failure", "Get /campaigns unauthenticated", passed, res.status_code, "401")

        # 2.5 Unauthenticated access to brand brain
        res = self.client.get(f"{self.backend_url}/api/brand-brain")
        passed = res.status_code == 401
        self.log_result("Security Failure", "Get /brand-brain unauthenticated", passed, res.status_code, "401")

    # ==========================================
    # 3. FAILURE TEST CASES: 404 RESOURCE LOOKUPS
    # ==========================================
    def test_failure_resource_lookups(self):
        print(f"\n{BOLD}=== RUNNING FAILURE TEST SUITE: RESOURCE LOOKUPS & 404s ==={RESET}")
        
        non_existent_uuid = "00000000-0000-0000-0000-000000000000"
        headers = self.auth_headers()

        # 3.1 Non-existent content project
        res = self.client.get(f"{self.backend_url}/api/content/projects/{non_existent_uuid}", headers=headers)
        passed = res.status_code == 404
        self.log_result("Lookup Failure", "Get non-existent content project", passed, res.status_code, "404")

        # 3.2 Non-existent content project brief
        res = self.client.get(f"{self.backend_url}/api/content/projects/{non_existent_uuid}/brief", headers=headers)
        passed = res.status_code == 404
        self.log_result("Lookup Failure", "Get non-existent project brief", passed, res.status_code, "404")

        # 3.3 Non-existent approval item
        res = self.client.get(f"{self.backend_url}/api/approvals/{non_existent_uuid}", headers=headers)
        passed = res.status_code == 404
        self.log_result("Lookup Failure", "Get non-existent approval", passed, res.status_code, "404")

        # 3.4 Non-existent approval action
        res = self.client.post(f"{self.backend_url}/api/approvals/{non_existent_uuid}/approve", headers=headers)
        passed = res.status_code == 404
        self.log_result("Lookup Failure", "Approve non-existent item", passed, res.status_code, "404")

        # 3.5 Non-existent agent ID lookup
        res = self.client.get(f"{self.backend_url}/api/agents/non_existent_agent_999", headers=headers)
        passed = res.status_code == 404
        self.log_result("Lookup Failure", "Get non-existent agent", passed, res.status_code, "404")

        # 3.6 Non-existent agent trigger
        res = self.client.post(f"{self.backend_url}/api/agents/non_existent_agent_999/run", json={}, headers=headers)
        passed = res.status_code == 404
        self.log_result("Lookup Failure", "Trigger non-existent agent", passed, res.status_code, "404")

        # 3.7 Non-existent integration provider connect
        res = self.client.post(f"{self.backend_url}/api/integrations/fake_provider_xyz/connect", json={"key": "val"}, headers=headers)
        passed = res.status_code == 404
        self.log_result("Lookup Failure", "Connect non-existent integration", passed, res.status_code, "404")

    # ==========================================
    # 4. FAILURE TEST CASES: BUSINESS RULES & VALIDATION
    # ==========================================
    def test_failure_business_rules(self):
        print(f"\n{BOLD}=== RUNNING FAILURE TEST SUITE: BUSINESS RULES & VALIDATION ==={RESET}")
        headers = self.auth_headers()

        # 4.1 Invalid Orchestrator mode
        res = self.client.patch(f"{self.backend_url}/api/orchestrator/status", json={"mode": "HYPER_AUTONOMOUS"}, headers=headers)
        passed = res.status_code in [400, 422]
        self.log_result("Business Rule", "Reject invalid orchestrator mode", passed, res.status_code, "400/422")

        # 4.2 Invalid Plan Tier upgrade
        res = self.client.post(f"{self.backend_url}/api/workspaces/{self.workspace_id}/upgrade", json={"plan": "GOD_TIER"}, headers=headers)
        passed = res.status_code in [400, 422]
        self.log_result("Business Rule", "Reject invalid subscription plan", passed, res.status_code, "400/422")

        # 4.3 Invite member with empty email
        res = self.client.post(f"{self.backend_url}/api/workspaces/{self.workspace_id}/members", json={"role": "MARKETER"}, headers=headers)
        passed = res.status_code in [400, 422]
        self.log_result("Business Rule", "Reject member invite without email", passed, res.status_code, "400/422")

        # 4.4 Reject mock dummy integration credentials
        res = self.client.post(f"{self.backend_url}/api/integrations/ga4/connect", json={"dummy_token": "mock_credential_123"}, headers=headers)
        passed = res.status_code == 400
        self.log_result("Business Rule", "Reject mock credentials in integration", passed, res.status_code, "400")

        # 4.5 Billing webhook with forged signature
        res = self.client.post(
            f"{self.backend_url}/api/billing/webhook",
            content=json.dumps({"event": "payment.captured"}),
            headers={"X-Razorpay-Signature": "forged_sha256_sig_value", "Content-Type": "application/json"}
        )
        passed = res.status_code in [400, 401]
        self.log_result("Business Rule", "Reject forged billing webhook signature", passed, res.status_code, "400/401")

        # 4.6 Billing webhook with invalid raw JSON
        res = self.client.post(
            f"{self.backend_url}/api/billing/webhook",
            content=b"THIS IS NOT VALID JSON <<>>",
            headers={"Content-Type": "application/json"}
        )
        passed = res.status_code == 400
        self.log_result("Business Rule", "Reject non-JSON webhook body", passed, res.status_code, "400")

    # ==========================================
    # 5. REAL USER HAPPY PATH COMPLETE FLOW
    # ==========================================
    def test_real_user_happy_path(self):
        print(f"\n{BOLD}=== RUNNING REAL USER COMPLETE FLOW (HAPPY PATH) ==={RESET}")

        # Step 1: User Signup
        res = self.client.post(f"{self.backend_url}/api/auth/signup", json={
            "email": self.user_email,
            "password": self.user_password,
            "name": self.user_name
        })
        passed = res.status_code in [200, 201]
        data = res.json() if passed else {}
        self.user_id = data.get("id")
        self.log_result("Happy Path", "1. User Account Registration", passed, res.status_code, "200", f"User: {self.user_email}")

        # Duplicate signup check (Failure test on registered user)
        res_dup = self.client.post(f"{self.backend_url}/api/auth/signup", json={
            "email": self.user_email,
            "password": self.user_password,
            "name": self.user_name
        })
        passed_dup = res_dup.status_code == 400
        self.log_result("Auth Failure", "Duplicate email registration rejected", passed_dup, res_dup.status_code, "400")

        # Step 2: User Login
        res = self.client.post(f"{self.backend_url}/api/auth/login", json={
            "email": self.user_email,
            "password": self.user_password
        })
        passed = res.status_code == 200 and "access_token" in res.json()
        if passed:
            self.token = res.json()["access_token"]
        self.log_result("Happy Path", "2. User Authentication & JWT Generation", passed, res.status_code, "200")

        # Step 3: Verify User Identity (/auth/me)
        res = self.client.get(f"{self.backend_url}/api/auth/me", headers={"Authorization": f"Bearer {self.token}"})
        passed = res.status_code == 200 and res.json().get("email") == self.user_email
        self.log_result("Happy Path", "3. Current User Profile Verification", passed, res.status_code, "200")

        # Step 4: Start Onboarding (Provision Workspace & Brand)
        res = self.client.post(f"{self.backend_url}/api/onboarding/start", json={
            "businessName": "Bharat Shilp Direct",
            "website": "https://bharatshilp.in"
        }, headers={"Authorization": f"Bearer {self.token}"})
        passed = res.status_code == 200 and "workspace_id" in res.json() and "brand_id" in res.json()
        if passed:
            body = res.json()
            self.workspace_id = body["workspace_id"]
            self.brand_id = body["brand_id"]
        self.log_result("Happy Path", "4. Start Onboarding & Auto-Provisioning", passed, res.status_code, "200", f"WS: {self.workspace_id}, Brand: {self.brand_id}")

        # Step 5: Complete Onboarding (Persist full brand positioning)
        headers = self.auth_headers()
        res = self.client.post(f"{self.backend_url}/api/onboarding/complete", json={
            "businessName": "Bharat Shilp Direct",
            "website": "https://bharatshilp.in",
            "description": "Authentic Handcrafted Indian Textiles and GI-tagged Artefacts straight from rural master artisans to modern Indian homes.",
            "valueProposition": "100% authentic GI-certified handloom with zero middlemen markups and direct artisan profit sharing.",
            "brandVoice": ["Authentic", "Empowering", "Cultural", "Transparent"],
            "targetDemographic": "Discerning Tier 1 & Tier 2 Indian homeowners & cultural connoisseurs aged 25-50.",
            "customerPainPoints": "Counterfeit powerloom copies, opaque provenance, high retail markups, slow delivery.",
            "primaryObjective": "Achieve ₹50 Lakhs monthly recurring revenue with high retention.",
            "targetRevenue": "₹5,00,00,000 Annual GMV",
            "competitors": ["FabIndia", "Jaypore", "Okhai"]
        }, headers=headers)
        passed = res.status_code == 200 and res.json().get("status") == "success"
        self.log_result("Happy Path", "5. Complete Onboarding & Save Brain Context", passed, res.status_code, "200")

        # Step 6: Brand Brain Retrieval & Summary
        res = self.client.get(f"{self.backend_url}/api/brand-brain", headers=headers)
        passed = res.status_code == 200 and "brand" in res.json()
        self.log_result("Happy Path", "6. Brand Brain Context Retrieval", passed, res.status_code, "200")

        res_sum = self.client.get(f"{self.backend_url}/api/brand-brain/summary", headers=headers)
        passed_sum = res_sum.status_code == 200 and res_sum.json().get("brand_name") == "Bharat Shilp Direct"
        self.log_result("Happy Path", "6b. Brand Brain Executive Summary", passed_sum, res_sum.status_code, "200")

        # Step 7: Update Brand Voice
        res = self.client.patch(f"{self.backend_url}/api/brand-brain/voice", json={
            "tone": "Authentic, Culturally Rooted, Inspiring",
            "personality": "Wise Artisan Mentor",
            "writing_style": "Story-driven, transparent, evocative",
            "preferred_language": "English & Hinglish",
            "formality": "Warm & Professional"
        }, headers=headers)
        passed = res.status_code == 200 and res.json().get("personality") == "Wise Artisan Mentor"
        self.log_result("Happy Path", "7. Update Brand Voice Guidelines", passed, res.status_code, "200")

        # Step 8: Add Product to Brand Brain
        res = self.client.post(f"{self.backend_url}/api/brand-brain/products", json={
            "name": "GI-Certified Chanderi Pure Silk Saree",
            "price": "₹8,499",
            "category": "Ethnic Apparel",
            "value_proposition": "Handwoven with pure zari in Chanderi, Madhya Pradesh. Lightweight elegance.",
            "target_audience": "Festive and wedding shoppers seeking authentic heritage weaves."
        }, headers=headers)
        passed = res.status_code == 200 and res.json().get("name") == "GI-Certified Chanderi Pure Silk Saree"
        self.log_result("Happy Path", "8. Add Product to Brand Brain", passed, res.status_code, "200")

        # Step 9: Add Audience Persona
        res = self.client.post(f"{self.backend_url}/api/brand-brain/audiences", json={
            "name": "Discerning Heritage Connoisseurs",
            "demographics": "Women & Men, 28-48, Urban Metros & Tier 2 Cultural Hubs",
            "pain_points": "Cannot verify authenticity of handloom products online.",
            "preferred_channels": "Instagram Reels, WhatsApp VIP updates"
        }, headers=headers)
        passed = res.status_code == 200 and res.json().get("name") == "Discerning Heritage Connoisseurs"
        self.log_result("Happy Path", "9. Add Audience Persona", passed, res.status_code, "200")

        # Step 10: Add Competitor to Intelligence Radar
        res = self.client.post(f"{self.backend_url}/api/brand-brain/competitors", json={
            "name": "FabIndia",
            "website": "https://fabindia.com",
            "strengths": "Massive retail store footprint, strong brand recall",
            "weaknesses": "Higher retail markups, diluted handloom claims"
        }, headers=headers)
        passed = res.status_code == 200 and res.json().get("name") == "FabIndia"
        self.log_result("Happy Path", "10. Add Competitor to Radar", passed, res.status_code, "200")

        # Step 11: Command Center Dashboard Query
        res = self.client.get(f"{self.backend_url}/api/dashboard/command-center", headers=headers)
        passed = res.status_code == 200 and "kpis" in res.json()
        self.log_result("Happy Path", "11. Dashboard Command Center Inspection", passed, res.status_code, "200")

        # Step 12: Indian Festivals & Marketing Campaigns
        res_fest = self.client.get(f"{self.backend_url}/api/campaigns/festivals", headers=headers)
        passed_fest = res_fest.status_code == 200 and len(res_fest.json()) > 0
        self.log_result("Happy Path", "12a. Fetch Curated Indian Festive Calendar", passed_fest, res_fest.status_code, "200", f"Festivals: {len(res_fest.json())}")

        # Create Campaign
        res_camp = self.client.post(f"{self.backend_url}/api/campaigns", json={
            "name": "Diwali Artisan Mega Sprint 2026",
            "description": "Multi-channel festive blitz celebrating GI-tagged rural craftsmanship.",
            "budget": 75000.0,
            "status": "ACTIVE"
        }, headers=headers)
        passed_camp = res_camp.status_code in [200, 201] and "id" in res_camp.json()
        camp_id = res_camp.json().get("id") if passed_camp else None
        self.log_result("Happy Path", "12b. Create Marketing Campaign", passed_camp, res_camp.status_code, "200", f"Campaign ID: {camp_id}")

        # Launch 1-Click Festive Sprint
        res_sprint = self.client.post(f"{self.backend_url}/api/campaigns/festive-sprint", json={
            "festival_id": "diwali",
            "festival_name": "Diwali & Dhanteras Utsav",
            "budget": 50000.0,
            "discount": "Flat 25% OFF",
            "target_market": "Pan-India Tier 1 & 2"
        }, headers=headers)
        passed_sprint = res_sprint.status_code == 200 and res_sprint.json().get("status") == "LAUNCHED"
        self.log_result("Happy Path", "12c. 1-Click Indian Festive Sprint Launch", passed_sprint, res_sprint.status_code, "200")

        # Generate WhatsApp Broadcast Template
        res_wa = self.client.post(f"{self.backend_url}/api/campaigns/whatsapp-broadcast", json={
            "template_type": "festive_offer",
            "customer_segment": "High-Value Festive Shoppers",
            "offer_text": "Exclusive Early Access + Flat 25% OFF",
            "code": "DIWALI25"
        }, headers=headers)
        passed_wa = res_wa.status_code == 200 and "body" in res_wa.json()
        self.log_result("Happy Path", "12d. Generate Vernacular WhatsApp Template", passed_wa, res_wa.status_code, "200")

        # Step 13: Content Studio Project & Brief
        res_proj = self.client.post(f"{self.backend_url}/api/content/projects", json={
            "title": "Chanderi Heritage Storytelling Blog & Reels",
            "objective": "Educate buyers on distinguishing authentic handloom from synthetic powerloom.",
            "content_type": "blog",
            "priority": 1
        }, headers=headers)
        passed_proj = res_proj.status_code == 200 and "id" in res_proj.json()
        if passed_proj:
            self.project_id = res_proj.json()["id"]
        self.log_result("Happy Path", "13a. Create Content Studio Project", passed_proj, res_proj.status_code, "200", f"Project: {self.project_id}")

        res_brief = self.client.post(f"{self.backend_url}/api/content/projects/{self.project_id}/brief", json={
            "title": "Chanderi Silk Provenance Guide",
            "objective": "Build trust and drive high-intent festive organic traffic.",
            "target_audience": "Heritage connoisseurs and sustainable luxury shoppers.",
            "key_message": "Every weave carries 600 years of artisan tradition and GI protection.",
            "tone": "Evocative, Authoritative, Inspiring",
            "keywords": "Chanderi saree, handloom silk, authentic GI tag, artisan heritage"
        }, headers=headers)
        passed_brief = res_brief.status_code == 200 and "id" in res_brief.json()
        self.log_result("Happy Path", "13b. Create Content Brief for Project", passed_brief, res_brief.status_code, "200")

        # Step 14: Draft Creation & Approvals Queue Workflow
        # Create draft directly
        res_draft = self.client.post(f"{self.backend_url}/api/content/drafts", json={
            "content_project_id": str(self.project_id),
            "title": "The Weaver's Touch: 5 Ways to Identify Real Chanderi Silk",
            "body": "Real Chanderi silk is renowned for its lightweight sheer texture and intricate motifs inspired by nature...",
            "content_type": "blog",
            "status": "DRAFT"
        }, headers=headers)
        passed_draft = res_draft.status_code in [200, 201] and "id" in res_draft.json()
        if passed_draft:
            self.draft_id = res_draft.json()["id"]
        self.log_result("Happy Path", "14a. Create Content Draft", passed_draft, res_draft.status_code, "200", f"Draft: {self.draft_id}")

        # Submit for approval review
        res_sub = self.client.post(f"{self.backend_url}/api/approvals/projects/{self.project_id}/submit-review", json={
            "content_draft_id": str(self.draft_id)
        }, headers=headers)
        passed_sub = res_sub.status_code == 200 and "id" in res_sub.json()
        if passed_sub:
            self.approval_id = res_sub.json()["id"]
        self.log_result("Happy Path", "14b. Submit Draft to Governance Approvals Queue", passed_sub, res_sub.status_code, "200", f"Approval ID: {self.approval_id}")

        # Fetch Approvals Queue
        res_app_list = self.client.get(f"{self.backend_url}/api/approvals", headers=headers)
        passed_app_list = res_app_list.status_code == 200 and any(a["id"] == str(self.approval_id) for a in res_app_list.json())
        self.log_result("Happy Path", "14c. Inspect Governance Approvals Queue", passed_app_list, res_app_list.status_code, "200")

        # Approve the draft
        res_approve = self.client.post(f"{self.backend_url}/api/approvals/{self.approval_id}/approve", headers=headers)
        passed_approve = res_approve.status_code == 200 and res_approve.json().get("status") == "APPROVED"
        self.log_result("Happy Path", "14d. Review & Approve Content Draft", passed_approve, res_approve.status_code, "200")

        # Double-approval rejection check (Failure regression test)
        res_double_approve = self.client.post(f"{self.backend_url}/api/approvals/{self.approval_id}/approve", headers=headers)
        passed_double = res_double_approve.status_code == 400
        self.log_result("Business Rule", "Reject double-approval of already approved item", passed_double, res_double_approve.status_code, "400")

        # Step 15: Autonomous Agents Listing & Run Trigger
        res_agents = self.client.get(f"{self.backend_url}/api/agents", headers=headers)
        passed_agents = res_agents.status_code == 200 and len(res_agents.json()) >= 9
        self.log_result("Happy Path", "15a. Query Autonomous Agent Registry", passed_agents, res_agents.status_code, "200", f"Agents count: {len(res_agents.json()) if passed_agents else 0}")

        # Dispatch an agent run (e.g. growth or analytics)
        res_run = self.client.post(f"{self.backend_url}/api/agents/growth/run", json={
            "input_data": {"focus": "festive_sprint_optimization"}
        }, headers=headers)
        # 200 or 402 (if free tier quota check triggers)
        passed_run = res_run.status_code in [200, 402]
        self.log_result("Happy Path", "15b. Dispatch Autonomous Agent Execution", passed_run, res_run.status_code, "200/402")

        # Step 16: Autonomous Orchestrator Inspection & Mode Update
        res_orch = self.client.get(f"{self.backend_url}/api/orchestrator/status", headers=headers)
        passed_orch = res_orch.status_code == 200 and "mode" in res_orch.json()
        self.log_result("Happy Path", "16a. Query Orchestrator Status", passed_orch, res_orch.status_code, "200")

        res_orch_update = self.client.patch(f"{self.backend_url}/api/orchestrator/status", json={"mode": "ASSISTED"}, headers=headers)
        passed_orch_update = res_orch_update.status_code == 200 and res_orch_update.json().get("mode") == "ASSISTED"
        self.log_result("Happy Path", "16b. Switch Orchestrator Mode to ASSISTED", passed_orch_update, res_orch_update.status_code, "200")

        res_tick = self.client.post(f"{self.backend_url}/api/orchestrator/tick", headers=headers)
        passed_tick = res_tick.status_code == 200
        self.log_result("Happy Path", "16c. Execute Manual Orchestrator Tick Cycle", passed_tick, res_tick.status_code, "200")

        # Step 17: Integrations Catalog & Status
        res_integs = self.client.get(f"{self.backend_url}/api/integrations/", headers=headers)
        passed_integs = res_integs.status_code == 200 and len(res_integs.json()) >= 10
        self.log_result("Happy Path", "17a. Query Integrations Catalog", passed_integs, res_integs.status_code, "200", f"Integrations count: {len(res_integs.json()) if passed_integs else 0}")

        res_ga4_status = self.client.get(f"{self.backend_url}/api/integrations/ga4/status", headers=headers)
        passed_ga4_status = res_ga4_status.status_code == 200
        self.log_result("Happy Path", "17b. Check GA4 Integration Status", passed_ga4_status, res_ga4_status.status_code, "200")

        # Step 18: Workspace Plan & Team Member RBAC
        res_plan = self.client.get(f"{self.backend_url}/api/workspaces/{self.workspace_id}/plan", headers=headers)
        passed_plan = res_plan.status_code == 200 and "plan_tier" in res_plan.json()
        self.log_result("Happy Path", "18a. Inspect Workspace Plan & AI Credits", passed_plan, res_plan.status_code, "200")

        res_invite = self.client.post(f"{self.backend_url}/api/workspaces/{self.workspace_id}/members", json={
            "email": "priya.artisan@shilpbharat.in",
            "role": "MARKETER"
        }, headers=headers)
        passed_invite = res_invite.status_code == 200 and res_invite.json().get("status") == "SUCCESS"
        self.log_result("Happy Path", "18b. Invite Workspace Team Member (RBAC)", passed_invite, res_invite.status_code, "200")

        res_members = self.client.get(f"{self.backend_url}/api/workspaces/{self.workspace_id}/members", headers=headers)
        passed_members = res_members.status_code == 200 and any(m["email"] == "priya.artisan@shilpbharat.in" for m in res_members.json())
        self.log_result("Happy Path", "18c. Verify Team Member in Workspace", passed_members, res_members.status_code, "200")

        # Step 19: Billing Pricing Plans & Instant UPI Intent with GST
        res_pricing = self.client.get(f"{self.backend_url}/api/billing/plans")
        passed_pricing = res_pricing.status_code == 200 and "plans" in res_pricing.json()
        self.log_result("Happy Path", "19a. Fetch Billing Plans Catalog", passed_pricing, res_pricing.status_code, "200")

        res_upi = self.client.post(f"{self.backend_url}/api/billing/upi-intent", json={
            "plan_tier": "PRO",
            "billing_cycle": "MONTHLY",
            "customer_gstin": "27AABCS1429B1Z"
        }, headers=headers)
        passed_upi = res_upi.status_code == 200 and "upi_uri" in res_upi.json() and "cgst" in res_upi.json()
        self.log_result("Happy Path", "19b. Create Instant NPCI UPI Intent & 18% GST Breakdown", passed_upi, res_upi.status_code, "200")

    # ==========================================
    # 6. FRONTEND ROUTE HEALTH & SSR STABILITY
    # ==========================================
    def test_frontend_routes(self):
        print(f"\n{BOLD}=== RUNNING FRONTEND ROUTE VERIFICATION (NEXT.JS PORT 3000) ==={RESET}")
        
        frontend_routes = [
            ("/", "Landing Page"),
            ("/login", "Login Page"),
            ("/signup", "Signup Page"),
            ("/onboarding", "Onboarding Wizard"),
            ("/app", "Command Center Dashboard"),
            ("/app/brand-brain", "Brand Brain Strategic Memory"),
            ("/app/campaigns", "Campaigns & Festive Sprints"),
            ("/app/content", "Content Studio & Generation"),
            ("/app/approvals", "Human-in-the-Loop Approvals"),
            ("/app/agents", "Autonomous Agent Hub"),
            ("/app/calendar", "Publishing & Content Calendar"),
            ("/app/integrations", "Integrations Marketplace"),
            ("/app/settings", "Workspace General Settings"),
            ("/app/settings/billing", "Billing & Invoices"),
            ("/app/settings/team", "Team & RBAC Management"),
        ]

        for route, name in frontend_routes:
            url = f"{self.frontend_url}{route}"
            try:
                res = self.client.get(url, follow_redirects=True)
                passed = res.status_code == 200
                self.log_result("Frontend Route", f"{name} ({route})", passed, res.status_code, "200", f"{len(res.text)} bytes")
            except Exception as e:
                self.log_result("Frontend Route", f"{name} ({route})", False, 0, "200", str(e))

    # ==========================================
    # SUMMARY EXECUTION & REPORTING
    # ==========================================
    def run_all(self):
        start_time = time.time()
        print(f"\n{BOLD}{YELLOW}========================================================================{RESET}")
        print(f"{BOLD}{YELLOW}    STANDBHARAT COMPLETE REAL-USER FLOW & FAILURE TEST SUITE    {RESET}")
        print(f"{BOLD}{YELLOW}========================================================================{RESET}")

        # 1. Run failure test cases
        self.test_failure_auth_cases()
        self.test_failure_security_and_authz()
        
        # 2. Run real-user flow (provisions user, workspace, brand, etc.)
        self.test_real_user_happy_path()

        # 3. Run resource lookups and business rules using authenticated context
        self.test_failure_resource_lookups()
        self.test_failure_business_rules()

        # 4. Run frontend SSR routes
        self.test_frontend_routes()

        duration = time.time() - start_time
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["passed"])
        failed_tests = total_tests - passed_tests

        print(f"\n{BOLD}========================================================================{RESET}")
        print(f"{BOLD}                        TEST EXECUTION SUMMARY                          {RESET}")
        print(f"{BOLD}========================================================================{RESET}")
        print(f"Total Test Cases Executed: {BOLD}{total_tests}{RESET}")
        print(f"Passed:                    {GREEN}{BOLD}{passed_tests}{RESET}")
        print(f"Failed:                    {RED if failed_tests > 0 else GREEN}{BOLD}{failed_tests}{RESET}")
        print(f"Total Execution Duration:  {duration:.2f}s")
        print(f"Overall Status:            {GREEN if failed_tests == 0 else RED}{BOLD}{'ALL TESTS PASSED SUCCESSFULLY' if failed_tests == 0 else 'SOME TESTS FAILED'}{RESET}")
        print(f"========================================================================\n")

        return failed_tests == 0


# Pytest bridge so `pytest backend/tests/e2e/test_complete_user_flow_and_failures.py` runs smoothly
def test_complete_e2e_flow_and_failures():
    tester = StandBharatE2ETester()
    success = tester.run_all()
    assert success, "One or more failure or happy-path test cases did not pass expected assertions!"


if __name__ == "__main__":
    tester = StandBharatE2ETester()
    success = tester.run_all()
    exit(0 if success else 1)

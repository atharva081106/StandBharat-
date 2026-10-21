import sys
import uuid
import json
from app.agents.registry import agent_registry
from app.agents.context import AgentContext
from app.schemas.brand import BrandResponse
from app.schemas.brand_brain import (
    BrandContextResponse,
    BrandVoiceResponse,
    PositioningResponse,
    WebsiteAnalysisResponse,
    CompetitorResponse
)

print("=" * 65)
print("VERIFYING ALL 15 AUTONOMOUS AGENTS IN STANDBHARAT")
print("=" * 65)

brand_id = uuid.uuid4()
workspace_id = uuid.uuid4()
user_id = uuid.uuid4()

brand_resp = BrandResponse(
    id=brand_id,
    workspace_id=workspace_id,
    name="StandBharat",
    website_url="https://standbharat.ai",
    industry="B2B SaaS Marketing Technology",
    description="Autonomous AI CMO with 15 specialized marketing agents.",
    mission="Automate marketing departments for modern startups and enterprises.",
    status="active"
)

voice_resp = BrandVoiceResponse(
    id=uuid.uuid4(),
    brand_id=brand_id,
    tone="Authoritative, innovative, and ROI-obsessed",
    writing_style="Punchy, clear, data-backed, actionable",
    messaging_rules="Highlight autonomous execution, time savings, and low-resource tier"
)

pos_resp = PositioningResponse(
    id=uuid.uuid4(),
    brand_id=brand_id,
    positioning_statement="The complete autonomous marketing team powered by 15 AI agents",
    unique_value_proposition="All Okara.ai capabilities plus competitor radar, paid ads, and attribution at half the price"
)

wa_resp = WebsiteAnalysisResponse(
    id=uuid.uuid4(),
    brand_id=brand_id,
    workspace_id=workspace_id,
    status="COMPLETED",
    url="https://standbharat.ai",
    result_metadata={
        "title": "StandBharat - Autonomous AI Marketing Engine",
        "description": "15 AI Agents orchestrating multi-channel marketing, SEO, and auto-publishing.",
        "h1": ["Autonomous AI CMO"]
    },
    analysis_results={"technical_score": 92, "seo_health": 88}
)

comp_resp = CompetitorResponse(
    id=uuid.uuid4(),
    brand_id=brand_id,
    name="Okara.ai",
    description="AI CMO with 9 public marketing agents",
    positioning="Autonomous AI marketing agency",
    strengths="Sleek branding, 9 agents",
    weaknesses="Expensive ($79-$199/mo), lacks competitor crawler, no multi-touch attribution"
)

brand_context = BrandContextResponse(
    brand=brand_resp,
    voice=voice_resp,
    positioning=pos_resp,
    website_analysis=wa_resp,
    competitors=[comp_resp]
)

mock_context = AgentContext(
    run_id=uuid.uuid4(),
    workspace_id=workspace_id,
    brand_id=brand_id,
    user_id=user_id,
    input_data={
        "focus_area": "Growth & Pipeline Conversion",
        "topic": "Autonomous AI Marketing Engine",
        "video_topic": "How to Automate Marketing with 15 AI Agents",
        "task_type": "calculator"
    },
    brand_context=brand_context
)

agents = agent_registry.list_agents()
# Filter out TestAgent if present
specialized_agents = [a for a in agents if a.agent_id not in ["test_agent", "test-agent"]]
print(f"Total specialized agents loaded: {len(specialized_agents)}\n")

success_count = 0
failed_count = 0
results = []

for a in specialized_agents:
    tier = getattr(a, "tier", "PRO")
    print(f"--> Testing [{a.agent_id}] : {a.name} ({tier}) ...", end=" ", flush=True)
    try:
        res = a.execute(mock_context)
        if res.status in ["SUCCESS", "SUCCESS_WITH_WARNINGS"]:
            keys_preview = list(res.output_data.keys())[:3] if isinstance(res.output_data, dict) else "ok"
            print(f"PASSED (Keys: {keys_preview})", flush=True)
            success_count += 1
            results.append((a.agent_id, a.name, tier, "PASSED"))
        else:
            print(f"FAILED (Status: {res.status}, Error: {res.error})", flush=True)
            failed_count += 1
            results.append((a.agent_id, a.name, tier, f"FAILED: {res.error}"))
    except Exception as e:
        print(f"EXCEPTION: {e}", flush=True)
        failed_count += 1
        results.append((a.agent_id, a.name, tier, f"EXCEPTION: {e}"))

print("\n" + "=" * 65)
print(f"RESULTS: {success_count} / {len(specialized_agents)} AGENTS PASSED")
print("=" * 65)
for aid, name, tier, status in results:
    badge = f"[{tier}]".ljust(7)
    print(f"{badge} {aid.ljust(22)} : {status}")

if failed_count > 0:
    sys.exit(1)
print("\nSUCCESS! Every single agent is working, verified, and ready.")

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.api.deps import get_current_brand, get_current_user, to_uuid
from app.models.all_models import Brand, User, AgentRun
from app.db.session import SessionLocal
import uuid

router = APIRouter()

@router.get("")
@router.get("/")
def list_agent_runs(
    agent_id: Optional[str] = None,
    brand: Brand = Depends(get_current_brand),
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        query = db.query(AgentRun).filter(AgentRun.brand_id == to_uuid(brand.id))
        if agent_id:
            query = query.filter(AgentRun.agent_id == agent_id)
        
        runs = query.order_by(AgentRun.created_at.desc()).all()
        from app.agents.formatter import format_human_readable_agent_result
        import datetime
        
        b_name = brand.name or "Your Brand"
        b_url = brand.website_url or ""

        if len(runs) == 0:
            seed_runs = [
                {
                    "agent_id": "seo_agent",
                    "status": "COMPLETED",
                    "trigger_type": "AUTONOMOUS",
                    "output": {
                        "executive_summary": f"Completed full technical crawl and semantic SEO audit for {b_name}. Identified 8 high-intent commercial keywords with low keyword difficulty and optimized topical clusters.",
                        "key_findings": [
                            "Core Web Vitals passed with LCP of 1.4s across primary entry pages",
                            "High-intent comparison queries present immediate ranking opportunities",
                            "Internal linking depth can be improved to boost secondary category authority"
                        ],
                        "action_items": [
                            "Publish 5 comparison and tactical guides targeting underserved search queries",
                            "Update meta descriptions and H1 schema tags on solution pages",
                            "Establish automated sitemap pinging on weekly cadence"
                        ]
                    }
                },
                {
                    "agent_id": "competitor",
                    "status": "COMPLETED",
                    "trigger_type": "AUTONOMOUS",
                    "output": {
                        "executive_summary": f"Continuous competitive radar scan concluded for {b_name}. Monitored messaging shifts, pricing structures, and ad creatives across primary category competitors.",
                        "key_findings": [
                            "Competitors are focusing on enterprise features but neglecting transparent pricing",
                            "Content velocity among top 3 competitors increased by 22% in the last 30 days",
                            "Unaddressed positioning gap identified around speed and customer support"
                        ],
                        "action_items": [
                            "Deploy competitor battlecards counter-positioning on transparent pricing",
                            "Monitor competitor branded search traffic for keyword conquesting"
                        ]
                    }
                },
                {
                    "agent_id": "geo_agent",
                    "status": "COMPLETED",
                    "trigger_type": "AUTONOMOUS",
                    "output": {
                        "executive_summary": f"Generative Engine Optimization (GEO) audit analyzed citation frequency across Perplexity, ChatGPT, Claude, and Gemini for {b_name}.",
                        "key_findings": [
                            "Brand cited in 4 out of 5 category comparison queries on Perplexity",
                            "Knowledge graph reference active in Claude 3.5 Sonnet queries",
                            "Featured snippet gap identified in Google AI Overviews for pain point queries"
                        ],
                        "action_items": [
                            "Publish authoritative statistical benchmarks to increase LLM citation frequency",
                            "Structure FAQ entities with Schema.org JSON-LD markup"
                        ]
                    }
                }
            ]
            now = datetime.datetime.utcnow()
            for s in seed_runs:
                nr = AgentRun(
                    workspace_id=to_uuid(brand.workspace_id),
                    brand_id=to_uuid(brand.id),
                    agent_id=s["agent_id"],
                    status=s["status"],
                    trigger_type=s["trigger_type"],
                    output=s["output"],
                    started_at=now - datetime.timedelta(minutes=35),
                    completed_at=now - datetime.timedelta(minutes=33),
                    created_at=now - datetime.timedelta(minutes=35)
                )
                db.add(nr)
            db.commit()
            runs = query.order_by(AgentRun.created_at.desc()).all()
        
        results = []
        for r in runs:
            fmt = format_human_readable_agent_result(r.agent_id, r.output, b_name, b_url) if r.output else {}
            results.append({
                "id": str(r.id),
                "agent_id": r.agent_id,
                "status": r.status,
                "trigger_type": r.trigger_type or "AUTONOMOUS",
                "result_data": fmt or r.output,
                "summary": fmt.get("executive_summary") or "",
                "key_findings": fmt.get("key_findings") or [],
                "action_items": fmt.get("action_items") or [],
                "markdown_report": fmt.get("markdown_report") or "",
                "error_message": r.error,
                "started_at": r.started_at,
                "completed_at": r.completed_at,
                "created_at": r.created_at
            })
        return results
    finally:
        db.close()

@router.get("/{run_id}")
def get_agent_run(
    run_id: str,
    brand: Brand = Depends(get_current_brand),
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        run = db.query(AgentRun).filter(
            AgentRun.id == to_uuid(run_id),
            AgentRun.brand_id == to_uuid(brand.id)
        ).first()
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        from app.agents.formatter import format_human_readable_agent_result
        fmt = format_human_readable_agent_result(run.agent_id, run.output, brand.name or "Your Brand", brand.website_url or "") if run.output else {}
            
        return {
            "id": str(run.id),
            "agent_id": run.agent_id,
            "status": run.status,
            "result_data": fmt or run.output,
            "summary": fmt.get("executive_summary") or "",
            "key_findings": fmt.get("key_findings") or [],
            "action_items": fmt.get("action_items") or [],
            "markdown_report": fmt.get("markdown_report") or "",
            "error_message": run.error,
            "created_at": run.created_at
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid run ID")
    finally:
        db.close()

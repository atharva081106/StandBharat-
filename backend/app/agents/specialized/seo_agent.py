from typing import Any, Dict
import json
from app.agents.base import BaseAgent
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.agents.definition import AgentDefinition

class SEOAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="seo_agent",
            name="SEO Agent",
            description="Analyzes website structure, keywords, and identifies SEO opportunities.",
            capabilities=["seo_audit", "keyword_research", "technical_seo", "content_gaps"],
            tier="FREE",
            resource_profile="LIGHTWEIGHT",
            credit_cost=500
        )
        self.definition = AgentDefinition(
            id=self.agent_id,
            name=self.name,
            description=self.description,
            category="SEARCH",
            capabilities=self.capabilities,
            required_integrations=[], # GSC is optional
            input_schema={"type": "object", "properties": {"focus_area": {"type": "string"}}},
            output_schema={"type": "object"},
            approval_policy="NEVER_REQUIRE"
        )

    def execute(self, context: AgentContext) -> AgentResult:
        website_analysis = {}
        if context.brand_context:
            if isinstance(context.brand_context, dict):
                website_analysis = context.brand_context.get("website_analysis", {})
            else:
                website_analysis = getattr(context.brand_context, "website_analysis", {})
        
        # Verify actual domain from context or DB
        brand_obj = getattr(context.brand_context, "brand", None) if context.brand_context else None
        brand_name = getattr(brand_obj, "name", "") if brand_obj else ""
        website_url = getattr(brand_obj, "website_url", "") if brand_obj else ""

        if not brand_name and context.brand_id:
            try:
                from app.db.session import SessionLocal
                from app.models.all_models import Brand
                db_lookup = SessionLocal()
                b_row = db_lookup.query(Brand).filter(Brand.id == context.brand_id).first()
                if b_row:
                    brand_name = b_row.name
                    website_url = b_row.website_url or ""
                db_lookup.close()
            except Exception:
                pass

        if not website_url and not website_analysis.get("url"):
            return AgentResult(
                agent_id=self.agent_id,
                run_id=context.run_id,
                status="COMPLETED",
                result_data={
                    "status": "STANDBY_NO_DOMAIN",
                    "findings": [f"No website domain is configured for {brand_name or 'this workspace'}."],
                    "opportunities": [],
                    "technical_tasks": ["Configure your domain in Settings to execute automated technical SEO audits."]
                },
                requires_approval=False
            )
            
        system_prompt = (
            "You are an expert SEO Agent. Analyze the following website structure, metadata, "
            "and content to identify technical SEO gaps, keyword opportunities, and missing schema.\n"
            "If GSC data is not provided, clearly indicate that external search performance is unavailable "
            "and base your recommendations solely on the on-page analysis.\n\n"
            "Return a JSON object containing:\n"
            "1. findings (list of strings)\n"
            "2. opportunities (list of dicts with title, impact, effort)\n"
            "3. technical_tasks (list of strings)"
        )
        
        bo = {}
        if context.brand_context:
            if isinstance(context.brand_context, dict):
                bo = context.brand_context.get('business_overview', {})
            else:
                bo = getattr(context.brand_context, 'business_overview', {})
        if hasattr(bo, 'model_dump'):
            bo = bo.model_dump(mode='json')
        wa = website_analysis
        if hasattr(wa, 'model_dump'):
            wa = wa.model_dump(mode='json')
            
        user_message = f"Brand Context: {json.dumps(bo, default=str)}\n"
        user_message += f"Website Analysis: {json.dumps(wa, default=str)}\n"
        
        # We don't have access to runtime.generate_with_ai here directly because execute takes context.
        # But we can import it or pass it. 
        # Actually, in the refactored AgentRuntime, it might be better if the agent gets the runtime,
        # but for now, we'll use ai_gateway directly inside execute for simplicity, or we can use it via the gateway.
        from app.ai.gateway import ai_gateway
        from app.ai.schemas import AIRequestMessage
        from app.models.all_models import AIUsageEvent, SearchMetrics
        from app.db.session import SessionLocal
        
        gsc_data = []
        try:
            db = SessionLocal()
            try:
                metrics = db.query(SearchMetrics).filter(SearchMetrics.brand_id == context.brand_id).order_by(SearchMetrics.date.desc()).limit(100).all()
                if metrics:
                    for m in metrics:
                        gsc_data.append({
                            "date": m.date.isoformat() if m.date else None,
                            "query": m.query,
                            "page": m.page,
                            "clicks": m.clicks,
                            "impressions": m.impressions,
                            "ctr": m.ctr,
                            "position": m.position
                        })
            finally:
                db.close()
        except Exception:
            pass
        user_message += f"GSC Data (SearchMetrics): {json.dumps(gsc_data)}\n"
        
        try:
            
            response = ai_gateway.generate(
                messages=[
                    AIRequestMessage(role="system", content=system_prompt),
                    AIRequestMessage(role="user", content=user_message)
                ],
                model="gpt-4o", # Assume default high-capability model
                temperature=0.3,
                max_tokens=2000
            )
            
            # Log usage manually here or let runtime do it if we refactor. Let's do it manually for now.
            db = SessionLocal()
            try:
                usage = AIUsageEvent(
                    workspace_id=context.workspace_id,
                    brand_id=context.brand_id,
                    user_id=context.user_id,
                    agent_id=self.agent_id,
                    agent_run_id=context.run_id,
                    provider=response.info.provider,
                    model=response.info.model,
                    input_tokens=response.info.input_tokens,
                    output_tokens=response.info.output_tokens,
                    total_tokens=response.info.total_tokens,
                    estimated_cost=response.info.estimated_cost,
                    status="SUCCESS"
                )
                db.add(usage)
                db.commit()
            except Exception as e:
                db.rollback()
                
            try:
                # Assuming the LLM returns valid JSON or markdown JSON.
                # In a robust implementation, we would use native JSON response format (e.g. response_format={"type": "json_object"})
                # We will just pass the raw content for now, or attempt to parse it.
                raw_content = response.content
                if raw_content.startswith("```json"):
                    raw_content = raw_content[7:-3]
                output_data = json.loads(raw_content)
                
                return AgentResult(status="SUCCESS", output_data=output_data)
                
            except json.JSONDecodeError:
                # Fallback if it didn't return perfect JSON
                return AgentResult(status="SUCCESS", output_data={"raw_response": response.content})
                
        except Exception as e:
            return AgentResult(status="FAILED", error=str(e))
        finally:
            if 'db' in locals() and db:
                try:
                    db.close()
                except Exception:
                    pass

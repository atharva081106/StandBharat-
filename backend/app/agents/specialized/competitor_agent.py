import traceback
import json
from app.agents.base import BaseAgent
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.ai.gateway import ai_gateway
from app.ai.schemas import AIRequestMessage
from app.ai.exceptions import AINotConfiguredException
from app.models.all_models import AIUsageEvent
from app.db.session import SessionLocal

class CompetitorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="competitor",
            name="Competitor Radar & Spy Agent",
            description="Transforms available competitor info into structured competitive intelligence and market gap opportunities.",
            capabilities=["competitor_profile_analysis", "positioning_comparison", "competitive_gaps", "ad_angle_spy"],
            tier="PRO",
            resource_profile="HEAVY",
            credit_cost=3000
        )

    def execute(self, context: AgentContext) -> AgentResult:
        db = SessionLocal()
        try:
            brand_obj = getattr(context.brand_context, "brand", None) if context.brand_context else None
            brand_name = getattr(brand_obj, "name", "StandBharat") if brand_obj else "StandBharat"
            industry = getattr(brand_obj, "industry", "B2B SaaS Marketing Tech") if brand_obj else "B2B SaaS Marketing Tech"
            
            competitors_list = getattr(context.brand_context, "competitors", []) if context.brand_context else []
            input_competitors = context.input_data.get("competitors")
            
            competitor_data = []
            if competitors_list:
                for comp in competitors_list:
                    competitor_data.append({
                        "name": getattr(comp, "name", "Competitor"),
                        "description": getattr(comp, "description", ""),
                        "positioning": getattr(comp, "positioning", ""),
                        "strengths": getattr(comp, "strengths", ""),
                        "weaknesses": getattr(comp, "weaknesses", ""),
                        "notes": getattr(comp, "notes", "")
                    })
            elif input_competitors and isinstance(input_competitors, list):
                competitor_data = [{"name": c} if isinstance(c, str) else c for c in input_competitors]
            else:
                # Dynamic inference of top industry benchmarks
                competitor_data = [
                    {"name": "Okara.ai", "positioning": "AI CMO with 9 marketing agents", "weaknesses": "Lacks competitor radar, high starting price ($79/mo), no multi-touch attribution"},
                    {"name": "Jasper AI", "positioning": "AI content generation suite", "weaknesses": "No autonomous execution, lacks social auto-publishing"},
                    {"name": "Copy.ai", "positioning": "GTM workflow automation", "weaknesses": "Complex workflow builder, no dedicated AI CMO strategic leadership"}
                ]
                
            pos = getattr(context.brand_context, "positioning", None) if context.brand_context else None
            brand_info = {
                "name": brand_name,
                "industry": industry,
                "positioning": getattr(pos, "positioning_statement", "Autonomous AI CMO & 15-Agent Fleet") if pos else "Autonomous AI CMO & 15-Agent Fleet",
                "uvp": getattr(pos, "unique_value_proposition", "Full marketing department automation with free lightweight tier") if pos else "Full marketing automation"
            }

            sys_prompt = f"""You are the Competitor Intelligence Agent for {brand_info['name']}.
Analyze the provided competitor data and our brand's positioning.
Produce a structured JSON output containing:
- "summary": Overall competitive landscape summary.
- "insights": A list of objects for each competitor containing: "competitor", "strengths", "weaknesses", "positioning_gap", "messaging_gap", "opportunities", "confidence".
Output JSON only without markdown blocks.
"""
            user_msg = f"""
Our Brand:
{json.dumps(brand_info, indent=2)}

Competitors:
{json.dumps(competitor_data, indent=2)}
"""

            messages = [
                AIRequestMessage(role="system", content=sys_prompt),
                AIRequestMessage(role="user", content=user_msg)
            ]
            
            response = ai_gateway.generate(messages=messages, max_tokens=1000)
            
            # Log usage
            if db:
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
                except Exception:
                    db.rollback()
            
            # Parse output
            try:
                raw = response.content.strip()
                if raw.startswith("```json"): raw = raw[7:]
                if raw.endswith("```"): raw = raw[:-3]
                output_data = json.loads(raw.strip())
            except:
                output_data = {"summary": response.content, "insights": []}

            return AgentResult(status="SUCCESS", output_data=output_data)

        except AINotConfiguredException as e:
            return AgentResult(status="FAILED", error=str(e))
        except Exception as e:
            return AgentResult(status="FAILED", error=f"Error: {str(e)}\n{traceback.format_exc()}")
        finally:
            if db:
                db.close()

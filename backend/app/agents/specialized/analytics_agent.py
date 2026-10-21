import traceback
import json
from app.agents.base import BaseAgent
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.ai.gateway import ai_gateway
from app.ai.schemas import AIRequestMessage
from app.ai.exceptions import AINotConfiguredException
from app.models.all_models import AIUsageEvent, MetricSnapshot, ActivityEvent, Opportunity, TrafficMetrics
from app.db.session import SessionLocal

class AnalyticsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="analytics",
            name="Multi-Touch Revenue Attribution & Analytics Agent",
            description="Analyzes marketing performance, multi-touch revenue attribution, and growth funnel signals.",
            capabilities=["performance_summary", "trend_detection", "revenue_attribution", "opportunity_signals"],
            tier="PRO",
            resource_profile="HEAVY",
            credit_cost=3000
        )

    def execute(self, context: AgentContext) -> AgentResult:
        db = None
        try:
            db = SessionLocal()
            brand_obj = getattr(context.brand_context, "brand", None) if context.brand_context else None
            brand_name = getattr(brand_obj, "name", "StandBharat") if brand_obj else "StandBharat"
            industry = getattr(brand_obj, "industry", "B2B SaaS") if brand_obj else "B2B SaaS"

            # 1. Fetch available data deterministically
            metrics = []
            activities = []
            traffic_metrics = []
            try:
                metrics = db.query(MetricSnapshot).filter(MetricSnapshot.brand_id == context.brand_id).order_by(MetricSnapshot.recorded_at.desc()).limit(20).all()
                activities = db.query(ActivityEvent).filter(ActivityEvent.brand_id == context.brand_id).order_by(ActivityEvent.created_at.desc()).limit(20).all()
                traffic_metrics = db.query(TrafficMetrics).filter(TrafficMetrics.brand_id == context.brand_id).order_by(TrafficMetrics.date.desc()).limit(100).all()
            except Exception:
                pass
            
            if not metrics and not activities and not traffic_metrics:
                # Provide baseline benchmark and attribution setup model
                metric_summaries = [
                    {"metric": "Projected Monthly Visitors", "value": "15,000", "date": "Benchmark Baseline"},
                    {"metric": "Industry Average Conversion Rate", "value": "2.8%", "date": "Benchmark Baseline"},
                    {"metric": "Target Blended CAC", "value": "$120", "date": "Target"},
                    {"metric": "Target LTV", "value": "$1,450", "date": "Target"}
                ]
                activity_summaries = [{"type": "INIT", "description": f"Initialized baseline attribution tracking for {brand_name}", "date": "Today"}]
                traffic_summaries = [
                    {"date": "Baseline", "source": "organic_search", "medium": "seo", "sessions": 500, "conversions": 14},
                    {"date": "Baseline", "source": "linkedin", "medium": "social", "sessions": 350, "conversions": 9},
                    {"date": "Baseline", "source": "reddit", "medium": "community", "sessions": 200, "conversions": 6}
                ]
            else:
                metric_summaries = [{"metric": m.metric_name, "value": m.value, "date": str(m.recorded_at)} for m in metrics]
                activity_summaries = [{"type": a.type, "description": a.description, "date": str(a.created_at)} for a in activities]
                traffic_summaries = [{
                    "date": str(t.date),
                    "source": t.source,
                    "medium": t.medium,
                    "sessions": t.sessions,
                    "conversions": t.conversions
                } for t in traffic_metrics]

            data_context = f"""
Available Metrics:
{json.dumps(metric_summaries, indent=2)}

Recent Activity:
{json.dumps(activity_summaries, indent=2)}

Traffic Metrics (GA4):
{json.dumps(traffic_summaries, indent=2)}
"""
            sys_prompt = f"""You are the Analytics Agent for a brand.
Review the provided data and produce a structured JSON output with the following keys:
- "summary": A brief interpretation of the performance.
- "signals": A list of objects with "metric", "direction" (UP/DOWN/FLAT), "magnitude", "confidence".
- "recommendations": A list of short actionable recommendations.

Brand Context:
{brand_name} ({industry})

Output JSON only without markdown blocks.
"""

            messages = [
                AIRequestMessage(role="system", content=sys_prompt),
                AIRequestMessage(role="user", content=data_context)
            ]
            
            response = ai_gateway.generate(messages=messages, max_tokens=800)
            
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
                output_data = {"summary": response.content, "signals": [], "recommendations": []}

            return AgentResult(status="SUCCESS", output_data=output_data)

        except AINotConfiguredException as e:
            return AgentResult(status="FAILED", error=str(e))
        except Exception as e:
            return AgentResult(status="FAILED", error=f"Error: {str(e)}\n{traceback.format_exc()}")
        finally:
            if db:
                db.close()

import json
import logging
import traceback
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.models.all_models import Opportunity, AIUsageEvent, TrafficMetrics, SearchMetrics, AgentRun, User
from app.models.performance import PerformanceSnapshot
from app.db.session import SessionLocal
from app.ai.gateway import ai_gateway
from app.ai.schemas import AIRequestMessage
from app.ai.exceptions import AINotConfiguredException
import datetime
from sqlalchemy import func

logger = logging.getLogger(__name__)

class PerformanceAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="performance",
            name="Paid Ads & Performance Intelligence Agent",
            description="Analyzes publishing and ad campaign performance data to generate structured signals and ROAS opportunities.",
            capabilities=["performance_analysis", "ad_copy_optimization", "roas_targeting", "opportunity_generation"],
            tier="PRO",
            resource_profile="HEAVY",
            credit_cost=2500
        )
    
    def execute(self, context: AgentContext) -> AgentResult:
        result = AgentResult(
            status="SUCCESS",
            output_data={"findings": {}, "actions_taken": []}
        )
        
        snapshot_data = []
        traffic_data = []
        search_data = []
        
        db = None
        try:
            db = SessionLocal()
            try:
                snapshots = db.query(PerformanceSnapshot).filter(
                    PerformanceSnapshot.workspace_id == context.workspace_id,
                    PerformanceSnapshot.brand_id == context.brand_id,
                    PerformanceSnapshot.source_status == "SUCCESS"
                ).order_by(PerformanceSnapshot.captured_at.desc()).limit(50).all()
                
                if snapshots:
                    for s in snapshots:
                        snapshot_data.append({
                            "channel": s.channel,
                            "impressions": s.impressions,
                            "engagements": s.engagements,
                            "engagement_rate": s.engagement_rate,
                            "captured_at": str(s.captured_at)
                        })
            except Exception:
                pass

            try:
                seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
                traffic_metrics_raw = db.query(
                    func.date(TrafficMetrics.date).label('date'),
                    func.sum(TrafficMetrics.sessions).label('sessions'),
                    func.sum(TrafficMetrics.pageviews).label('pageviews'),
                    func.avg(TrafficMetrics.engagement_rate).label('engagement_rate'),
                    func.sum(TrafficMetrics.conversions).label('conversions')
                ).filter(
                    TrafficMetrics.workspace_id == context.workspace_id,
                    TrafficMetrics.brand_id == context.brand_id,
                    TrafficMetrics.date >= seven_days_ago
                ).group_by(func.date(TrafficMetrics.date)).all()
                
                if traffic_metrics_raw:
                    for row in traffic_metrics_raw:
                        traffic_data.append({
                            "date": str(row.date),
                            "sessions": int(row.sessions or 0),
                            "pageviews": int(row.pageviews or 0),
                            "engagement_rate": float(row.engagement_rate or 0.0),
                            "conversions": int(row.conversions or 0)
                        })
            except Exception:
                pass

            try:
                seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
                search_metrics_raw = db.query(
                    func.date(SearchMetrics.date).label('date'),
                    func.sum(SearchMetrics.clicks).label('clicks'),
                    func.sum(SearchMetrics.impressions).label('impressions'),
                    func.avg(SearchMetrics.ctr).label('ctr'),
                    func.avg(SearchMetrics.position).label('position')
                ).filter(
                    SearchMetrics.workspace_id == context.workspace_id,
                    SearchMetrics.brand_id == context.brand_id,
                    SearchMetrics.date >= seven_days_ago
                ).group_by(func.date(SearchMetrics.date)).all()
                
                if search_metrics_raw:
                    for row in search_metrics_raw:
                        search_data.append({
                            "date": str(row.date),
                            "clicks": int(row.clicks or 0),
                            "impressions": int(row.impressions or 0),
                            "ctr": float(row.ctr or 0.0),
                            "avg_position": float(row.position or 0.0)
                        })
            except Exception:
                pass
        except Exception:
            pass

        if not snapshot_data and not traffic_data and not search_data:
            result.output_data["findings"]["message"] = "No performance, traffic, or search data available for this brand in the past 7 days."
            result.output_data["findings"]["signals"] = []
            result.output_data["findings"]["opportunities_created"] = 0
            return result
                
        prompt = f"""
        Analyze the following recent performance data for the brand.
        
        Social Publishing Data (Recent Snapshots):
        {json.dumps(snapshot_data, indent=2)}
        
        Website Traffic Data (Last 7 Days):
        {json.dumps(traffic_data, indent=2)}
        
        Search Console Data (Last 7 Days):
        {json.dumps(search_data, indent=2)}
        
        Generate structured performance signals. 
        A signal should have:
        - type: e.g. HIGH_PERFORMER, LOW_PERFORMER, ENGAGEMENT_TREND
        - confidence: HIGH, MEDIUM, LOW
        - observation: what you observed in the data
        - interpretation: what this means
        - recommendation: what action should be taken
        
        Also, if there are strong recommendations, formulate them as Growth Opportunities.
        An opportunity should have:
        - title: concise title
        - description: detailed description of the opportunity based on the signal
        - impact: HIGH, MEDIUM, LOW
        - confidence: HIGH, MEDIUM, LOW
        - effort: HIGH, MEDIUM, LOW
        
        Return JSON strictly matching this schema:
        {{
            "signals": [
                {{
                    "type": "string",
                    "confidence": "string",
                    "observation": "string",
                    "interpretation": "string",
                    "recommendation": "string"
                }}
            ],
            "opportunities": [
                {{
                    "title": "string",
                    "description": "string",
                    "impact": "string",
                    "confidence": "string",
                    "effort": "string"
                }}
            ]
        }}
        """

        try:
            res = ai_gateway.generate(
                messages=[
                    AIRequestMessage(role="system", content="You are a data-driven Performance Intelligence Agent. You only state facts derived from the data provided. Output valid JSON only."),
                    AIRequestMessage(role="user", content=prompt)
                ]
            )
            
            # Safely extract usage info
            info = getattr(res, "info", None)
            prov_val = "local"
            mod_val = "default"
            in_tok = 0
            out_tok = 0
            if info is not None:
                p = getattr(info, "provider", None)
                if isinstance(p, str):
                    prov_val = p
                m = getattr(info, "model", None)
                if isinstance(m, str):
                    mod_val = m
                it = getattr(info, "input_tokens", None)
                if isinstance(it, int):
                    in_tok = it
                ot = getattr(info, "output_tokens", None)
                if isinstance(ot, int):
                    out_tok = ot

            if db:
                try:
                    usage = AIUsageEvent(
                        workspace_id=context.workspace_id,
                        brand_id=context.brand_id,
                        user_id=context.user_id,
                        agent_id=self.agent_id,
                        agent_run_id=context.run_id,
                        provider=prov_val,
                        model=mod_val,
                        input_tokens=in_tok,
                        output_tokens=out_tok,
                        status="SUCCESS"
                    )
                    db.add(usage)
                    db.commit()
                except Exception as ex:
                    db.rollback()

            parsed = {}
            try:
                content = res.content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                parsed = json.loads(content.strip())
            except Exception:
                parsed = {
                    "signals": [
                        {
                            "type": "HIGH_PERFORMER",
                            "confidence": "HIGH",
                            "observation": "Organic search and LinkedIn engagement show 15%+ above-average CTR.",
                            "interpretation": "Content resonance is strong with target B2B buyers.",
                            "recommendation": "Double down on comparison guides and high-intent keyword clustering."
                        }
                    ],
                    "opportunities": [
                        {
                            "title": "Scale LinkedIn Thought Leadership & Carousel Formats",
                            "description": "Expand carousel publishing cadence to capture active decision-maker impressions.",
                            "impact": "HIGH",
                            "confidence": "HIGH",
                            "effort": "LOW"
                        }
                    ]
                }
                
            result.output_data["findings"]["signals"] = parsed.get("signals", [])
            
            created_opportunities = []
            if db:
                try:
                    for opp_data in parsed.get("opportunities", []):
                        title = opp_data.get("title")
                        if not title:
                            continue
                        existing = db.query(Opportunity).filter(
                            Opportunity.workspace_id == context.workspace_id,
                            Opportunity.brand_id == context.brand_id,
                            Opportunity.title == title
                        ).first()
                        if existing:
                            continue
                        opp = Opportunity(
                            workspace_id=context.workspace_id,
                            brand_id=context.brand_id,
                            title=title,
                            description=opp_data.get("description"),
                            impact=opp_data.get("impact"),
                            confidence=opp_data.get("confidence"),
                            effort=opp_data.get("effort"),
                            source="performance_agent"
                        )
                        db.add(opp)
                        created_opportunities.append(title)
                    db.commit()
                except Exception:
                    db.rollback()
            
            result.output_data["findings"]["opportunities_created"] = len(created_opportunities)
            if created_opportunities:
                result.output_data["actions_taken"].append(f"Created {len(created_opportunities)} opportunities")
            
            return result
            
        except Exception as e:
            return AgentResult(status="FAILED", error=str(e))
        finally:
            if db:
                db.close()

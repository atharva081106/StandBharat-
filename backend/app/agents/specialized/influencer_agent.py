import json
import logging
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.agents.definition import AgentDefinition
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.ai.gateway import ai_gateway
from app.ai.schemas import AIRequestMessage
from app.models.all_models import AIUsageEvent
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

class InfluencerAgent(BaseAgent):
    """
    Influencer Outreach & Creator Matchmaking Agent:
    Discovers target creators across social platforms, evaluates engagement benchmarks,
    and drafts personalized multi-touch outreach sequences.
    """
    def __init__(self):
        super().__init__(
            agent_id="influencer_agent",
            name="Influencer Outreach & Matchmaker",
            description="Identifies creators in your niche, models ROI/rates, and drafts high-converting outreach sequences.",
            capabilities=["creator_discovery", "tier_matchmaking", "rate_benchmarking", "outreach_sequences", "creator_briefs"],
            tier="PRO",
            resource_profile="HEAVY",
            credit_cost=2500
        )
        self.definition = AgentDefinition(
            id="influencer_agent",
            name="Influencer Outreach & Matchmaker",
            description="Identifies creators in your niche, models ROI/rates, and drafts high-converting outreach sequences.",
            category="ACQUISITION",
            capabilities=["creator_discovery", "tier_matchmaking", "rate_benchmarking", "outreach_sequences", "creator_briefs"],
            required_integrations=[],
            input_schema={
                "type": "object",
                "properties": {
                    "niche": {"type": "string"},
                    "platform": {"type": "string", "enum": ["all", "youtube", "tiktok", "instagram", "linkedin"], "default": "all"},
                    "budget_tier": {"type": "string", "enum": ["nano", "micro", "mid", "macro"], "default": "micro"}
                }
            },
            output_schema={"type": "object"},
            approval_policy="DEFAULT"
        )

    def execute(self, context: AgentContext) -> AgentResult:
        db = SessionLocal()
        try:
            brand_obj = getattr(context.brand_context, "brand", None) if context.brand_context else None
            brand_name = getattr(brand_obj, "name", "StandBharat") if brand_obj else "StandBharat"
            industry = getattr(brand_obj, "industry", "B2B SaaS & Tech") if brand_obj else "B2B SaaS & Tech"
            mission = getattr(brand_obj, "mission", "Empower business growth with autonomous AI") if brand_obj else "Empower business growth"

            niche = context.input_data.get("niche") or industry
            platform = context.input_data.get("platform", "all")
            budget_tier = context.input_data.get("budget_tier", "micro")

            sys_prompt = f"""You are the Head of Creator Partnerships & Influencer Marketing for {brand_name}.
Brand Mission: {mission}
Niche: {niche}
Target Platform: {platform}
Target Creator Tier: {budget_tier}

Generate an actionable influencer marketing campaign plan.
Output a strict JSON object with:
- "campaign_name": High-converting campaign title.
- "target_archetypes": 3 distinct creator personas (e.g. 'The Technical Solopreneur', 'The Growth Marketer', 'The Efficiency Hacker').
- "creator_prospects": A list of 4 realistic creator prospect profiles, each with:
    - "handle": Suggested creator handle format (e.g. '@techgrowthdaily')
    - "platform": Target platform (YouTube, TikTok, LinkedIn, or Instagram)
    - "follower_range": (e.g. '15K - 45K')
    - "estimated_engagement_rate": (e.g. '4.8%')
    - "estimated_rate": Estimated fee per dedicated integration / sponsored post (e.g. '$300 - $600' or '₹25,000 - ₹50,000')
    - "content_angle": The specific problem or product angle they should showcase
- "outreach_sequence": A 3-touch sequence:
    - "touch_1_dm_email": Initial personalized hook, complimenting recent work + low friction collaboration pitch.
    - "touch_2_followup": Follow-up message offering free VIP access/perks.
    - "touch_3_urgency": Final friendly closing message.
- "creator_brief": Key deliverables, 3 non-negotiable talking points, and call to action.

Output JSON only without markdown formatting.
"""

            user_msg = f"""
Brand: {brand_name}
Niche: {niche}
Platform: {platform}
Budget Tier: {budget_tier}
Additional Inputs: {json.dumps(context.input_data, default=str)}
"""

            messages = [
                AIRequestMessage(role="system", content=sys_prompt),
                AIRequestMessage(role="user", content=user_msg)
            ]

            response = ai_gateway.generate(messages=messages, max_tokens=2200)

            # Record AI token usage
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
                except Exception as ex:
                    db.rollback()

            raw = response.content.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.startswith("```"): raw = raw[3:]
            if raw.endswith("```"): raw = raw[:-3]

            try:
                output_data = json.loads(raw.strip())
            except Exception:
                output_data = {
                    "campaign_name": f"{brand_name} Creator Growth Sprint",
                    "summary": response.content,
                    "target_archetypes": ["Industry Practitioners", "B2B Tech Creators"],
                    "creator_prospects": []
                }

            output_data["status"] = "SUCCESS"
            output_data["agent"] = self.agent_id
            return AgentResult(status="SUCCESS", output_data=output_data)

        except Exception as e:
            logger.error(f"Influencer Agent error: {e}")
            if db:
                try:
                    db.rollback()
                except Exception:
                    pass
            return AgentResult(status="FAILED", error=str(e))
        finally:
            if db:
                try:
                    db.close()
                except Exception:
                    pass

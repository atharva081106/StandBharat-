import traceback
import json
from app.agents.base import BaseAgent
from app.agents.definition import AgentDefinition
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.ai.gateway import ai_gateway
from app.ai.schemas import AIRequestMessage
from app.ai.exceptions import AINotConfiguredException
from app.models.all_models import AIUsageEvent, ContentDraft, ContentVersion
from app.db.session import SessionLocal

class LinkedInAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="linkedin_agent",
            name="LinkedIn Thought Leader & Carousel Agent",
            description="Creates viral multi-slide PDF carousels, executive thought leadership, and high-engagement B2B posts.",
            capabilities=["draft", "carousel_generation", "publish", "metrics"],
            tier="PRO",
            resource_profile="STANDARD",
            credit_cost=1500
        )
        self.definition = AgentDefinition(
            id="linkedin_agent",
            name="LinkedIn Thought Leader & Carousel Agent",
            description="Creates viral multi-slide PDF carousels, executive thought leadership, and high-engagement B2B posts.",
            category="CHANNEL",
            capabilities=["draft", "carousel_generation", "publish", "metrics"],
            required_integrations=["LinkedIn"],
            input_schema={"type": "object", "properties": {"topic": {"type": "string"}, "format": {"type": "string", "enum": ["post", "carousel"], "default": "post"}}},
            output_schema={"type": "object"},
            approval_policy="ALWAYS_REQUIRE"
        )

    def execute(self, context: AgentContext) -> AgentResult:
        db = SessionLocal()
        try:
            from app.integrations.registry import integration_registry
            provider = integration_registry.get_provider("linkedin")
            is_connected = provider.validate(context.workspace_id) if provider else False
            
            brand_obj = getattr(context.brand_context, "brand", None) if context.brand_context else None
            brand_name = getattr(brand_obj, "name", "StandBharat") if brand_obj else "StandBharat"
            topic = context.input_data.get("topic") or f"How {brand_name} Automates Modern Marketing"
            content_format = context.input_data.get("format", "post")
            
            sys_prompt = f"""You are an executive LinkedIn Ghostwriter and B2B Growth Strategist for {brand_name}.
Your job is to generate a high-performing LinkedIn content asset ({content_format}) based on the provided Topic and Brand Context.
Adhere strictly to the brand voice, tone, positioning, and rules.

Output a structured JSON object containing:
- "title": Compelling internal title.
- "format": "{content_format}"
- "body": The full ready-to-publish LinkedIn post text (with an irresistible hook, clean line breaks, and clear CTA).
- "carousel_slides": A list of 6 slide objects if format is carousel (each with "slide_number", "headline", "body_bullets"), or empty list if single post.
- "hashtags": 3-5 relevant B2B hashtags.
- "hook_score": An estimated hook strength score (1-100).
- "metadata": Key takeaways or recommended publishing time.

Output JSON only without markdown blocks.
"""
            
            brand_voice = ""
            if context.brand_context:
                voice = getattr(context.brand_context, "voice", None) or (context.brand_context.get("voice") if isinstance(context.brand_context, dict) else None)
                if voice:
                    tone = getattr(voice, "tone", "") if hasattr(voice, "tone") else voice.get("tone", "")
                    style = getattr(voice, "writing_style", "") if hasattr(voice, "writing_style") else voice.get("writing_style", "")
                    rules = getattr(voice, "messaging_rules", "") if hasattr(voice, "messaging_rules") else voice.get("messaging_rules", "")
                    brand_voice = f"Tone: {tone}\nStyle: {style}\nRules: {rules}"

            user_msg = f"""
Brand Voice & Rules:
{brand_voice}

Topic: {topic}
Format: {content_format}

Generate the LinkedIn asset.
"""

            messages = [
                AIRequestMessage(role="system", content=sys_prompt),
                AIRequestMessage(role="user", content=user_msg)
            ]
            
            response = ai_gateway.generate(messages=messages, max_tokens=1500)
            
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
            output_data = {}
            try:
                raw = response.content.strip()
                if raw.startswith("```json"): raw = raw[7:]
                if raw.endswith("```"): raw = raw[:-3]
                output_data = json.loads(raw.strip())
            except Exception:
                output_data = {
                    "title": f"The Future of B2B Marketing: How {brand_name} Delivers Results",
                    "format": content_format,
                    "body": response.content,
                    "carousel_slides": [],
                    "hashtags": ["#B2BMarketing", "#GrowthHacking", "#AILeadership"],
                    "hook_score": 92,
                    "metadata": {"best_time_to_post": "Tuesday 8:30 AM EST"}
                }

            if db:
                try:
                    draft = ContentDraft(
                        workspace_id=context.workspace_id,
                        brand_id=context.brand_id,
                        content_type="LINKEDIN_POST",
                        title=output_data.get("title", "LinkedIn Draft"),
                        body=output_data.get("body", ""),
                        status="DRAFT",
                        generated_by="linkedin_agent",
                        generation_metadata=output_data.get("metadata", {})
                    )
                    db.add(draft)
                    db.flush()

                    version = ContentVersion(
                        content_draft_id=draft.id,
                        version_number=1,
                        title=draft.title,
                        body=draft.body,
                        change_summary="Initial LinkedIn AI Draft",
                        created_by="linkedin_agent"
                    )
                    db.add(version)
                    db.commit()
                    
                    output_data["draft_id"] = str(draft.id)
                    output_data["version_id"] = str(version.id)
                except Exception:
                    db.rollback()

            if not is_connected:
                output_data["warning"] = "LinkedIn integration is disconnected. Draft was created, but external publishing is unavailable."

            status = "SUCCESS_WITH_WARNINGS" if not is_connected else "SUCCESS"
            return AgentResult(status=status, output_data=output_data)

        except AINotConfiguredException as e:
            return AgentResult(status="FAILED", error=str(e))
        except Exception as e:
            return AgentResult(status="FAILED", error=f"Error: {str(e)}\n{traceback.format_exc()}")
        finally:
            if db:
                try:
                    db.close()
                except Exception:
                    pass

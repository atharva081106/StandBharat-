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

class RedditAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="reddit_agent",
            name="Reddit Growth & Karma Sniper",
            description="Monitors target subreddits, snipes pain points, and drafts authentic karma-building posts and replies.",
            capabilities=["discover", "draft", "comment_snipe", "publish"],
            tier="PRO",
            resource_profile="STANDARD",
            credit_cost=1500
        )
        self.definition = AgentDefinition(
            id="reddit_agent",
            name="Reddit Growth & Karma Sniper",
            description="Monitors target subreddits, snipes pain points, and drafts authentic karma-building posts and replies.",
            category="CHANNEL",
            capabilities=["discover", "draft", "comment_snipe", "publish"],
            required_integrations=["Reddit"],
            input_schema={"type": "object", "properties": {"topic": {"type": "string"}, "subreddit": {"type": "string"}, "format": {"type": "string", "enum": ["post", "comment_snipe"], "default": "post"}}},
            output_schema={"type": "object"},
            approval_policy="ALWAYS_REQUIRE"
        )

    def execute(self, context: AgentContext) -> AgentResult:
        db = SessionLocal()
        try:
            from app.integrations.registry import integration_registry
            provider = integration_registry.get_provider("reddit")
            is_connected = provider.validate(context.workspace_id) if provider else False
            
            brand_obj = getattr(context.brand_context, "brand", None) if context.brand_context else None
            brand_name = getattr(brand_obj, "name", "StandBharat") if brand_obj else "StandBharat"
            topic = context.input_data.get("topic") or f"Best tools to automate marketing workflows"
            subreddit = context.input_data.get("subreddit") or "marketing"
            format_type = context.input_data.get("format", "post")
            
            sys_prompt = f"""You are a native Reddit Power-User and Organic Community Marketer for {brand_name}.
Your job is to generate a high-performing Reddit asset ({format_type}) tailored specifically for r/{subreddit}.
Adhere to Reddit etiquette: no corporate jargon, no blatant self-promotion, provide genuine transparent value first.

Output a structured JSON object containing:
- "title": Compelling Reddit post title (or target question title if format is comment_snipe).
- "format": "{format_type}"
- "body": The full Reddit post content or comment reply text (use Markdown formatting, bullet points, genuine founder tone).
- "target_subreddits": 3 relevant subreddits where this topic performs best.
- "karma_strategy": Why this post/comment will get upvoted rather than removed by moderators.
- "metadata": Internal notes and moderation advice.

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
Subreddit: r/{subreddit}
Format: {format_type}

Generate the Reddit asset.
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
                    "title": f"How we automated growth marketing without an agency [Case Study]",
                    "format": format_type,
                    "body": response.content,
                    "target_subreddits": [f"r/{subreddit}", "r/SaaS", "r/startups"],
                    "karma_strategy": "Direct authentic breakdown with transparent tech specs.",
                    "metadata": {"subreddit": subreddit}
                }

            if db:
                try:
                    draft_metadata = output_data.get("metadata", {})
                    draft_metadata["subreddit"] = subreddit
                    
                    draft = ContentDraft(
                        workspace_id=context.workspace_id,
                        brand_id=context.brand_id,
                        content_type="REDDIT_POST",
                        title=output_data.get("title", "Reddit Draft"),
                        body=output_data.get("body", ""),
                        status="DRAFT",
                        generated_by="reddit_agent",
                        generation_metadata=draft_metadata
                    )
                    db.add(draft)
                    db.flush()

                    version = ContentVersion(
                        content_draft_id=draft.id,
                        version_number=1,
                        title=draft.title,
                        body=draft.body,
                        change_summary="Initial Reddit AI Draft",
                        created_by="reddit_agent"
                    )
                    db.add(version)
                    db.commit()
                    
                    output_data["draft_id"] = str(draft.id)
                    output_data["version_id"] = str(version.id)
                except Exception:
                    db.rollback()

            if not is_connected:
                output_data["warning"] = "Reddit integration is disconnected. Draft was created, but external publishing is unavailable."

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

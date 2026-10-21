import json
import logging
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.agents.definition import AgentDefinition
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.ai.gateway import ai_gateway
from app.ai.schemas import AIRequestMessage
from app.models.all_models import AIUsageEvent, ContentDraft, ContentVersion
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

class UGCAgent(BaseAgent):
    """
    UGC & Short-Form Video Script Studio Agent:
    Generates viral 3-second hooks, scene-by-scene Reels/TikTok/Shorts scripts,
    on-screen text overlays, and creator filming briefs.
    """
    def __init__(self):
        super().__init__(
            agent_id="ugc_agent",
            name="UGC & Video Script Studio",
            description="Generates high-retention TikTok, Reels & Shorts video scripts with 3-second viral hooks and storyboards.",
            capabilities=["viral_hooks", "scene_by_scene_scripts", "storyboards", "creator_briefs", "audio_cues"],
            tier="PRO",
            resource_profile="HEAVY",
            credit_cost=2500
        )
        self.definition = AgentDefinition(
            id="ugc_agent",
            name="UGC & Video Script Studio",
            description="Generates high-retention TikTok, Reels & Shorts video scripts with 3-second viral hooks and storyboards.",
            category="CREATIVE",
            capabilities=["viral_hooks", "scene_by_scene_scripts", "storyboards", "creator_briefs", "audio_cues"],
            required_integrations=[],
            input_schema={
                "type": "object",
                "properties": {
                    "video_topic": {"type": "string"},
                    "target_platform": {"type": "string", "enum": ["reels", "tiktok", "shorts", "all"], "default": "reels"},
                    "duration_seconds": {"type": "integer", "enum": [30, 45, 60], "default": 45}
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
            industry = getattr(brand_obj, "industry", "B2B SaaS") if brand_obj else "B2B SaaS"

            topic = context.input_data.get("video_topic") or context.input_data.get("topic") or f"How to Scale Marketing with {brand_name}"
            platform = context.input_data.get("target_platform", "reels")
            duration = context.input_data.get("duration_seconds", 45)

            sys_prompt = f"""You are the Executive Creative Director for Viral Short-Form Video (TikTok, Instagram Reels, YouTube Shorts) for {brand_name}.
Your job is to generate a high-retention, high-converting short-form video script designed for maximum watch time and conversion.

Output a strictly formatted JSON object with:
- "title": Compelling internal title for the script.
- "hook_variations": Exactly 4 different 3-second opening hook variations:
    1. "Problem Agitation"
    2. "Contrarian / Mythbuster"
    3. "Curiosity Gap"
    4. "Shocking Metric / Proof"
- "scenes": A list of scene breakdowns covering the full {duration}-second video:
    - "timestamp": (e.g. "0:00 - 0:03", "0:03 - 0:10", etc.)
    - "visual_action": Visual cues for the creator (A-Roll talking head, B-Roll demo, gesturing, screen recording).
    - "spoken_dialogue": The exact script words spoken by the creator.
    - "on_screen_text": High-impact kinetic text captions to display on screen.
    - "sound_effect": Audio cue or sound effect (e.g. 'record scratch', 'whoosh', 'subtle upbeat lofi').
- "caption_and_hashtags": Ready-to-publish social caption with call-to-action and 5-7 targeted hashtags.
- "creator_filming_notes": Lighting, energy level, camera framing (vertical 9:16), and delivery pacing.

Output JSON only without markdown formatting.
"""

            user_msg = f"""
Video Topic: {topic}
Target Platform: {platform}
Target Duration: {duration} seconds
Brand: {brand_name} ({industry})
Additional Context: {json.dumps(context.input_data, default=str)}
"""

            messages = [
                AIRequestMessage(role="system", content=sys_prompt),
                AIRequestMessage(role="user", content=user_msg)
            ]

            response = ai_gateway.generate(messages=messages, max_tokens=2500)

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
                    "title": topic,
                    "raw_script": response.content,
                    "hook_variations": ["Stop wasting hours on manual marketing.", "What if your marketing ran itself?"]
                }

            # Save as a ContentDraft for approval and publishing
            if db:
                try:
                    script_body = json.dumps(output_data, indent=2)
                    draft = ContentDraft(
                        workspace_id=context.workspace_id,
                        brand_id=context.brand_id,
                        content_type="UGC_VIDEO_SCRIPT",
                        title=output_data.get("title", topic),
                        body=script_body,
                        status="DRAFT",
                        generated_by=self.agent_id,
                        generation_metadata={"platform": platform, "duration_seconds": duration}
                    )
                    db.add(draft)
                    db.flush()

                    version = ContentVersion(
                        content_draft_id=draft.id,
                        version_number=1,
                        title=draft.title,
                        body=draft.body,
                        change_summary="Initial AI Video Storyboard & Script",
                        created_by=self.agent_id
                    )
                    db.add(version)
                    db.commit()

                    output_data["draft_id"] = str(draft.id)
                    output_data["version_id"] = str(version.id)
                except Exception as ex:
                    logger.warning(f"Could not save draft record for UGC agent: {ex}")
                    try:
                        db.rollback()
                    except Exception:
                        pass

            output_data["status"] = "SUCCESS"
            output_data["agent"] = self.agent_id
            return AgentResult(status="SUCCESS", output_data=output_data)

        except Exception as e:
            logger.error(f"UGC Agent error: {e}")
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

import json
import logging
from typing import Dict, Any
from app.agents.base import BaseAgent
from app.agents.definition import AgentDefinition
from app.agents.context import AgentContext
from app.agents.result import AgentResult
from app.ai.gateway import ai_gateway
from app.ai.schemas import AIRequestMessage
from app.models.all_models import AIUsageEvent
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

class CodingAgent(BaseAgent):
    """
    Technical Marketing & Code Agent:
    Builds programmatic SEO landing pages, embeddable interactive calculators,
    JSON-LD structured data schemas, and technical marketing widgets.
    """
    def __init__(self):
        super().__init__(
            agent_id="coding_agent",
            name="Technical Marketing & Code Agent",
            description="Generates programmatic SEO pages, interactive web calculators, and validated schema markup.",
            capabilities=["programmatic_pages", "interactive_calculators", "schema_markup", "technical_seo_code"],
            tier="PRO",
            resource_profile="HEAVY",
            credit_cost=2500
        )
        self.definition = AgentDefinition(
            id="coding_agent",
            name="Technical Marketing & Code Agent",
            description="Generates programmatic SEO pages, interactive web calculators, and validated schema markup.",
            category="EXECUTION",
            capabilities=["programmatic_pages", "interactive_calculators", "schema_markup", "technical_seo_code"],
            required_integrations=[],  # Runs standalone with code generation; GitHub is optional
            input_schema={
                "type": "object",
                "properties": {
                    "task_type": {
                        "type": "string",
                        "enum": ["calculator", "programmatic_page", "schema_markup", "technical_fix"],
                        "default": "calculator"
                    },
                    "title": {"type": "string"},
                    "framework": {"type": "string", "enum": ["react", "html", "nextjs"], "default": "react"}
                }
            },
            output_schema={"type": "object"},
            approval_policy="ALWAYS_REQUIRE"
        )

    def execute(self, context: AgentContext) -> AgentResult:
        db = SessionLocal()
        try:
            brand_obj = getattr(context.brand_context, "brand", None) if context.brand_context else None
            brand_name = getattr(brand_obj, "name", "StandBharat") if brand_obj else "StandBharat"
            industry = getattr(brand_obj, "industry", "B2B SaaS") if brand_obj else "B2B SaaS"

            task_type = context.input_data.get("task_type", "calculator")
            title = context.input_data.get("title") or f"{brand_name} Marketing ROI Calculator"
            framework = context.input_data.get("framework", "react")

            sys_prompt = f"""You are the Principal Technical Marketer and Frontend Engineer for {brand_name} ({industry}).
Your task is to generate production-ready, clean, responsive frontend code and technical marketing assets for: {task_type}.

Output a strictly formatted JSON object with:
- "component_name": PascalCase name of the component (e.g. ROICalculator, ProgrammaticLandingPage, OrganizationSchema).
- "framework": The target framework ({framework}).
- "code": The full, complete, production-ready code with responsive CSS styling (Tailwind or styled CSS).
- "preview_html": A self-contained runnable single-file HTML preview with embedded CSS and JS logic.
- "schema_jsonld": A valid JSON-LD structured data script string (or empty object if not applicable).
- "deployment_instructions": Step-by-step instructions on embedding or deploying this component.
- "marketing_benefits": 2-3 bullet points on how this technical asset drives organic traffic or lead conversion.

Output JSON only without markdown formatting.
"""

            user_msg = f"""
Task Type: {task_type}
Title: {title}
Framework: {framework}
Brand: {brand_name} ({industry})
Specific Instructions: {json.dumps(context.input_data, default=str)}
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

            # Parse JSON response
            raw = response.content.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.startswith("```"): raw = raw[3:]
            if raw.endswith("```"): raw = raw[:-3]

            try:
                output_data = json.loads(raw.strip())
            except Exception:
                output_data = {
                    "component_name": "TechnicalMarketingWidget",
                    "framework": framework,
                    "code": response.content,
                    "preview_html": f"<div style='padding:20px; font-family:sans-serif;'><h3>{title}</h3><p>{brand_name} Technical Asset</p></div>",
                    "deployment_instructions": "Copy the generated code into your frontend repository.",
                    "marketing_benefits": ["Drives high-intent organic search volume", "Captures qualified email leads"]
                }

            output_data["status"] = "SUCCESS"
            output_data["agent"] = self.agent_id
            return AgentResult(status="SUCCESS", output_data=output_data)

        except Exception as e:
            logger.error(f"Coding Agent error: {e}")
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

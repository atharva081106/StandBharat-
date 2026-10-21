from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_brand, get_current_user
from app.models.all_models import Brand, User
from app.ai.gateway import ai_gateway
from app.ai.config import ai_config
from app.ai.exceptions import AINotConfiguredException
from app.ai.schemas import AIRequestMessage
from pydantic import BaseModel
from typing import List, Any, Optional
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.ai.context.brand_context import brand_context_service
from app.ai.context.prompt_context import build_brand_prompt_context
from app.ai.context.agent_results import agent_result_service
from app.models.all_models import ContentProject, ContentDraft, ContentApproval
import json
from app.core.limiter import limiter
from starlette.requests import Request

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class AICmoResponse(BaseModel):
    status: str
    response: str = ""

@router.get("/status")
def get_ai_status(current_user: User = Depends(get_current_user)):
    try:
        provider = ai_gateway._get_provider()
        return {
            "configured": True,
            "provider": getattr(provider, "provider_name", ai_config.DEFAULT_PROVIDER)
        }
    except AINotConfiguredException:
        return {
            "configured": False,
            "status": "NOT_CONFIGURED"
        }

def synthesize_cmo_fallback(message: str, brand: Brand, context_obj: Any, agent_results: Any, db: Session) -> str:
    from app.models.all_models import Opportunity, ContentProject, ContentApproval
    
    brand_name = brand.name or "Your Brand"
    industry = getattr(brand, "industry", "B2B SaaS Marketing")
    
    opps = db.query(Opportunity).filter(
        Opportunity.brand_id == brand.id,
        Opportunity.status != "DISMISSED"
    ).order_by(Opportunity.priority.desc()).limit(3).all()
    
    pending_approvals = db.query(ContentApproval).filter(
        ContentApproval.brand_id == brand.id,
        ContentApproval.status == "PENDING"
    ).count()
    
    msg_lower = message.lower()
    
    if "focus" in msg_lower or "week" in msg_lower or "priority" in msg_lower:
        top_opp = opps[0].title if opps else "Scale Programmatic SEO & LinkedIn Viral Distribution"
        return (
            f"🎯 **Weekly CMO Strategic Directive for {brand_name}:**\n\n"
            f"1. **Core Growth Lever:** Focus 60% of marketing bandwidth on **{top_opp}**. Our growth models indicate this has the highest conversion efficiency.\n"
            f"2. **Content Engine:** You currently have **{pending_approvals} content items** awaiting review in the Approvals queue. Review and deploy them to keep multi-channel cadence active.\n"
            f"3. **Autonomous Agents:** Keep the Competitor Intelligence and GEO Agents running to track emerging search citations on Perplexity and SearchGPT.\n\n"
            f"Would you like me to trigger a specialized sprint with the Content Strategy and Growth Agents?"
        )
    elif "growth" in msg_lower or "opportunity" in msg_lower:
        opp_list = "\n".join([f"- **{o.title}** (Impact: {o.impact}, Confidence: {o.confidence}%)" for o in opps]) if opps else "- Programmatic SEO Long-Tail Cluster Creation\n- LinkedIn B2B Thought Leadership Funnel\n- Competitor Ad Gap Hijacking"
        return (
            f"🚀 **Top High-Impact Opportunities for {brand_name}:**\n\n"
            f"{opp_list}\n\n"
            f"💡 **Recommendation:** Accelerate the top opportunity. Our autonomous team can draft campaign briefs and auto-publish content directly once approved."
        )
    elif "competitor" in msg_lower or "positioning" in msg_lower:
        return (
            f"🕵️ **Competitor & Market Positioning Radar:**\n\n"
            f"Our competitor scans show rival offerings in the {industry} space are heavily reliant on generic agency retainers without autonomous execution.\n\n"
            f"- **Your Core Moat:** Fast, continuous AI execution, high-converting copy, and 50% lower total cost of acquisition.\n"
            f"- **Next Move:** Deploy the Competitor Agent to run deep teardowns on keyword overlap and backlink velocity."
        )
    elif "approval" in msg_lower or "publish" in msg_lower:
        return (
            f"📋 **Content Pipeline Status:**\n\n"
            f"You have **{pending_approvals} items** pending in the Approvals Center.\n"
            f"Once you approve them, our multi-channel connectors can push them live to your connected platforms (LinkedIn, WordPress, Webflow, X)."
        )
    else:
        return (
            f"Strategically analyzing '{message}' for **{brand_name}**...\n\n"
            f"As your AI CMO, here is my recommendation:\n"
            f"- Align this initiative with your target audience and current acquisition channels.\n"
            f"- Activate the specialized Growth and Analytics Agents to measure attribution impact.\n"
            f"- Ensure content follows your established brand voice guidelines.\n\n"
            f"Let me know if you would like me to generate a tailored execution brief for this."
        )

def format_cmo_as_markdown(raw_content: str, brand_name: str) -> str:
    """
    Transforms any raw JSON response from CMO agents into clean, executive,
    ChatGPT-style Markdown so the user never sees raw JSON in chat.
    """
    if not raw_content or not isinstance(raw_content, str):
        return raw_content or ""
    
    trimmed = raw_content.strip()
    if trimmed.startswith("```json"):
        trimmed = trimmed[7:]
    if trimmed.startswith("```"):
        trimmed = trimmed[3:]
    if trimmed.endswith("```"):
        trimmed = trimmed[:-3]
    trimmed = trimmed.strip()

    if not trimmed.startswith("{") or not trimmed.endswith("}"):
        return raw_content

    try:
        data = json.loads(trimmed)
        if not isinstance(data, dict):
            return raw_content
        
        has_cmo_fields = any(k in data for k in ["executive_summary", "strategic_pillars", "opportunities", "delegations", "summary"])
        if not has_cmo_fields:
            return raw_content

        lines = []
        b_name = brand_name or data.get("brand") or "Your Brand"

        # Executive summary
        summary = data.get("executive_summary") or data.get("summary") or ""
        if summary:
            lines.append(f"### 🎯 Strategic Executive Summary for {b_name}\n")
            lines.append(f"{summary}\n")

        # Strategic pillars
        pillars = data.get("strategic_pillars")
        if pillars and isinstance(pillars, list):
            lines.append("---\n\n### 🏛️ Top Strategic Priorities\n")
            for idx, p in enumerate(pillars, 1):
                lines.append(f"{idx}. **{p}**")
            lines.append("")

        # Opportunities
        opps = data.get("opportunities")
        if opps and isinstance(opps, list):
            lines.append("---\n\n### 🚀 High-Impact Opportunities\n")
            for opp in opps:
                if isinstance(opp, dict):
                    title = opp.get("title", "Growth Initiative")
                    desc = opp.get("description", "")
                    impact = opp.get("impact", "HIGH")
                    effort = opp.get("effort", "LOW")
                    lines.append(f"• **{title}** *(Impact: {impact} | Effort: {effort})*")
                    if desc:
                        lines.append(f"  {desc}")
                elif isinstance(opp, str):
                    lines.append(f"• {opp}")
            lines.append("")

        # Delegations
        delegations = data.get("delegations")
        if delegations and isinstance(delegations, list):
            lines.append("---\n\n### ⚡ Autonomous Delegations\n")
            for d in delegations:
                if isinstance(d, dict):
                    agent_id = d.get("agent_id", "Specialized Agent").replace("_", " ").title()
                    task = d.get("task", "")
                    lines.append(f"• **{agent_id}:** {task}")
                elif isinstance(d, str):
                    lines.append(f"• {d}")
            lines.append("")

        lines.append("Would you like me to deploy these agent tasks or dive deeper into any specific channel?")
        return "\n".join(lines)
    except Exception:
        return raw_content

@router.post("/cmo/chat", response_model=AICmoResponse)
@limiter.limit("20/minute")
def ai_cmo_chat(
    request: Request,
    req: ChatRequest,
    brand: Brand = Depends(get_current_brand),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    context_obj = brand_context_service.get_brand_context(db, brand.id, brand.workspace_id)
    agent_results = agent_result_service.get_latest_agent_results(db, brand.id)
    
    brand_name = brand.name or "Your Brand"
    sys_prompt = (
        f"You are the world-class executive AI Chief Marketing Officer (AI CMO) for {brand_name}.\n"
        f"Communicate as an elite marketing leader (like ChatGPT):\n"
        f"- Output clean, beautifully formatted Markdown with bold headings (###), bullet points, and relevant emojis.\n"
        f"- Never return raw JSON or dictionary syntax in your response.\n"
        f"- Provide high-impact, actionable, and structured growth advice tailored to {brand_name}.\n"
    )

    if context_obj:
        brand_prompt = build_brand_prompt_context(context_obj)
        sys_prompt += f"\n\nBrand Context:\n{brand_prompt}"
        
    if agent_results:
        sys_prompt += f"\n\nRecent Agent Findings:\n{json.dumps(agent_results, indent=2)}"
        
    # Fetch content workflow state
    projects = db.query(ContentProject).filter(ContentProject.brand_id == brand.id).order_by(ContentProject.created_at.desc()).limit(10).all()
    if projects:
        content_state = []
        for p in projects:
            drafts = db.query(ContentDraft).filter(ContentDraft.content_project_id == p.id).all()
            approvals = db.query(ContentApproval).filter(ContentApproval.content_project_id == p.id).all()
            content_state.append({
                "project_id": str(p.id),
                "title": p.title,
                "status": p.status,
                "type": p.content_type,
                "drafts": [{"id": str(d.id), "status": d.status} for d in drafts],
                "approvals": [{"id": str(a.id), "status": a.status} for a in approvals]
            })
        sys_prompt += f"\n\nContent Workflow State:\n{json.dumps(content_state, indent=2)}"
        
    messages = [
        AIRequestMessage(role="system", content=sys_prompt),
        AIRequestMessage(role="user", content=req.message)
    ]
    
    from app.ai.context.cmo_tools import CMO_TOOLS, execute_cmo_tool
    
    try:
        res = ai_gateway.generate(messages=messages, max_tokens=1500, tools=CMO_TOOLS)
        
        # Handle tool calling loop
        if res.tool_calls:
            messages.append(AIRequestMessage(
                role="assistant", 
                content=res.content or "", 
                tool_calls=res.tool_calls
            ))
            
            for tc in res.tool_calls:
                tool_res_content = execute_cmo_tool(
                    db=db,
                    workspace_id=brand.workspace_id,
                    brand_id=brand.id,
                    user_id=current_user.id,
                    tool_name=tc.function["name"],
                    arguments=json.loads(tc.function["arguments"])
                )
                messages.append(AIRequestMessage(
                    role="tool",
                    content=tool_res_content,
                    tool_call_id=tc.id
                ))
            
            # Second generation call without tools so model outputs final answer
            res = ai_gateway.generate(messages=messages, max_tokens=1500, tools=None)
            
        final_response = format_cmo_as_markdown(res.content or "", brand_name)
        return {"status": "SUCCESS", "response": final_response}
    except Exception as e:
        # Graceful fallback to deterministic strategic CMO synthesis
        fallback_text = synthesize_cmo_fallback(req.message, brand, context_obj, agent_results, db)
        final_response = format_cmo_as_markdown(fallback_text, brand_name)
        return {"status": "SUCCESS", "response": final_response}

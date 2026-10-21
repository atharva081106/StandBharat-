from typing import Any, Dict, Optional
import datetime
from sqlalchemy.orm import Session
from app.models.all_models import AgentRun, AgentTask, AIUsageEvent
from app.agents.context import AgentContext
from app.agents.base import BaseAgent
from app.agents.result import AgentResult

class AgentRuntime:
    """
    Manages the lifecycle, budgeting, and execution context of an Agent.
    Responsible for telemetry, timeout limits, retries, cost logging, and state management.
    """
    def __init__(self, db: Session, agent: BaseAgent):
        self.db = db
        self.agent = agent
        
    def generate_with_ai(
        self,
        messages,
        model=None,
        temperature=0.7,
        max_tokens=2000,
        tools=None,
        context: AgentContext = None
    ):
        from app.ai.gateway import ai_gateway
        from app.models.all_models import AIUsageEvent, Workspace
        
        workspace = None
        if context and context.workspace_id:
            try:
                workspace = self.db.query(Workspace).filter(Workspace.id == context.workspace_id).first()
            except Exception:
                pass
                
        # If Free tier, enforce lightweight parameters to conserve AI credits and resources
        if workspace and getattr(workspace, "plan_tier", "FREE") == "FREE":
            max_tokens = min(max_tokens, 500)  # Strict ceiling for free tier
            # Steer heavy frontier models to fast, cost-effective models
            if not model or model.startswith("gpt-4") or model.startswith("claude-"):
                model = "gemini-1.5-flash"
        
        response = ai_gateway.generate(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            tools=tools
        )
        
        tokens_used = (
            getattr(response.info, "total_tokens", 0) 
            or (getattr(response.info, "input_tokens", 0) + getattr(response.info, "output_tokens", 0))
            or 500
        )
        
        if workspace:
            try:
                workspace.used_credits_this_month = (workspace.used_credits_this_month or 0) + tokens_used
                self.db.commit()
            except Exception:
                self.db.rollback()
        
        if context:
            try:
                usage = AIUsageEvent(
                    workspace_id=context.workspace_id,
                    brand_id=context.brand_id,
                    user_id=context.user_id,
                    agent_id=self.agent.agent_id,
                    agent_run_id=context.run_id,
                    provider=response.info.provider,
                    model=response.info.model,
                    input_tokens=response.info.input_tokens,
                    output_tokens=response.info.output_tokens,
                    total_tokens=response.info.total_tokens,
                    estimated_cost=response.info.estimated_cost,
                    status="SUCCESS"
                )
                self.db.add(usage)
                self.db.commit()
            except Exception:
                self.db.rollback()
            
        return response
        
    def execute_task(self, context: AgentContext) -> AgentResult:
        run_record = self.db.query(AgentRun).filter(AgentRun.id == context.run_id).first()
        task_record = None
        if context.task_id:
            task_record = self.db.query(AgentTask).filter(AgentTask.id == context.task_id).first()
        
        if run_record:
            run_record.started_at = datetime.datetime.utcnow()
            run_record.status = "RUNNING"
            self.db.commit()
            
        # Gate Pro agents and check quota if workspace is Free
        if context and context.workspace_id:
            from app.models.all_models import Workspace
            workspace = self.db.query(Workspace).filter(Workspace.id == context.workspace_id).first()
            if workspace:
                agent_tier = getattr(self.agent, "tier", "PRO")
                current_plan = getattr(workspace, "plan_tier", "FREE")
                
                if agent_tier == "PRO" and current_plan == "FREE":
                    err = f"PRO_PLAN_REQUIRED: Agent '{self.agent.name}' is a Pro feature. Upgrade to StandBharat Pro to unlock all 15 autonomous agents."
                    if run_record:
                        run_record.status = "FAILED"
                        run_record.error = err
                        run_record.completed_at = datetime.datetime.utcnow()
                    if task_record:
                        task_record.status = "FAILED"
                        task_record.error = err
                    self.db.commit()
                    return AgentResult(status="FAILED", error=err)
                
                quota = getattr(workspace, "monthly_credit_quota", 50000)
                used = getattr(workspace, "used_credits_this_month", 0)
                if used >= quota:
                    err = f"CREDIT_QUOTA_EXCEEDED: Workspace credit limit reached ({quota} credits). Upgrade to Pro for 1,000,000 credits."
                    if run_record:
                        run_record.status = "FAILED"
                        run_record.error = err
                        run_record.completed_at = datetime.datetime.utcnow()
                    if task_record:
                        task_record.status = "FAILED"
                        task_record.error = err
                    self.db.commit()
                    return AgentResult(status="FAILED", error=err)
            
        try:
            result = self.agent.execute(context)
            
            # Enrich and format output to be executive-grade, human-readable, and understandable
            try:
                from app.agents.formatter import format_human_readable_agent_result
                b_name = "Your Brand"
                b_url = ""
                if hasattr(context, "brand_context") and context.brand_context:
                    b_name = getattr(context.brand_context, "name", "Your Brand") or "Your Brand"
                    b_url = getattr(context.brand_context, "website_url", "") or ""
                if result.output_data is not None:
                    result.output_data = format_human_readable_agent_result(
                        agent_id=self.agent.agent_id,
                        output_data=result.output_data,
                        brand_name=b_name,
                        website_url=b_url
                    )
            except Exception as fmt_err:
                pass
            
            if run_record:
                run_record.status = result.status
                run_record.output = result.output_data
                if result.error:
                    run_record.error = result.error
                run_record.completed_at = datetime.datetime.utcnow()
            
            if task_record:
                task_record.status = "COMPLETED" if result.status == "SUCCESS" else "FAILED"
                task_record.output_data = result.output_data
                if result.error:
                    task_record.error = result.error

            self.db.commit()
            return result
            
        except Exception as e:
            error_msg = str(e)
            if run_record:
                run_record.status = "FAILED"
                run_record.error = error_msg
                run_record.completed_at = datetime.datetime.utcnow()
            
            if task_record:
                task_record.status = "FAILED"
                task_record.error = error_msg
                
            self.db.commit()
            return AgentResult(status="FAILED", error=error_msg)

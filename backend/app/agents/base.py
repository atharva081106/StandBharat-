from abc import ABC, abstractmethod
from typing import Dict, Any
from .context import AgentContext
from .result import AgentResult
from app.ai.gateway import ai_gateway

class BaseAgent(ABC):
    def __init__(
        self,
        agent_id: str,
        name: str,
        description: str,
        capabilities: list,
        tier: str = "PRO",
        resource_profile: str = "STANDARD",
        credit_cost: int = 1500
    ):
        self.agent_id = agent_id
        self.name = name
        self.description = description
        self.capabilities = capabilities
        self.tier = tier  # "FREE" or "PRO"
        self.resource_profile = resource_profile  # "LIGHTWEIGHT", "STANDARD", "HEAVY"
        self.credit_cost = credit_cost

    @abstractmethod
    def execute(self, context: AgentContext) -> AgentResult:
        pass

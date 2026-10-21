from typing import Dict, List
from .base import BaseAgent
from .exceptions import AgentNotFoundException

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent):
        self._agents[agent.agent_id] = agent

    def get_agent(self, agent_id: str) -> BaseAgent:
        if agent_id in self._agents:
            return self._agents[agent_id]
        
        # Normalize dashes to underscores
        norm_id = agent_id.replace("-", "_").lower()
        if norm_id in self._agents:
            return self._agents[norm_id]

        ALIAS_MAP = {
            "writer": "content_writer",
            "writer_agent": "content_writer",
            "content_writer": "content_writer",
            "copywriter": "content_writer",
            "content": "content_strategy",
            "content_strategy": "content_strategy",
            "strategy": "content_strategy",
            "seo": "seo_agent",
            "seo_agent": "seo_agent",
            "geo": "geo_agent",
            "geo_agent": "geo_agent",
            "cmo": "ai_cmo",
            "ai_cmo": "ai_cmo",
            "ai_cmo_agent": "ai_cmo",
            "linkedin": "linkedin_agent",
            "linkedin_agent": "linkedin_agent",
            "x": "x_agent",
            "x_agent": "x_agent",
            "twitter": "x_agent",
            "twitter_agent": "x_agent",
            "twitter_x": "x_agent",
            "reddit": "reddit_agent",
            "reddit_agent": "reddit_agent",
            "coding": "coding_agent",
            "coding_agent": "coding_agent",
            "influencer": "influencer_agent",
            "influencer_agent": "influencer_agent",
            "ugc": "ugc_agent",
            "ugc_agent": "ugc_agent",
            "attribution": "analytics",
            "analytics": "analytics",
            "growth": "growth",
            "competitor": "competitor",
            "performance": "performance"
        }

        if norm_id in ALIAS_MAP and ALIAS_MAP[norm_id] in self._agents:
            return self._agents[ALIAS_MAP[norm_id]]

        # Resolve aliases: e.g. 'seo' -> 'seo_agent', 'reddit' -> 'reddit_agent'
        if not norm_id.endswith("_agent") and f"{norm_id}_agent" in self._agents:
            return self._agents[f"{norm_id}_agent"]
        if norm_id.endswith("_agent"):
            stripped = norm_id[:-6]
            if stripped in self._agents:
                return self._agents[stripped]
        raise AgentNotFoundException(f"Agent {agent_id} not found")

    def list_agents(self) -> List[BaseAgent]:
        return list(self._agents.values())

agent_registry = AgentRegistry()

from .test_agent import TestAgent
from .specialized.analytics_agent import AnalyticsAgent
from .specialized.competitor_agent import CompetitorAgent
from .specialized.growth_agent import GrowthAgent
from .specialized.content_strategy_agent import ContentStrategyAgent
from .specialized.seo_agent import SEOAgent
from .specialized.geo_agent import GEOAgent
from .specialized.content_writer_agent import ContentWriterAgent
from .specialized.performance_agent import PerformanceAgent
from .specialized.ai_cmo_agent import AICMOAgent
from .specialized.linkedin_agent import LinkedInAgent
from .specialized.x_agent import XAgent
from .specialized.reddit_agent import RedditAgent
from .specialized.coding_agent import CodingAgent
from .specialized.influencer_agent import InfluencerAgent
from .specialized.ugc_agent import UGCAgent

agent_registry.register(TestAgent())
agent_registry.register(AnalyticsAgent())
agent_registry.register(CompetitorAgent())
agent_registry.register(GrowthAgent())
agent_registry.register(ContentStrategyAgent())
agent_registry.register(ContentWriterAgent())
agent_registry.register(PerformanceAgent())
agent_registry.register(SEOAgent())
agent_registry.register(GEOAgent())
agent_registry.register(AICMOAgent())
agent_registry.register(LinkedInAgent())
agent_registry.register(XAgent())
agent_registry.register(RedditAgent())
agent_registry.register(CodingAgent())
agent_registry.register(InfluencerAgent())
agent_registry.register(UGCAgent())

import { AgentProvider } from '../types/interfaces'
import { mockAgents } from '../../mock/data'
import { Agent } from '../../types/agent'

export class MockAgentProvider implements AgentProvider {
  async getAgents(): Promise<Agent[]> {
    return mockAgents as Agent[];
  }
  async getAgent(id: string): Promise<Agent> {
    const cleanId = id?.replace(/_agent$/, '');
    const agent = mockAgents.find(a => a.id === id || a.id === cleanId || a.id === `${id}_agent` || `${a.id}_agent` === id);
    if (agent) return agent as Agent;
    return {
      id: id,
      name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: "Autonomous specialized AI marketing agent.",
      status: "ACTIVE",
      tier: "PRO",
      capabilities: ["Autonomous Execution", "Brand Grounding"],
      resourceProfile: "STANDARD",
      creditCost: 1500
    } as Agent;
  }
  async runAgent(id: string, payload: any): Promise<any> {
    return { id: "mock-run-123", status: "COMPLETED", result_data: { summary: "Mock success" } };
  }
  async getAgentRun(runId: string): Promise<any> {
    return { id: runId, status: "COMPLETED", result_data: { summary: "Mock result" } };
  }
  async getAgentRuns(agentId?: string): Promise<any[]> {
    return [
      { id: "mock-run-123", agent_id: agentId, status: "SUCCESS", created_at: new Date(Date.now() - 3600000).toISOString(), result_data: { summary: "Analysis complete. Detected 3 new opportunities." } },
      { id: "mock-run-456", agent_id: agentId, status: "SUCCESS", created_at: new Date(Date.now() - 86400000).toISOString(), result_data: { summary: "Generated content brief for Enterprise AI Marketing." } }
    ];
  }
  async getAgentConfig(agentId: string): Promise<any> {
    return {
      schedule: "AUTONOMOUS",
      tone: "BRAND_BRAIN",
      require_approval: true,
      custom_directives: "",
      target_channels: ["Brand Brain Knowledge Base", "Approvals Queue"],
      notification_email: true
    };
  }
  async saveAgentConfig(agentId: string, payload: any): Promise<any> {
    return { success: true, agent_id: agentId, config: payload };
  }
}

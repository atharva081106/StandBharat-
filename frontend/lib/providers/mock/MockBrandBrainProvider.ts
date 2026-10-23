import { BrandBrainProvider } from '../types/interfaces';

export class MockBrandBrainProvider implements BrandBrainProvider {
  private context = {
    brand: {
      name: "StandBharat AI",
      description: "An AI-powered autonomous marketing operating system for enterprise B2B.",
      industry: "B2B SaaS",
      category: "Marketing Automation",
      website_url: "https://standbharat.ai",
      mission: "To automate the intelligence loop from data to publishing.",
      vision: "Be the operating system for the next generation of marketers.",
      values: "Data-driven, Autonomous, Premium",
      tagline: "Your Autonomous Marketing Team"
    },
    voice: {
      tone: "Professional yet approachable, authoritative on AI.",
      personality: "Intelligent, calm, operational, and trustworthy.",
      writing_style: "Concise, data-backed, avoiding hype-words.",
      preferred_language: "Indian English & Hinglish"
    },
    audiences: [
      { id: "1", name: "Indian D2C & SaaS Founders", description: "Founders and CMOs across Mumbai, Bengaluru, Delhi NCR, and Bharat", pain_points: "CAC inflation, agency turnaround times, multi-channel scaling" },
      { id: "2", name: "Growth & Performance Leads", description: "Growth leaders scaling organic and paid revenue in India", pain_points: "WhatsApp integration, ROAS optimization, Indic localization" }
    ],
    products: [
      { id: "1", name: "StandBharat Platform", description: "India's First Autonomous AI Marketing OS", price: "₹4,999/mo" }
    ],
    positioning: {
      positioning_statement: "For Indian high-growth brands and MSMEs, StandBharat is the autonomous AI operating system that orchestrates multi-channel marketing from SEO to WhatsApp publishing without agency dependencies."
    },
    goals: [
      { id: "1", goal: "Increase Demo & Trial Requests", target_value: "500/mo", current_value: "320/mo" }
    ],
    competitors: [
      { id: "1", name: "Practo", strengths: "High domain authority, established consumer brand", weaknesses: "Legacy SEO moats, slower organic search adaptation" },
      { id: "2", name: "HealthKart", strengths: "Strong D2C brand loyalty, aggressive influencer reach", weaknesses: "High paid ad dependence, rising blended CAC" }
    ],
    strategy: {
      marketing_strategy: "Content-led growth focusing on deep-dive technical guides and thought leadership on LinkedIn."
    },
    documents: []
  };

  async getContext() {
    return this.context;
  }
  async updateVoice(data: any) {
    this.context.voice = { ...this.context.voice, ...data };
    return this.context.voice;
  }
  async addAudience(data: any) {
    const aud = { id: Math.random().toString(), ...data };
    this.context.audiences.push(aud);
    return aud;
  }
  async updateAudience(id: string, data: any) {
    return data;
  }
  async deleteAudience(id: string) {
    this.context.audiences = this.context.audiences.filter(a => a.id !== id);
    return { status: "ok" };
  }
  async addProduct(data: any) {
    const prod = { id: Math.random().toString(), ...data };
    this.context.products.push(prod);
    return prod;
  }
  async updateProduct(id: string, data: any) {
    return data;
  }
  async deleteProduct(id: string) {
    this.context.products = this.context.products.filter(p => p.id !== id);
    return { status: "ok" };
  }
  async updatePositioning(data: any) {
    this.context.positioning = { ...this.context.positioning, ...data };
    return this.context.positioning;
  }
  async addGoal(data: any) {
    const goal = { id: Math.random().toString(), ...data };
    this.context.goals.push(goal);
    return goal;
  }
  async updateGoal(id: string, data: any) {
    return data;
  }
  async deleteGoal(id: string) {
    this.context.goals = this.context.goals.filter(g => g.id !== id);
    return { status: "ok" };
  }
  async addCompetitor(data: any) {
    const comp = { id: Math.random().toString(), ...data };
    this.context.competitors.push(comp);
    return comp;
  }
  async updateCompetitor(id: string, data: any) {
    return data;
  }
  async deleteCompetitor(id: string) {
    this.context.competitors = this.context.competitors.filter(c => c.id !== id);
    return { status: "ok" };
  }
  async updateStrategy(data: any) {
    this.context.strategy = { ...this.context.strategy, ...data };
    return this.context.strategy;
  }
}

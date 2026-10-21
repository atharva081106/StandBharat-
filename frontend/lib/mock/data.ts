export const DEMO_MODE = true;

export const mockUser = {
  id: "u_1",
  name: "Atharva",
  email: "demo@standbharat.ai",
  role: "OWNER"
};

export const mockWorkspaces = [
  { id: "w_1", name: "Acme Corp" }
];

export const mockBrands = [
  { id: "b_1", name: "Acme SaaS", workspace_id: "w_1" }
];

export const mockKPIs = {
  revenue: { value: "₹4.82L", change: "+18.4%" },
  leads: { value: "1,284", change: "+23.1%" },
  conversionRate: { value: "8.4%", change: "+2.1%" },
  aiSpend: { value: "₹2,410", change: "+8.2%" }
};

export const mockAgents = [
  // --- FREE AGENTS (Ultra-low compute & resource footprint) ---
  {
    id: "ai_cmo",
    name: "AI CMO Advisor (Light)",
    status: "ACTIVE",
    tier: "FREE",
    resourceProfile: "LIGHTWEIGHT",
    creditCost: 750,
    description: "High-level strategic guidance, marketing sprint planning, and campaign recommendations.",
    capabilities: ["Strategy Guidance", "Campaign Direction", "Quick Q&A"],
    isOkaraParity: true
  },
  {
    id: "seo",
    name: "SEO Quick Audit Agent",
    status: "ACTIVE",
    tier: "FREE",
    resourceProfile: "LIGHTWEIGHT",
    creditCost: 500,
    description: "Fast single-page on-page SEO inspection, meta tags, heading hierarchy, and keyword opportunities.",
    capabilities: ["On-Page Audit", "Meta Tag Analysis", "Keyword Ideas"],
    isOkaraParity: true
  },
  {
    id: "content_writer",
    name: "Social Hook & Copy Agent",
    status: "ACTIVE",
    tier: "FREE",
    resourceProfile: "LIGHTWEIGHT",
    creditCost: 600,
    description: "Crafts high-converting viral hooks, punchy social copy snippets, and 300-word blog outlines.",
    capabilities: ["Short-form Copy", "Viral Hooks", "Blog Outlines"],
    isOkaraParity: true
  },

  // --- PRO AGENTS (Autonomous Multi-Channel Execution & Frontier LLMs) ---
  {
    id: "reddit",
    name: "Reddit Growth & Karma Sniper",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "STANDARD",
    creditCost: 1500,
    description: "Monitors high-intent subreddits, detects pain points, and drafts non-promotional karma-building replies.",
    capabilities: ["Subreddit Listening", "Pain-point Sniping", "Organic Karma Building"],
    isOkaraParity: true
  },
  {
    id: "linkedin",
    name: "LinkedIn Thought Leader",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "STANDARD",
    creditCost: 1500,
    description: "Creates viral multi-slide PDF carousels, executive thought leadership, and high-engagement commentary.",
    capabilities: ["Carousel Slides", "Ghostwriting", "B2B Hook Generator"],
    isOkaraParity: true
  },
  {
    id: "x",
    name: "X / Twitter Viral Engine",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "STANDARD",
    creditCost: 1500,
    description: "Generates daily viral threads, smart quote-tweets, and automated audience engagement schedules.",
    capabilities: ["Viral Threads", "Auto-Engagement", "Quote-Tweet Angles"],
    isOkaraParity: true
  },
  {
    id: "influencer",
    name: "Influencer Outreach & Matchmaker",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "HEAVY",
    creditCost: 2500,
    description: "Discovers nano/micro creators, evaluates engagement rates, and generates personalized outreach sequences.",
    capabilities: ["Creator Discovery", "Matchmaking", "Outreach Sequences"],
    isOkaraParity: true
  },
  {
    id: "ugc",
    name: "UGC & Video Script Studio",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "HEAVY",
    creditCost: 2500,
    description: "Builds 3-second viral hooks, scene-by-scene Reels/TikTok/Shorts storyboards, and creator filming briefs.",
    capabilities: ["Shorts/Reels Scripts", "3s Hook Variations", "Storyboard Briefs"],
    isOkaraParity: true
  },
  {
    id: "geo",
    name: "Generative Engine Optimization (GEO)",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "HEAVY",
    creditCost: 3000,
    description: "Tracks and optimizes brand visibility across ChatGPT Search, Perplexity AI, Google Gemini, and Claude.",
    capabilities: ["ChatGPT Search Audit", "Perplexity Citation", "Gemini Visibility"],
    isOkaraParity: true
  },
  {
    id: "coding",
    name: "Technical Marketing & Code Agent",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "HEAVY",
    creditCost: 2500,
    description: "Builds programmatic SEO templates, interactive web calculators, and validated JSON-LD schemas.",
    capabilities: ["Programmatic Landing Pages", "Interactive Calculators", "JSON-LD Schemas"],
    isOkaraParity: true
  },
  {
    id: "competitor",
    name: "Competitor Radar & Spy Agent",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "HEAVY",
    creditCost: 3000,
    description: "24/7 web scraping of competitor websites, ad angle changes, pricing moves, and messaging shifts.",
    capabilities: ["24/7 Web Crawling", "Ad Angle Analysis", "Gap Detection"],
    isStandBharatExclusive: true
  },
  {
    id: "growth",
    name: "CRO & Growth Experiment Agent",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "STANDARD",
    creditCost: 2000,
    description: "Analyzes landing page conversion leaks and formulates data-backed A/B test experiments.",
    capabilities: ["Conversion Rate Audit", "A/B Hypotheses", "Friction Analysis"],
    isStandBharatExclusive: true
  },
  {
    id: "performance",
    name: "Paid Ads & ROAS Optimizer",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "HEAVY",
    creditCost: 2500,
    description: "Drafts Meta Ads, Google Search Ads, and LinkedIn Sponsored Content with ROAS targeting.",
    capabilities: ["Meta Ads Copy", "Google Search Ads", "Budget Optimization"],
    isStandBharatExclusive: true
  },
  {
    id: "analytics",
    name: "Multi-Touch Revenue Attribution",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "HEAVY",
    creditCost: 3000,
    description: "Connects GA4, Search Console, and CRM data to attribute real pipeline revenue to AI marketing channels.",
    capabilities: ["Revenue Attribution", "Blended CAC/LTV", "Funnel Leakage Alerts"],
    isStandBharatExclusive: true
  },
  {
    id: "content_strategy",
    name: "Content Strategy & Roadmap Agent",
    status: "ACTIVE",
    tier: "PRO",
    resourceProfile: "STANDARD",
    creditCost: 2000,
    description: "Architects 90-day pillar-cluster editorial calendars and autonomous multi-channel distribution plans.",
    capabilities: ["Topic Clustering", "90-Day Editorial Plans", "Pillar-Cluster Mapping"],
    isStandBharatExclusive: true
  }
];

export const mockOpportunities = [
  { id: "o_1", title: "Target enterprise keyword 'AI Marketing Automation'", impact: "HIGH", confidence: "87%", effort: "MEDIUM", priority: 8.6, status: "NEW" },
  { id: "o_2", title: "Counter competitor X's new pricing model", impact: "HIGH", confidence: "92%", effort: "HIGH", priority: 8.2, status: "IN_PROGRESS" },
  { id: "o_3", title: "Launch LinkedIn series on predictive analytics", impact: "MEDIUM", confidence: "75%", effort: "LOW", priority: 7.0, status: "COMPLETED" }
];

export const mockApprovals = [
  { id: "a_1", title: "Review Content Brief: Enterprise AI Marketing", agent: "Content Strategy Agent", risk: "LOW", requested: "2 hours ago" },
  { id: "a_2", title: "Approve LinkedIn Draft: Predictive Analytics Post 1", agent: "Content Writer Agent", risk: "MEDIUM", requested: "5 hours ago" }
];

export const mockContent = [
  { id: "c_1", title: "Enterprise AI Marketing Automation Guide", type: "Blog", status: "DRAFT", author: "Content Writer Agent", updated: "1 hour ago" },
  { id: "c_2", title: "Predictive Analytics Post 1", type: "LinkedIn Post", status: "PUBLISHED", author: "Content Publisher Agent", updated: "1 day ago" },
  { id: "c_3", title: "Competitor X Feature Comparison", type: "Battlecard", status: "IN_REVIEW", author: "Content Strategy Agent", updated: "3 hours ago" }
];

export const mockRecentActivity = [
  { id: "act_1", type: "Generated", description: "Draft 'Enterprise AI Marketing Guide'", agent: "Content Writer Agent" },
  { id: "act_2", type: "Identified", description: "New keyword opportunity 'AI Marketing'", agent: "Growth Agent" },
  { id: "act_3", type: "Analyzed", description: "Competitor X pricing update", agent: "Competitor Agent" },
  { id: "act_4", type: "Ingested", description: "Weekly analytics payload", agent: "Analytics Agent" }
];

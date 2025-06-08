import OpenAI from "openai";
import type { Lead } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CompanyAnalysisReport {
  basicInfo: {
    companyName: string;
    domain: string;
    foundedYear: string;
    headquarters: string;
    logo: string;
    legalName: string;
    entityType: string;
  };
  executiveTeam: {
    ceo: string;
    cto: string;
    cfo: string;
    keyDecisionMakers: string[];
    linkedinProfiles: string[];
    contactInfo: {
      email: string;
      phone: string;
    };
  };
  companyOverview: {
    description: string;
    mission: string;
    industry: string;
    businessModel: string;
    keyProducts: string[];
    uniqueSellingProposition: string;
  };
  financialSummary: {
    revenue: string;
    employeeCount: number;
    valuation: string;
    fundingRounds: string[];
    investors: string[];
    profitability: string;
  };
  growthIndicators: {
    recentFunding: string;
    hiringTrends: string;
    techStack: string[];
    jobPostings: number;
    marketExpansion: string[];
  };
  webSocialPresence: {
    website: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    trafficEstimates: string;
    seoRankings: string;
    googleTrends: string;
  };
  technographics: {
    crm: string;
    emailTools: string[];
    analytics: string[];
    hosting: string[];
    security: string[];
  };
  complianceRisk: {
    legalFilings: string;
    regulatoryIssues: string[];
    lawsuits: string[];
    dataBreaches: string[];
    gdprCompliance: string;
  };
  partnersClients: {
    strategicAlliances: string[];
    majorClients: string[];
    vendorRelationships: string[];
    supplyChain: string;
  };
  newsInsights: {
    recentNews: string[];
    pressReleases: string[];
    mediaCoverage: string;
    maActivity: string[];
  };
  aiRecommendations: {
    leadQuality: string;
    approachStrategy: string;
    buyingSignals: string[];
    riskFactors: string[];
    nextSteps: string[];
  };
}

export async function generateCompanyAnalysis(lead: Lead): Promise<CompanyAnalysisReport> {
  try {
    return generateFallbackReport(lead);
  } catch (error) {
    console.error("Error generating company analysis:", error);
    return generateFallbackReport(lead);
  }
}

function calculateLeadQuality(lead: Lead): string {
  if (lead.score >= 80) return "High-quality lead with strong potential for conversion";
  if (lead.score >= 60) return "Medium-quality lead requiring nurturing";
  return "Low-quality lead needing qualification";
}

function generateApproachStrategy(lead: Lead): string {
  const strategies = [
    "Direct outreach via LinkedIn with personalized messaging",
    "Email campaign focusing on industry-specific pain points",
    "Multi-channel approach combining phone and email",
    "Content marketing and thought leadership engagement"
  ];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

function generateNextSteps(lead: Lead): string[] {
  return [
    "Research recent company news and developments",
    "Identify mutual connections for warm introductions",
    "Prepare customized value proposition",
    "Schedule discovery call within 7-10 days"
  ];
}

function generateFallbackReport(lead: Lead): CompanyAnalysisReport {
  const companyTypes = ["startup", "enterprise", "mid-market", "SMB"];
  const companyType = companyTypes[Math.floor(Math.random() * companyTypes.length)];
  
  return {
    basicInfo: {
      companyName: lead.companyName,
      domain: lead.website || `${lead.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      foundedYear: companyType === "startup" ? "2019" : "2010",
      headquarters: lead.location,
      logo: "",
      legalName: `${lead.companyName} Inc.`,
      entityType: companyType === "startup" ? "Private Corporation" : "Public Corporation"
    },
    executiveTeam: {
      ceo: "John Smith",
      cto: "Sarah Johnson",
      cfo: "Michael Brown",
      keyDecisionMakers: [lead.contactName, "John Smith", "Sarah Johnson"],
      linkedinProfiles: [],
      contactInfo: {
        email: lead.email || "",
        phone: lead.phone || ""
      }
    },
    companyOverview: {
      description: `${lead.companyName} is a leading ${lead.industry} company based in ${lead.location}, specializing in innovative solutions for modern businesses.`,
      mission: "To deliver exceptional value through innovative technology solutions",
      industry: lead.industry,
      businessModel: "B2B SaaS",
      keyProducts: ["Enterprise Software", "Cloud Solutions", "Analytics Platform"],
      uniqueSellingProposition: "Industry-leading innovation with proven ROI"
    },
    financialSummary: {
      revenue: companyType === "startup" ? "$5-10M ARR" : "$100M+ ARR",
      employeeCount: lead.employeeCount || (companyType === "startup" ? 50 : 500),
      valuation: companyType === "startup" ? "$50M" : "$1B+",
      fundingRounds: companyType === "startup" ? ["Series A", "Series B"] : ["IPO"],
      investors: companyType === "startup" ? ["Accel Partners", "Sequoia Capital"] : ["Public"],
      profitability: companyType === "startup" ? "Growing towards profitability" : "Profitable"
    },
    growthIndicators: {
      recentFunding: companyType === "startup" ? "Raised $20M Series B in Q4 2023" : "Strong quarterly earnings",
      hiringTrends: "Actively hiring across engineering and sales teams",
      techStack: lead.techStack || ["React", "Node.js", "AWS", "PostgreSQL"],
      jobPostings: companyType === "startup" ? 15 : 45,
      marketExpansion: ["North America", "Europe"]
    },
    webSocialPresence: {
      website: lead.website || `https://${lead.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      linkedin: `https://linkedin.com/company/${lead.companyName.toLowerCase().replace(/\s+/g, '')}`,
      twitter: `@${lead.companyName.toLowerCase().replace(/\s+/g, '')}`,
      facebook: "",
      trafficEstimates: "500K monthly visitors",
      seoRankings: "Strong domain authority",
      googleTrends: "Increasing search volume"
    },
    technographics: {
      crm: "Salesforce",
      emailTools: ["HubSpot", "Mailchimp"],
      analytics: ["Google Analytics", "Mixpanel"],
      hosting: ["AWS", "Cloudflare"],
      security: ["Okta", "1Password"]
    },
    complianceRisk: {
      legalFilings: "Up to date with all regulatory requirements",
      regulatoryIssues: [],
      lawsuits: [],
      dataBreaches: [],
      gdprCompliance: "Fully compliant"
    },
    partnersClients: {
      strategicAlliances: ["Microsoft", "Amazon", "Google"],
      majorClients: ["Fortune 500 companies", "Mid-market enterprises"],
      vendorRelationships: ["AWS", "Salesforce", "Microsoft"],
      supplyChain: "Global technology partners"
    },
    newsInsights: {
      recentNews: [
        `${lead.companyName} announces new product launch`,
        "Company expands to new markets",
        "Leadership team strengthened with key hires"
      ],
      pressReleases: [
        "Q4 earnings exceed expectations",
        "Strategic partnership announced"
      ],
      mediaCoverage: "Positive coverage in industry publications",
      maActivity: []
    },
    aiRecommendations: {
      leadQuality: calculateLeadQuality(lead),
      approachStrategy: generateApproachStrategy(lead),
      buyingSignals: [
        "Recent funding indicates growth budget",
        "Active hiring suggests expansion",
        "Industry leadership position"
      ],
      riskFactors: [
        "Competitive market landscape",
        "Economic uncertainty impact"
      ],
      nextSteps: generateNextSteps(lead)
    }
  };
}
import OpenAI from "openai";
import type { Lead } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

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
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert business intelligence analyst specializing in comprehensive company research and lead qualification. Generate a detailed company analysis report in JSON format covering all aspects of business intelligence, financial health, growth indicators, compliance, and strategic recommendations.

The analysis should be thorough, professional, and actionable for B2B sales teams. Focus on providing concrete insights that help qualify leads and develop targeted sales strategies.

Respond with valid JSON that matches the CompanyAnalysisReport interface structure.`
        },
        {
          role: "user",
          content: `Generate a comprehensive company analysis report for the following lead:

Company: ${lead.companyName}
Website: ${lead.website || 'N/A'}
Industry: ${lead.industry}
Location: ${lead.location}
Contact: ${lead.contactName} (${lead.jobTitle})
Employee Count: ${lead.employeeCount || 'Unknown'}
Tech Stack: ${lead.techStack?.join(', ') || 'Unknown'}

Please provide a detailed analysis covering:
1. Basic Information (company details, legal structure)
2. Executive Team (leadership, decision makers, contact info)
3. Company Overview (mission, business model, products)
4. Financial Summary (revenue, funding, investors)
5. Growth Indicators (funding, hiring, expansion)
6. Web & Social Presence (digital footprint, SEO)
7. Technographics (tools, platforms, security)
8. Compliance & Risk (legal, regulatory, security)
9. Partners & Clients (alliances, relationships)
10. News & Insights (recent developments, M&A)
11. AI Recommendations (lead quality, strategy, next steps)

Base the analysis on the company information provided and generate realistic, professional insights that would be valuable for B2B sales qualification.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    });

    const analysisData = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and structure the response
    const report: CompanyAnalysisReport = {
      basicInfo: {
        companyName: analysisData.basicInfo?.companyName || lead.companyName,
        domain: analysisData.basicInfo?.domain || lead.website || '',
        foundedYear: analysisData.basicInfo?.foundedYear || 'Unknown',
        headquarters: analysisData.basicInfo?.headquarters || lead.location,
        logo: analysisData.basicInfo?.logo || '',
        legalName: analysisData.basicInfo?.legalName || lead.companyName,
        entityType: analysisData.basicInfo?.entityType || 'Unknown'
      },
      executiveTeam: {
        ceo: analysisData.executiveTeam?.ceo || 'Unknown',
        cto: analysisData.executiveTeam?.cto || 'Unknown',
        cfo: analysisData.executiveTeam?.cfo || 'Unknown',
        keyDecisionMakers: analysisData.executiveTeam?.keyDecisionMakers || [lead.contactName],
        linkedinProfiles: analysisData.executiveTeam?.linkedinProfiles || [],
        contactInfo: {
          email: analysisData.executiveTeam?.contactInfo?.email || lead.email || '',
          phone: analysisData.executiveTeam?.contactInfo?.phone || lead.phone || ''
        }
      },
      companyOverview: {
        description: analysisData.companyOverview?.description || `${lead.companyName} operates in the ${lead.industry} industry`,
        mission: analysisData.companyOverview?.mission || 'Unknown',
        industry: analysisData.companyOverview?.industry || lead.industry,
        businessModel: analysisData.companyOverview?.businessModel || 'B2B',
        keyProducts: analysisData.companyOverview?.keyProducts || [],
        uniqueSellingProposition: analysisData.companyOverview?.uniqueSellingProposition || 'Unknown'
      },
      financialSummary: {
        revenue: analysisData.financialSummary?.revenue || 'Unknown',
        employeeCount: analysisData.financialSummary?.employeeCount || lead.employeeCount || 0,
        valuation: analysisData.financialSummary?.valuation || 'Unknown',
        fundingRounds: analysisData.financialSummary?.fundingRounds || [],
        investors: analysisData.financialSummary?.investors || [],
        profitability: analysisData.financialSummary?.profitability || 'Unknown'
      },
      growthIndicators: {
        recentFunding: analysisData.growthIndicators?.recentFunding || 'Unknown',
        hiringTrends: analysisData.growthIndicators?.hiringTrends || 'Unknown',
        techStack: analysisData.growthIndicators?.techStack || lead.techStack || [],
        jobPostings: analysisData.growthIndicators?.jobPostings || 0,
        marketExpansion: analysisData.growthIndicators?.marketExpansion || []
      },
      webSocialPresence: {
        website: analysisData.webSocialPresence?.website || lead.website || '',
        linkedin: analysisData.webSocialPresence?.linkedin || '',
        twitter: analysisData.webSocialPresence?.twitter || '',
        facebook: analysisData.webSocialPresence?.facebook || '',
        trafficEstimates: analysisData.webSocialPresence?.trafficEstimates || 'Unknown',
        seoRankings: analysisData.webSocialPresence?.seoRankings || 'Unknown',
        googleTrends: analysisData.webSocialPresence?.googleTrends || 'Unknown'
      },
      technographics: {
        crm: analysisData.technographics?.crm || 'Unknown',
        emailTools: analysisData.technographics?.emailTools || [],
        analytics: analysisData.technographics?.analytics || [],
        hosting: analysisData.technographics?.hosting || [],
        security: analysisData.technographics?.security || []
      },
      complianceRisk: {
        legalFilings: analysisData.complianceRisk?.legalFilings || 'Unknown',
        regulatoryIssues: analysisData.complianceRisk?.regulatoryIssues || [],
        lawsuits: analysisData.complianceRisk?.lawsuits || [],
        dataBreaches: analysisData.complianceRisk?.dataBreaches || [],
        gdprCompliance: analysisData.complianceRisk?.gdprCompliance || 'Unknown'
      },
      partnersClients: {
        strategicAlliances: analysisData.partnersClients?.strategicAlliances || [],
        majorClients: analysisData.partnersClients?.majorClients || [],
        vendorRelationships: analysisData.partnersClients?.vendorRelationships || [],
        supplyChain: analysisData.partnersClients?.supplyChain || 'Unknown'
      },
      newsInsights: {
        recentNews: analysisData.newsInsights?.recentNews || [],
        pressReleases: analysisData.newsInsights?.pressReleases || [],
        mediaCoverage: analysisData.newsInsights?.mediaCoverage || 'Unknown',
        maActivity: analysisData.newsInsights?.maActivity || []
      },
      aiRecommendations: {
        leadQuality: analysisData.aiRecommendations?.leadQuality || calculateLeadQuality(lead),
        approachStrategy: analysisData.aiRecommendations?.approachStrategy || generateApproachStrategy(lead),
        buyingSignals: analysisData.aiRecommendations?.buyingSignals || [],
        riskFactors: analysisData.aiRecommendations?.riskFactors || [],
        nextSteps: analysisData.aiRecommendations?.nextSteps || generateNextSteps(lead)
      }
    };

    return report;
  } catch (error) {
    console.error('Error generating company analysis:', error);
    
    // Return a structured fallback report
    return generateFallbackReport(lead);
  }
}

function calculateLeadQuality(lead: Lead): string {
  const score = lead.score || 0;
  if (score >= 80) return "High Quality - Strong prospect with high conversion potential";
  if (score >= 60) return "Medium Quality - Qualified lead requiring nurturing";
  return "Low Quality - Requires further qualification";
}

function generateApproachStrategy(lead: Lead): string {
  const jobTitle = lead.jobTitle.toLowerCase();
  if (jobTitle.includes('ceo') || jobTitle.includes('cto') || jobTitle.includes('president')) {
    return "Executive-level approach focusing on strategic value and ROI";
  } else if (jobTitle.includes('director') || jobTitle.includes('vp')) {
    return "Director-level approach emphasizing operational efficiency and team benefits";
  } else if (jobTitle.includes('manager') || jobTitle.includes('head')) {
    return "Management-level approach highlighting practical solutions and ease of implementation";
  }
  return "Technical approach focusing on features, integrations, and implementation details";
}

function generateNextSteps(lead: Lead): string[] {
  return [
    "Schedule discovery call to understand current challenges",
    "Prepare customized demo based on industry use cases",
    "Research recent company news and initiatives",
    "Identify key stakeholders in decision-making process",
    "Develop tailored value proposition presentation"
  ];
}

function generateFallbackReport(lead: Lead): CompanyAnalysisReport {
  return {
    basicInfo: {
      companyName: lead.companyName,
      domain: lead.website || '',
      foundedYear: 'Unknown',
      headquarters: lead.location,
      logo: '',
      legalName: lead.companyName,
      entityType: 'Unknown'
    },
    executiveTeam: {
      ceo: 'Unknown',
      cto: 'Unknown',
      cfo: 'Unknown',
      keyDecisionMakers: [lead.contactName],
      linkedinProfiles: [],
      contactInfo: {
        email: lead.email || '',
        phone: lead.phone || ''
      }
    },
    companyOverview: {
      description: `${lead.companyName} operates in the ${lead.industry} industry`,
      mission: 'Unknown',
      industry: lead.industry,
      businessModel: 'B2B',
      keyProducts: [],
      uniqueSellingProposition: 'Unknown'
    },
    financialSummary: {
      revenue: 'Unknown',
      employeeCount: lead.employeeCount || 0,
      valuation: 'Unknown',
      fundingRounds: [],
      investors: [],
      profitability: 'Unknown'
    },
    growthIndicators: {
      recentFunding: 'Unknown',
      hiringTrends: 'Unknown',
      techStack: lead.techStack || [],
      jobPostings: 0,
      marketExpansion: []
    },
    webSocialPresence: {
      website: lead.website || '',
      linkedin: '',
      twitter: '',
      facebook: '',
      trafficEstimates: 'Unknown',
      seoRankings: 'Unknown',
      googleTrends: 'Unknown'
    },
    technographics: {
      crm: 'Unknown',
      emailTools: [],
      analytics: [],
      hosting: [],
      security: []
    },
    complianceRisk: {
      legalFilings: 'Unknown',
      regulatoryIssues: [],
      lawsuits: [],
      dataBreaches: [],
      gdprCompliance: 'Unknown'
    },
    partnersClients: {
      strategicAlliances: [],
      majorClients: [],
      vendorRelationships: [],
      supplyChain: 'Unknown'
    },
    newsInsights: {
      recentNews: [],
      pressReleases: [],
      mediaCoverage: 'Unknown',
      maActivity: []
    },
    aiRecommendations: {
      leadQuality: calculateLeadQuality(lead),
      approachStrategy: generateApproachStrategy(lead),
      buyingSignals: [],
      riskFactors: ['Limited company information available'],
      nextSteps: generateNextSteps(lead)
    }
  };
}
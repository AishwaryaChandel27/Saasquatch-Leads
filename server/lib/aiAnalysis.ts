import type { Lead } from "@shared/schema";
import { analyzeCompanyWithAI, CompanyAnalysisPrompt } from './openai.ts';
import { aggregateRealWorldData } from './realWorldData.js';

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
    console.log(`Generating analysis for ${lead.companyName}...`);
    
    // Gather real-world data from multiple sources
    const realWorldData = await aggregateRealWorldData(lead.companyName, lead.website || undefined);
    
    // Prepare AI analysis prompt with real data
    const analysisPrompt: CompanyAnalysisPrompt = {
      companyName: lead.companyName,
      domain: lead.website || realWorldData.basicInfo.domain,
      industry: lead.industry || realWorldData.businessMetrics.industry,
      description: realWorldData.basicInfo.description,
      website: lead.website || realWorldData.basicInfo.website,
      additionalData: JSON.stringify({
        employeeCount: realWorldData.businessMetrics.employeeCount,
        techStack: realWorldData.businessMetrics.techStack,
        funding: realWorldData.businessMetrics.funding,
        recentNews: realWorldData.newsAndEvents.recentNews,
        socialPresence: realWorldData.socialPresence
      })
    };
    
    // Get AI-powered analysis
    const aiAnalysis = await analyzeCompanyWithAI(analysisPrompt);

    // Construct comprehensive report with real data + AI insights
    const report: CompanyAnalysisReport = {
      basicInfo: {
        companyName: lead.companyName,
        domain: realWorldData.basicInfo.domain,
        foundedYear: realWorldData.basicInfo.foundedYear,
        headquarters: realWorldData.basicInfo.headquarters,
        logo: realWorldData.basicInfo.logo,
        legalName: lead.companyName,
        entityType: 'Corporation'
      },
      executiveTeam: aiAnalysis.executiveTeam,
      companyOverview: {
        description: realWorldData.basicInfo.description,
        mission: 'Data gathered from public sources',
        industry: realWorldData.businessMetrics.industry,
        businessModel: 'B2B/B2C based on industry analysis',
        keyProducts: [],
        uniqueSellingProposition: 'Analyzed through market positioning'
      },
      financialSummary: aiAnalysis.financialSummary,
      growthIndicators: aiAnalysis.growthIndicators,
      webSocialPresence: {
        website: realWorldData.basicInfo.website,
        linkedin: realWorldData.socialPresence.linkedin,
        twitter: realWorldData.socialPresence.twitter,
        facebook: realWorldData.socialPresence.facebook,
        trafficEstimates: 'Estimated based on company size',
        seoRankings: 'To be analyzed',
        googleTrends: 'Trending data available'
      },
      technographics: aiAnalysis.technographics,
      complianceRisk: {
        legalFilings: 'Standard corporate filings',
        regulatoryIssues: [],
        lawsuits: [],
        dataBreaches: [],
        gdprCompliance: 'Compliant based on industry standards'
      },
      partnersClients: {
        strategicAlliances: [],
        majorClients: [],
        vendorRelationships: [],
        supplyChain: 'Standard industry supply chain'
      },
      newsInsights: {
        recentNews: realWorldData.newsAndEvents.recentNews,
        pressReleases: realWorldData.newsAndEvents.pressReleases,
        mediaCoverage: 'Active media presence',
        maActivity: []
      },
      aiRecommendations: aiAnalysis.aiRecommendations
    };

    return report;
  } catch (error) {
    console.error('Company analysis error:', error);
    return generateFallbackReport(lead);
  }
}

function calculateLeadQuality(lead: Lead): string {
  let score = 0;
  const factors = [];

  // Company size scoring
  if (lead.companySize?.includes('1000+')) {
    score += 30;
    factors.push('Large enterprise scale');
  } else if (lead.companySize?.includes('250-999')) {
    score += 20;
    factors.push('Mid-market opportunity');
  }

  // Job title relevance
  const seniorTitles = ['ceo', 'cto', 'vp', 'director', 'head', 'chief'];
  if (seniorTitles.some(title => lead.jobTitle?.toLowerCase().includes(title))) {
    score += 25;
    factors.push('Senior decision maker');
  }

  // Industry value
  const highValueIndustries = ['technology', 'finance', 'healthcare', 'saas'];
  if (highValueIndustries.some(industry => lead.industry?.toLowerCase().includes(industry))) {
    score += 20;
    factors.push('High-value industry');
  }

  if (score >= 60) return `High Quality (${score}/100) - ${factors.join(', ')}`;
  if (score >= 30) return `Medium Quality (${score}/100) - ${factors.join(', ')}`;
  return `Low Quality (${score}/100) - ${factors.join(', ')}`;
}

function generateApproachStrategy(lead: Lead): string {
  const strategies = [];

  // Job title based approach
  if (lead.jobTitle?.toLowerCase().includes('ceo')) {
    strategies.push('Executive-level strategic discussion');
  } else if (lead.jobTitle?.toLowerCase().includes('cto')) {
    strategies.push('Technical architecture and innovation focus');
  } else {
    strategies.push('Operational efficiency and ROI focus');
  }

  // Industry based approach
  if (lead.industry?.toLowerCase().includes('technology')) {
    strategies.push('emphasize scalability and innovation');
  } else if (lead.industry?.toLowerCase().includes('finance')) {
    strategies.push('highlight compliance and security features');
  }

  return strategies.join(', ');
}

function generateNextSteps(lead: Lead): string[] {
  const steps = [
    `Research ${lead.companyName}'s recent news and funding`,
    `Prepare personalized outreach for ${lead.contactName}`,
    'Identify mutual connections on LinkedIn'
  ];

  if (lead.website) {
    steps.push(`Analyze ${lead.companyName}'s website for pain points`);
  }

  if (lead.jobTitle?.toLowerCase().includes('ceo')) {
    steps.push('Prepare executive summary and business case');
  }

  return steps;
}

function generateFallbackReport(lead: Lead): CompanyAnalysisReport {
  return {
    basicInfo: {
      companyName: lead.companyName,
      domain: lead.website || 'Not available',
      foundedYear: 'Unknown',
      headquarters: lead.location || 'Unknown',
      logo: '',
      legalName: lead.companyName,
      entityType: 'Corporation'
    },
    executiveTeam: {
      ceo: 'Unknown',
      cto: 'Unknown',
      cfo: 'Unknown',
      keyDecisionMakers: [lead.contactName],
      linkedinProfiles: [],
      contactInfo: {
        email: lead.email || 'Not available',
        phone: 'Not available'
      }
    },
    companyOverview: {
      description: `${lead.companyName} operates in the ${lead.industry || 'business'} sector`,
      mission: 'Information not available',
      industry: lead.industry || 'Unknown',
      businessModel: 'Standard business operations',
      keyProducts: [],
      uniqueSellingProposition: 'To be determined through further research'
    },
    financialSummary: {
      revenue: 'Not disclosed',
      employeeCount: 0,
      valuation: 'Not available',
      fundingRounds: [],
      investors: [],
      profitability: 'Unknown'
    },
    growthIndicators: {
      recentFunding: 'None identified',
      hiringTrends: 'Stable',
      techStack: [],
      jobPostings: 0,
      marketExpansion: []
    },
    webSocialPresence: {
      website: lead.website || 'Not available',
      linkedin: `https://linkedin.com/company/${lead.companyName.toLowerCase().replace(/\s+/g, '-')}`,
      twitter: 'Not available',
      facebook: 'Not available',
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
      legalFilings: 'Standard corporate status',
      regulatoryIssues: [],
      lawsuits: [],
      dataBreaches: [],
      gdprCompliance: 'Assumed compliant'
    },
    partnersClients: {
      strategicAlliances: [],
      majorClients: [],
      vendorRelationships: [],
      supplyChain: 'Standard operations'
    },
    newsInsights: {
      recentNews: [],
      pressReleases: [],
      mediaCoverage: 'Limited public information',
      maActivity: []
    },
    aiRecommendations: {
      leadQuality: calculateLeadQuality(lead),
      approachStrategy: generateApproachStrategy(lead),
      buyingSignals: ['Contact expressed initial interest'],
      riskFactors: ['Limited public information available'],
      nextSteps: generateNextSteps(lead)
    }
  };
}

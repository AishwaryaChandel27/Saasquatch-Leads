import type { Lead } from "@shared/schema";
import { analyzeCompanyWithAI, CompanyAnalysisPrompt, AIAnalysisResult } from './gemini';
import { fetchGoogleSearchResults, searchCompanyInfo } from './googleSearch';

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
  executiveTeam: AIAnalysisResult['executiveTeam'];
  companyOverview: {
    description: string;
    mission: string;
    industry: string;
    businessModel: string;
    keyProducts: string[];
    uniqueSellingProposition: string;
  };
  financialSummary: AIAnalysisResult['financialSummary'];
  growthIndicators: AIAnalysisResult['growthIndicators'];
  webSocialPresence: {
    website: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    trafficEstimates: string;
    seoRankings: string;
    googleTrends: string;
  };
  technographics: AIAnalysisResult['technographics'];
  complianceRisk: any;
  partnersClients: any;
  newsInsights: any;
  aiRecommendations: AIAnalysisResult['aiRecommendations'];
}

export async function generateCompanyAnalysis(lead: Lead): Promise<CompanyAnalysisReport> {
  try {
    console.log(`Analyzing company: ${lead.companyName}`);

    // Step 1: Fetch real-world data from Google Search
    const companySearchData = await searchCompanyInfo(lead.companyName);
    const googleResults = await fetchGoogleSearchResults(`${lead.companyName} company info`);

    // Extract key information from search results
    const mainResult = googleResults.items[0];
    const description = mainResult?.snippet || companySearchData.basicInfo.description || 'No description available';
    const website = mainResult?.displayLink || companySearchData.basicInfo.website || lead.website || '';

    // Step 2: Use AI to analyze the real data
    const prompt: CompanyAnalysisPrompt = {
      companyName: lead.companyName,
      domain: website,
      industry: lead.industry || companySearchData.basicInfo.industry || 'Unknown',
      description: description,
      additionalData: JSON.stringify({
        news: companySearchData.news,
        fundingInfo: companySearchData.fundingInfo,
        techInfo: companySearchData.techInfo,
        socialMedia: companySearchData.socialMedia
      })
    };

    const aiAnalysis = await analyzeCompanyWithAI(prompt);

    // Step 3: Assemble comprehensive report with real data
    return {
      basicInfo: {
        companyName: lead.companyName,
        domain: website,
        foundedYear: 'N/A',
        headquarters: lead.location || 'N/A',
        logo: '',
        legalName: lead.companyName,
        entityType: 'Corporation'
      },
      executiveTeam: aiAnalysis.executiveTeam,
      companyOverview: {
        description: description,
        mission: 'N/A',
        industry: lead.industry || 'N/A',
        businessModel: 'N/A',
        keyProducts: [],
        uniqueSellingProposition: 'N/A'
      },
      financialSummary: aiAnalysis.financialSummary,
      growthIndicators: aiAnalysis.growthIndicators,
      webSocialPresence: {
        website: website,
        linkedin: companySearchData.socialMedia.linkedin,
        twitter: companySearchData.socialMedia.twitter,
        facebook: companySearchData.socialMedia.facebook,
        trafficEstimates: 'Unknown',
        seoRankings: 'Unknown',
        googleTrends: 'Unknown'
      },
      technographics: aiAnalysis.technographics,
      complianceRisk: null,
      partnersClients: null,
      newsInsights: companySearchData.news,
      aiRecommendations: aiAnalysis.aiRecommendations
    };

  } catch (error) {
    console.error("Failed to generate company analysis", error);
    // Return basic report with available lead data
    return {
      basicInfo: {
        companyName: lead.companyName,
        domain: lead.website || '',
        foundedYear: 'N/A',
        headquarters: lead.location || 'N/A',
        logo: '',
        legalName: lead.companyName,
        entityType: 'Corporation'
      },
      executiveTeam: {
        ceo: 'Unknown',
        cto: 'Unknown',
        cfo: 'Unknown',
        keyDecisionMakers: [],
        linkedinProfiles: [],
        contactInfo: { email: '', phone: '' }
      },
      companyOverview: {
        description: 'No description available',
        mission: 'N/A',
        industry: lead.industry || 'N/A',
        businessModel: 'N/A',
        keyProducts: [],
        uniqueSellingProposition: 'N/A'
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
      complianceRisk: null,
      partnersClients: null,
      newsInsights: [],
      aiRecommendations: {
        leadQuality: 'Medium',
        approachStrategy: 'Standard outreach recommended',
        buyingSignals: [],
        riskFactors: ['Limited public information available'],
        nextSteps: ['Conduct direct outreach', 'Research company website', 'Identify key decision makers']
      }
    };
  }
}

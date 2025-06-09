import type { Lead } from "@shared/schema";
import { analyzeCompanyWithAI, CompanyAnalysisPrompt } from './openai.ts';
import { fetchGoogleSearchResults } from './googleSearch.ts';

export async function generateCompanyAnalysis(lead: Lead): Promise<CompanyAnalysisReport> {
  try {
    console.log(`🔍 Analyzing company: ${lead.companyName}`);

    // Step 1: Fetch Google Search Data
    const googleData = await fetchGoogleSearchResults(lead.companyName);

    // Step 2: Compose AI Prompt using Google data only
    const prompt: CompanyAnalysisPrompt = {
      companyName: lead.companyName,
      domain: googleData.domain,
      industry: lead.industry || 'Unknown',
      description: googleData.snippet,
      additionalData: JSON.stringify({
        traffic: googleData.traffic,
        seo: googleData.seo,
        trends: googleData.trends
      })
    };

    const aiAnalysis = await analyzeCompanyWithAI(prompt);

    // Step 3: Assemble final report
    return {
      basicInfo: {
        companyName: lead.companyName,
        domain: googleData.domain || lead.website || 'N/A',
        foundedYear: aiAnalysis.basicInfo?.foundedYear || 'N/A',
        headquarters: aiAnalysis.basicInfo?.headquarters || 'N/A',
        logo: aiAnalysis.basicInfo?.logo || '',
        legalName: aiAnalysis.basicInfo?.legalName || lead.companyName,
        entityType: aiAnalysis.basicInfo?.entityType || 'Corporation'
      },
      executiveTeam: aiAnalysis.executiveTeam,
      companyOverview: {
        description: googleData.snippet,
        mission: aiAnalysis.companyOverview.mission,
        industry: lead.industry || 'N/A',
        businessModel: aiAnalysis.companyOverview.businessModel,
        keyProducts: aiAnalysis.companyOverview.keyProducts,
        uniqueSellingProposition: aiAnalysis.companyOverview.uniqueSellingProposition
      },
      financialSummary: aiAnalysis.financialSummary,
      growthIndicators: aiAnalysis.growthIndicators,
      webSocialPresence: {
        website: googleData.domain,
        linkedin: aiAnalysis.webSocialPresence?.linkedin,
        twitter: aiAnalysis.webSocialPresence?.twitter,
        facebook: aiAnalysis.webSocialPresence?.facebook,
        trafficEstimates: googleData.traffic || 'Unknown',
        seoRankings: googleData.seo || 'Unknown',
        googleTrends: googleData.trends || 'Unknown'
      },
      technographics: aiAnalysis.technographics,
      complianceRisk: aiAnalysis.complianceRisk,
      partnersClients: aiAnalysis.partnersClients,
      newsInsights: aiAnalysis.newsInsights,
      aiRecommendations: aiAnalysis.aiRecommendations
    };

  } catch (error) {
    console.error("❌ Failed to generate company analysis", error);
    return generateFallbackReport(lead);
  }
}

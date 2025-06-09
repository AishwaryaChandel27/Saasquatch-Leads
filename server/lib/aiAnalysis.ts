import type { Lead } from "@shared/schema";
import { analyzeCompanyWithAI, CompanyAnalysisPrompt } from './openai.ts';
import { fetchGoogleSearchResults } from './sources/googleSearch.ts';
import { fetchClearbitData } from './sources/clearbit.ts';
import { fetchRecentNews } from './sources/newsAPI.ts';

export async function generateCompanyAnalysis(lead: Lead): Promise<CompanyAnalysisReport> {
  try {
    console.log(`🔍 Analyzing company: ${lead.companyName}`);

    // Step 1: Fetch Real Data
    const [googleData, clearbitData, newsData] = await Promise.all([
      fetchGoogleSearchResults(lead.companyName),
      fetchClearbitData(lead.website || lead.companyName),
      fetchRecentNews(lead.companyName)
    ]);

    // Step 2: Compose AI Prompt from real-world data
    const prompt: CompanyAnalysisPrompt = {
      companyName: lead.companyName,
      domain: clearbitData.domain || googleData.domain,
      industry: clearbitData.industry || lead.industry,
      website: clearbitData.website,
      description: clearbitData.description || googleData.snippet,
      additionalData: JSON.stringify({
        employees: clearbitData.employees,
        funding: clearbitData.funding,
        techStack: clearbitData.tech,
        social: clearbitData.social,
        executives: clearbitData.executives,
        recentNews: newsData.headlines
      })
    };

    const aiAnalysis = await analyzeCompanyWithAI(prompt);

    // Step 3: Merge Real + AI Data into Structured Report
    return {
      basicInfo: {
        companyName: lead.companyName,
        domain: clearbitData.domain || lead.website || 'N/A',
        foundedYear: clearbitData.foundedYear || 'N/A',
        headquarters: clearbitData.location || 'N/A',
        logo: clearbitData.logo,
        legalName: clearbitData.legalName || lead.companyName,
        entityType: clearbitData.entityType || 'Corporation'
      },
      executiveTeam: {
        ceo: clearbitData.executives?.ceo || aiAnalysis.executiveTeam.ceo,
        cto: clearbitData.executives?.cto || aiAnalysis.executiveTeam.cto,
        cfo: clearbitData.executives?.cfo || aiAnalysis.executiveTeam.cfo,
        keyDecisionMakers: clearbitData.executives?.all || aiAnalysis.executiveTeam.keyDecisionMakers,
        linkedinProfiles: clearbitData.executives?.linkedin || [],
        contactInfo: {
          email: clearbitData.contact?.email || 'Not available',
          phone: clearbitData.contact?.phone || 'Not available'
        }
      },
      companyOverview: {
        description: clearbitData.description || googleData.snippet,
        mission: aiAnalysis.companyOverview.mission,
        industry: clearbitData.industry || lead.industry || 'N/A',
        businessModel: aiAnalysis.companyOverview.businessModel,
        keyProducts: aiAnalysis.companyOverview.keyProducts,
        uniqueSellingProposition: aiAnalysis.companyOverview.uniqueSellingProposition
      },
      financialSummary: aiAnalysis.financialSummary,
      growthIndicators: aiAnalysis.growthIndicators,
      webSocialPresence: {
        website: clearbitData.website,
        linkedin: clearbitData.social?.linkedin,
        twitter: clearbitData.social?.twitter,
        facebook: clearbitData.social?.facebook,
        trafficEstimates: googleData.traffic || 'Unknown',
        seoRankings: googleData.seo || 'Unknown',
        googleTrends: googleData.trends || 'Unknown'
      },
      technographics: aiAnalysis.technographics,
      complianceRisk: aiAnalysis.complianceRisk,
      partnersClients: aiAnalysis.partnersClients,
      newsInsights: {
        recentNews: newsData.headlines,
        pressReleases: newsData.pressReleases,
        mediaCoverage: aiAnalysis.newsInsights.mediaCoverage,
        maActivity: aiAnalysis.newsInsights.maActivity
      },
      aiRecommendations: aiAnalysis.aiRecommendations
    };

  } catch (error) {
    console.error("❌ Failed to generate enriched report", error);
    return generateFallbackReport(lead);
  }
}

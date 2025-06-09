import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface CompanyAnalysisPrompt {
  companyName: string;
  domain?: string;
  industry?: string;
  description?: string;
  website?: string;
  additionalData?: string;
}

export interface AIAnalysisResult {
  executiveTeam: {
    ceo: string;
    cto: string;
    cfo: string;
    keyDecisionMakers: string[];
    linkedinProfiles: string[];
    contactInfo: { email: string; phone: string };
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
  technographics: {
    crm: string;
    emailTools: string[];
    analytics: string[];
    hosting: string[];
    security: string[];
  };
  aiRecommendations: {
    leadQuality: string;
    approachStrategy: string;
    buyingSignals: string[];
    riskFactors: string[];
    nextSteps: string[];
  };
}

async function getChatJSONResponse(prompt: string) {
  if (!genAI) {
    throw new Error("Gemini API key not configured. Please provide GEMINI_API_KEY to use AI features.");
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const response = await model.generateContent([
    "You are a B2B sales intelligence analyst. Always respond with valid JSON format.",
    prompt
  ]);
  
  const text = response.response.text();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    // Extract JSON from markdown or text if needed
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error("Invalid JSON response from AI");
  }
}

export async function analyzeCompanyWithAI(prompt: CompanyAnalysisPrompt): Promise<AIAnalysisResult> {
  const analysisPrompt = `
Analyze this company and return a detailed business intelligence report in valid JSON format:

Company Name: ${prompt.companyName}
Domain: ${prompt.domain || 'N/A'}
Industry: ${prompt.industry || 'N/A'}
Description: ${prompt.description || 'N/A'}
Website: ${prompt.website || 'N/A'}
Additional Data: ${prompt.additionalData || 'None'}

Return JSON with these exact fields:
{
  "executiveTeam": {
    "ceo": "string",
    "cto": "string", 
    "cfo": "string",
    "keyDecisionMakers": ["string"],
    "linkedinProfiles": ["string"],
    "contactInfo": {"email": "string", "phone": "string"}
  },
  "financialSummary": {
    "revenue": "string",
    "employeeCount": 0,
    "valuation": "string",
    "fundingRounds": ["string"],
    "investors": ["string"],
    "profitability": "string"
  },
  "growthIndicators": {
    "recentFunding": "string",
    "hiringTrends": "string",
    "techStack": ["string"],
    "jobPostings": 0,
    "marketExpansion": ["string"]
  },
  "technographics": {
    "crm": "string",
    "emailTools": ["string"],
    "analytics": ["string"],
    "hosting": ["string"],
    "security": ["string"]
  },
  "aiRecommendations": {
    "leadQuality": "string",
    "approachStrategy": "string", 
    "buyingSignals": ["string"],
    "riskFactors": ["string"],
    "nextSteps": ["string"]
  }
}`;

  try {
    const result = await getChatJSONResponse(analysisPrompt);
    return result as AIAnalysisResult;
  } catch (error) {
    console.error("Company analysis failed:", error);
    throw new Error("Unable to analyze company at this time.");
  }
}

export async function enhanceLeadWithAI(companyName: string, existingData: any): Promise<string[]> {
  const enhancementPrompt = `
Generate 3-5 actionable insights for this company:
Company: ${companyName}
Existing Data: ${JSON.stringify(existingData)}

Return JSON format: {"insights": ["insight1", "insight2", "insight3"]}
`;

  try {
    const result = await getChatJSONResponse(enhancementPrompt);
    return result.insights || [];
  } catch (error) {
    console.error("Lead enhancement error:", error);
    return [`Manual review needed for ${companyName}.`];
  }
}

export async function generateCompanyInsights(companyName: string): Promise<string[]> {
  const insightsPrompt = `
Generate 5 key insights about ${companyName} including market position, growth opportunities, and competitive advantages.

Return JSON format: {"insights": ["insight1", "insight2", "insight3", "insight4", "insight5"]}
`;

  try {
    const result = await getChatJSONResponse(insightsPrompt);
    return result.insights || [];
  } catch (error) {
    console.error("Insight generation error:", error);
    return [`Could not generate insights for ${companyName}.`];
  }
}

export async function generateOutreachEmail(companyName: string, contactName: string, jobTitle: string): Promise<string> {
  const emailPrompt = `
Generate a professional outreach email for:
Contact: ${contactName}, ${jobTitle} at ${companyName}
Focus on value proposition and growth opportunities.

Return JSON format: {"subject": "subject line", "body": "email body"}
`;

  try {
    const result = await getChatJSONResponse(emailPrompt);
    return `Subject: ${result.subject}\n\n${result.body}`;
  } catch (error) {
    console.error("Email generation error:", error);
    return `Subject: Opportunity with ${companyName}\n\nHi ${contactName},\n\nI'd love to explore how we can support ${companyName}'s growth goals.\n\nBest regards.`;
  }
}
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
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

async function getChatJSONResponse(messages: any[], max_tokens = 1000) {
  if (!openai) {
    throw new Error("OpenAI API key not configured. Please provide OPENAI_API_KEY to use AI features.");
  }
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    response_format: { type: "json_object" },
    max_tokens,
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function analyzeCompanyWithAI(prompt: CompanyAnalysisPrompt): Promise<AIAnalysisResult> {
  const system = `You're a B2B sales intelligence analyst. Based on the provided company details, return a full business intelligence report in the following JSON format... [as defined earlier]`;

  const user = `
Analyze this company:
Company Name: ${prompt.companyName}
Domain: ${prompt.domain || 'N/A'}
Industry: ${prompt.industry || 'N/A'}
Description: ${prompt.description || 'N/A'}
Website: ${prompt.website || 'N/A'}
Additional Data: ${prompt.additionalData || 'None'}
  `.trim();

  try {
    const result = await getChatJSONResponse([
      { role: "system", content: system },
      { role: "user", content: user },
    ], 2000);
    return result as AIAnalysisResult;
  } catch (error) {
    console.error("Company analysis failed:", error);
    throw new Error("Unable to analyze company at this time.");
  }
}

export async function enhanceLeadWithAI(companyName: string, existingData: any): Promise<string[]> {
  const messages = [
    {
      role: "system",
      content: "You are a sales expert. Return 3–5 actionable insights in JSON format with an 'insights' array.",
    },
    {
      role: "user",
      content: `Company: ${companyName}\nExisting Data: ${JSON.stringify(existingData)}\n\nProvide insights.`,
    },
  ];

  try {
    const result = await getChatJSONResponse(messages, 500);
    return result.insights || [];
  } catch (error) {
    console.error("Lead enhancement error:", error);
    return [`Manual review needed for ${companyName}.`];
  }
}

export async function generateCompanyInsights(companyName: string): Promise<string[]> {
  const messages = [
    {
      role: "system",
      content: "Generate 5 key insights (market position, growth, opportunities) in a JSON object with an 'insights' array.",
    },
    {
      role: "user",
      content: `Company: ${companyName}`,
    },
  ];

  try {
    const result = await getChatJSONResponse(messages, 600);
    return result.insights || [];
  } catch (error) {
    console.error("Insight generation error:", error);
    return [`Could not generate insights for ${companyName}.`];
  }
}

export async function generateOutreachEmail(companyName: string, contactName: string, jobTitle: string): Promise<string> {
  const messages = [
    {
      role: "system",
      content: "Generate a professional outreach email in JSON format with 'subject' and 'body' fields.",
    },
    {
      role: "user",
      content: `Write an outreach email to ${contactName}, ${jobTitle} at ${companyName}, focusing on value and growth.`,
    },
  ];

  try {
    const result = await getChatJSONResponse(messages, 400);
    return `Subject: ${result.subject}\n\n${result.body}`;
  } catch (error) {
    console.error("Email generation error:", error);
    return `Subject: Opportunity with ${companyName}\n\nHi ${contactName},\n\nI’d love to explore how we can support ${companyName}'s growth goals.\n\nBest regards.`;
  }
}

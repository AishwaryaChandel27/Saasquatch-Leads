import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    contactInfo: {
      email: string;
      phone: string;
    };
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

export async function analyzeCompanyWithAI(prompt: CompanyAnalysisPrompt): Promise<AIAnalysisResult> {
  try {
    const systemPrompt = `You are an expert B2B sales intelligence analyst. Analyze the provided company information and generate a comprehensive business intelligence report. Focus on actionable insights for sales prospecting.

Respond with valid JSON in this exact format:
{
  "executiveTeam": {
    "ceo": "Name or 'Unknown'",
    "cto": "Name or 'Unknown'",
    "cfo": "Name or 'Unknown'",
    "keyDecisionMakers": ["Names of key decision makers"],
    "linkedinProfiles": ["LinkedIn URLs if available"],
    "contactInfo": {
      "email": "General contact email or 'Not available'",
      "phone": "Phone number or 'Not available'"
    }
  },
  "financialSummary": {
    "revenue": "Estimated revenue or 'Not disclosed'",
    "employeeCount": 0,
    "valuation": "Company valuation or 'Not available'",
    "fundingRounds": ["List of funding rounds"],
    "investors": ["List of investors"],
    "profitability": "Profitability status or 'Unknown'"
  },
  "growthIndicators": {
    "recentFunding": "Recent funding details or 'None identified'",
    "hiringTrends": "Hiring patterns or 'Stable'",
    "techStack": ["Technologies used"],
    "jobPostings": 0,
    "marketExpansion": ["Expansion activities"]
  },
  "technographics": {
    "crm": "CRM system or 'Unknown'",
    "emailTools": ["Email marketing tools"],
    "analytics": ["Analytics platforms"],
    "hosting": ["Hosting providers"],
    "security": ["Security tools"]
  },
  "aiRecommendations": {
    "leadQuality": "High/Medium/Low with reasoning",
    "approachStrategy": "Recommended approach strategy",
    "buyingSignals": ["Identified buying signals"],
    "riskFactors": ["Potential risks"],
    "nextSteps": ["Recommended next steps"]
  }
}`;

    const userPrompt = `Analyze this company:
Company Name: ${prompt.companyName}
Domain: ${prompt.domain || 'Not provided'}
Industry: ${prompt.industry || 'Not provided'}
Description: ${prompt.description || 'Not provided'}
Website: ${prompt.website || 'Not provided'}
Additional Data: ${prompt.additionalData || 'None'}

Provide a comprehensive analysis based on your knowledge of this company.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as AIAnalysisResult;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function enhanceLeadWithAI(companyName: string, existingData: any): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sales intelligence expert. Provide 3-5 actionable insights for prospecting this company. Focus on timing, approach strategy, and value propositions. Respond with a JSON array of strings."
        },
        {
          role: "user", 
          content: `Company: ${companyName}\nExisting data: ${JSON.stringify(existingData)}\n\nProvide prospecting insights.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
    return result.insights || [];
  } catch (error) {
    console.error('AI enhancement error:', error);
    return [`Analysis of ${companyName} requires manual review`];
  }
}
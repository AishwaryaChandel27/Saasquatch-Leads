import OpenAI from "openai";
import type { AIInsights } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-openai-api-key-here"
});

export async function generateCompanyInsights(
  companyName: string,
  industry: string,
  companySize: string,
  contactName: string,
  jobTitle: string,
  techStack?: string[],
  fundingInfo?: string,
  recentActivity?: string
): Promise<AIInsights> {
  try {
    const prompt = `
Analyze the following company and contact information to provide sales insights:

Company: ${companyName}
Industry: ${industry}
Company Size: ${companySize}
Contact: ${contactName} - ${jobTitle}
${techStack ? `Tech Stack: ${techStack.join(", ")}` : ""}
${fundingInfo ? `Funding Info: ${fundingInfo}` : ""}
${recentActivity ? `Recent Activity: ${recentActivity}` : ""}

Please provide a comprehensive sales analysis in JSON format with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the company's profile and sales potential",
  "buyingIntent": "high" | "medium" | "low" | "unknown",
  "budgetRange": "Estimated budget range (e.g., '$10K - $50K')",
  "decisionTimeline": "Estimated decision timeline (e.g., 'Q1 2024')",
  "keyInsights": ["Array of 2-3 key insights about the company's needs or situation"],
  "recommendedApproach": "Recommended sales approach or talking points for this prospect"
}

Base your analysis on:
- Company size and likely budget capacity
- Industry trends and typical tech needs
- Contact's role and decision-making authority
- Tech stack compatibility and integration opportunities
- Funding status indicating growth phase and spending capacity
- Recent activity showing engagement level
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert sales analyst with deep knowledge of B2B sales, technology markets, and buyer behavior. Provide accurate, actionable insights for sales teams.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      summary: result.summary || "Analysis unavailable",
      buyingIntent: result.buyingIntent || "unknown",
      budgetRange: result.budgetRange,
      decisionTimeline: result.decisionTimeline,
      keyInsights: result.keyInsights || [],
      recommendedApproach: result.recommendedApproach || "Contact for more information",
    };

  } catch (error) {
    console.error("Error generating AI insights:", error);
    
    // Return fallback insights if API fails
    return {
      summary: `${companyName} is a ${industry} company with ${companySize} employees. Analysis pending.`,
      buyingIntent: "unknown",
      budgetRange: undefined,
      decisionTimeline: undefined,
      keyInsights: ["Additional data needed for complete analysis"],
      recommendedApproach: "Gather more information about company needs and priorities",
    };
  }
}

export async function generateOutreachEmail(
  contactName: string,
  companyName: string,
  jobTitle: string,
  insights: AIInsights,
  productName: string = "our solution"
): Promise<string> {
  try {
    const prompt = `
Generate a personalized B2B sales outreach email with the following details:

Recipient: ${contactName}
Company: ${companyName}
Job Title: ${jobTitle}
Product/Service: ${productName}

Company Insights:
${insights.summary}

Key Insights:
${insights.keyInsights.join(", ")}

Recommended Approach: ${insights.recommendedApproach}

Write a professional, personalized email that:
1. References their role and company specifically
2. Mentions relevant insights about their industry/situation
3. Provides clear value proposition
4. Includes a soft call-to-action
5. Is concise (under 150 words)
6. Feels personal, not templated

Format as plain text email (no HTML).
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert sales copywriter who creates highly personalized, effective B2B outreach emails that get responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    return response.choices[0].message.content || "Email generation failed";

  } catch (error) {
    console.error("Error generating outreach email:", error);
    return `Hi ${contactName},

I noticed ${companyName} is in the ${insights.summary}. 

I'd love to explore how we might help optimize your operations. Would you be open to a brief conversation?

Best regards`;
  }
}

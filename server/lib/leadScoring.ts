import type { Lead, ScoringCriteria } from "@shared/schema";

// Industry priority weights
const INDUSTRY_WEIGHTS: Record<string, number> = {
  "SaaS": 25,
  "FinTech": 24,
  "Technology": 23,
  "E-commerce": 22,
  "Healthcare": 21,
  "Data Analytics": 20,
  "Cloud Services": 19,
  "Manufacturing": 15,
  "Retail": 12,
  "Other": 10,
};

// Company size weights (based on employee count ranges)
const COMPANY_SIZE_WEIGHTS: Record<string, number> = {
  "1000+": 25,
  "500-1000": 24,
  "200-500": 22,
  "50-200": 18,
  "10-50": 12,
  "1-10": 8,
};

// Job title relevance weights
const JOB_TITLE_WEIGHTS: Record<string, number> = {
  "CEO": 25,
  "CTO": 25,
  "VP": 23,
  "Director": 20,
  "Head": 18,
  "Manager": 15,
  "Lead": 12,
  "Senior": 10,
  "Coordinator": 8,
  "Specialist": 6,
};

// Engagement signal weights
const ENGAGEMENT_WEIGHTS: Record<string, number> = {
  "high": 25,
  "medium": 18,
  "low": 10,
  "unknown": 5,
};

export function calculateLeadScore(lead: Lead): { score: number; breakdown: ScoringCriteria } {
  // Company Size Score (0-25)
  const companySizeScore = COMPANY_SIZE_WEIGHTS[lead.companySize] || 5;

  // Industry Match Score (0-25)
  const industryScore = INDUSTRY_WEIGHTS[lead.industry] || 10;

  // Job Title Relevance Score (0-25)
  const jobTitleScore = calculateJobTitleScore(lead.jobTitle);

  // Engagement Signals Score (0-25)
  const engagementScore = calculateEngagementScore(lead);

  const breakdown: ScoringCriteria = {
    companySize: companySizeScore,
    industryMatch: industryScore,
    jobTitleRelevance: jobTitleScore,
    engagementSignals: engagementScore,
  };

  const totalScore = Math.min(100, Math.max(0, 
    companySizeScore + industryScore + jobTitleScore + engagementScore
  ));

  return { score: totalScore, breakdown };
}

function calculateJobTitleScore(jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  
  // Check for exact matches first
  for (const [keyword, weight] of Object.entries(JOB_TITLE_WEIGHTS)) {
    if (title.includes(keyword.toLowerCase())) {
      return weight;
    }
  }

  // Check for decision-maker keywords
  const decisionMakerKeywords = ["chief", "president", "founder", "owner"];
  for (const keyword of decisionMakerKeywords) {
    if (title.includes(keyword)) {
      return 25;
    }
  }

  // Default score for other titles
  return 8;
}

function calculateEngagementScore(lead: Lead): number {
  let score = 0;

  // Base score from buying intent
  if (lead.buyingIntent) {
    score += ENGAGEMENT_WEIGHTS[lead.buyingIntent] || 5;
  }

  // Bonus points for recent activity
  if (lead.recentActivity) {
    const activity = lead.recentActivity.toLowerCase();
    if (activity.includes("demo") || activity.includes("trial")) {
      score = Math.min(25, score + 8);
    } else if (activity.includes("download") || activity.includes("whitepaper")) {
      score = Math.min(25, score + 5);
    } else if (activity.includes("webinar") || activity.includes("attended")) {
      score = Math.min(25, score + 4);
    } else if (activity.includes("visited") || activity.includes("pricing")) {
      score = Math.min(25, score + 3);
    }
  }

  // Bonus for tech stack compatibility
  if (lead.techStack && lead.techStack.length > 0) {
    score = Math.min(25, score + 2);
  }

  // Bonus for funding information (indicates growth/budget)
  if (lead.fundingInfo) {
    score = Math.min(25, score + 3);
  }

  return Math.min(25, score);
}

export function updateLeadPriority(score: number): string {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  return "cold";
}

export function enrichLeadData(lead: Lead): Lead {
  const { score, breakdown } = calculateLeadScore(lead);
  const priority = updateLeadPriority(score);

  return {
    ...lead,
    score,
    priority,
    isEnriched: true,
  };
}

import type { Lead, ScoringCriteria } from "@shared/schema";

// Enhanced industry categories with detailed scoring
export const INDUSTRY_CATEGORIES = {
  // High-value tech industries (20-25 points)
  "SaaS": 25,
  "FinTech": 24,
  "Cybersecurity": 24,
  "AI/ML": 23,
  "Enterprise Software": 23,
  "Cloud Services": 22,
  "DevOps": 22,
  "Data Analytics": 21,
  "API/Platform": 21,
  "EdTech": 20,
  
  // Growth industries (15-19 points)
  "E-commerce": 19,
  "HealthTech": 19,
  "PropTech": 18,
  "InsurTech": 18,
  "LegalTech": 17,
  "HRTech": 17,
  "MarTech": 16,
  "AdTech": 16,
  "Gaming": 15,
  "Social Media": 15,
  
  // Traditional with digital needs (10-14 points)
  "Technology": 14,
  "Financial Services": 13,
  "Healthcare": 13,
  "Manufacturing": 12,
  "Consulting": 12,
  "Media": 11,
  "Retail": 11,
  "Transportation": 10,
  "Real Estate": 10,
  
  // Lower priority (5-9 points)
  "Travel": 9,
  "Food Delivery": 8,
  "Agriculture": 7,
  "Non-profit": 6,
  "Government": 5,
  "Education": 5,
  "Other": 8
};

// Location-based scoring weights (market maturity and tech adoption)
export const LOCATION_WEIGHTS: Record<string, number> = {
  // Tier 1 tech hubs
  "San Francisco, CA": 10,
  "Palo Alto, CA": 10,
  "Mountain View, CA": 10,
  "Seattle, WA": 9,
  "New York, NY": 9,
  "Boston, MA": 8,
  "Austin, TX": 8,
  "Los Angeles, CA": 7,
  
  // Tier 2 tech cities
  "Denver, CO": 6,
  "Chicago, IL": 6,
  "Atlanta, GA": 6,
  "Portland, OR": 6,
  "Raleigh, NC": 5,
  "Miami, FL": 5,
  "Philadelphia, PA": 5,
  "Washington, DC": 5,
  
  // International tech hubs
  "London, UK": 8,
  "Toronto, CA": 7,
  "Amsterdam, NL": 7,
  "Berlin, DE": 6,
  "Tel Aviv, IL": 8,
  "Singapore": 7,
  "Sydney, AU": 6,
  
  // Default for other locations
  "Other": 3
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
  const companySizeScore = calculateCompanySizeScore(lead);

  // Industry Match Score (0-25) 
  const industryScore = INDUSTRY_CATEGORIES[lead.industry] || 8;

  // Job Title Relevance Score (0-25)
  const jobTitleScore = calculateJobTitleScore(lead.jobTitle);

  // Engagement Signals Score (0-15)
  const engagementScore = calculateEngagementScore(lead);

  // Location/Market Score (0-10)
  const locationScore = calculateLocationScore(lead.location);

  // Funding Stage Score (0-10)
  const fundingScore = calculateFundingScore(lead.fundingInfo);

  const breakdown: ScoringCriteria = {
    companySize: companySizeScore,
    industry: industryScore,
    jobTitle: jobTitleScore,
    engagement: engagementScore,
    funding: fundingScore
  };

  const totalScore = Math.min(100, Math.max(0, 
    companySizeScore + industryScore + jobTitleScore + engagementScore + locationScore + fundingScore
  ));

  return { score: totalScore, breakdown };
}

function calculateCompanySizeScore(lead: Lead): number {
  // Use actual employee count if available for more precise scoring
  if (lead.employeeCount) {
    if (lead.employeeCount >= 5000) return 25;
    if (lead.employeeCount >= 1000) return 24;
    if (lead.employeeCount >= 500) return 22;
    if (lead.employeeCount >= 200) return 20;
    if (lead.employeeCount >= 50) return 18;
    if (lead.employeeCount >= 10) return 15;
    return 10;
  }
  
  // Fallback to company size string
  return COMPANY_SIZE_WEIGHTS[lead.companySize] || 5;
}

function calculateLocationScore(location: string): number {
  // Check for exact location matches
  const exactMatch = LOCATION_WEIGHTS[location];
  if (exactMatch) return exactMatch;
  
  // Check for city matches (case insensitive)
  const locationLower = location.toLowerCase();
  for (const [key, value] of Object.entries(LOCATION_WEIGHTS)) {
    if (locationLower.includes(key.toLowerCase().split(',')[0])) {
      return value;
    }
  }
  
  // Check for state/country matches
  if (locationLower.includes('california') || locationLower.includes('ca')) return 8;
  if (locationLower.includes('new york') || locationLower.includes('ny')) return 7;
  if (locationLower.includes('washington') || locationLower.includes('wa')) return 7;
  if (locationLower.includes('massachusetts') || locationLower.includes('ma')) return 6;
  if (locationLower.includes('texas') || locationLower.includes('tx')) return 6;
  
  return 3; // Default for other locations
}

function calculateFundingScore(fundingInfo: string | null): number {
  if (!fundingInfo) return 2;
  
  const funding = fundingInfo.toLowerCase();
  
  // High-growth funding stages
  if (funding.includes('series c') || funding.includes('series d') || funding.includes('series e')) return 10;
  if (funding.includes('series b')) return 9;
  if (funding.includes('series a')) return 8;
  if (funding.includes('seed')) return 6;
  if (funding.includes('pre-seed')) return 4;
  
  // Public companies
  if (funding.includes('public') || funding.includes('ipo') || funding.includes('nasdaq') || funding.includes('nyse')) return 7;
  
  // High valuation indicators
  if (funding.includes('billion') || funding.includes('unicorn')) return 10;
  if (funding.includes('million')) {
    // Extract funding amount for more precise scoring
    const match = funding.match(/(\d+).*million/);
    if (match) {
      const amount = parseInt(match[1]);
      if (amount >= 100) return 9;
      if (amount >= 50) return 8;
      if (amount >= 10) return 6;
      return 5;
    }
  }
  
  return 3; // Default for other funding stages
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

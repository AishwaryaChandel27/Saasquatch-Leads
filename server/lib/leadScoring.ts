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
export const LOCATION_WEIGHTS = {
  "San Francisco, CA": 1.0,
  "New York, NY": 0.95,
  "Austin, TX": 0.9,
  "Seattle, WA": 0.9,
  "Boston, MA": 0.85,
  "Los Angeles, CA": 0.8,
  "Chicago, IL": 0.75,
  "Denver, CO": 0.7,
  "Atlanta, GA": 0.7,
  "Other": 0.6
};

// Company size scoring
export const COMPANY_SIZE_SCORES = {
  "1-10": 5,
  "11-50": 15,
  "51-200": 25,
  "201-500": 30,
  "501-1000": 35,
  "1001-5000": 40,
  "5000+": 30
};

// Job title level scoring (decision making power)
export const JOB_TITLE_SCORES = {
  "C-Level": 30,
  "VP": 25,
  "Director": 20,
  "Manager": 15,
  "Senior": 10,
  "Mid-Level": 8,
  "Junior": 5,
  "Other": 10
};

export function calculateLeadScore(lead: Lead): number {
  let score = 0;
  
  // Industry scoring
  const industryScore = INDUSTRY_CATEGORIES[lead.industry as keyof typeof INDUSTRY_CATEGORIES] || 8;
  score += industryScore;
  
  // Company size scoring
  const companySizeScore = COMPANY_SIZE_SCORES[lead.companySize as keyof typeof COMPANY_SIZE_SCORES] || 10;
  score += companySizeScore;
  
  // Location scoring
  const locationWeight = LOCATION_WEIGHTS[lead.location as keyof typeof LOCATION_WEIGHTS] || 0.6;
  score *= locationWeight;
  
  // Job title scoring
  const jobTitleScore = getJobTitleScore(lead.jobTitle || "");
  score += jobTitleScore;
  
  // Additional factors
  if (lead.website) score += 5;
  if (lead.email) score += 5;
  if (lead.aiInsights && lead.aiInsights.length > 0) score += 3;
  
  return Math.min(Math.round(score), 100);
}

function getJobTitleScore(jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('ceo') || title.includes('cto') || title.includes('cfo') || title.includes('founder')) {
    return JOB_TITLE_SCORES["C-Level"];
  }
  if (title.includes('vp') || title.includes('vice president')) {
    return JOB_TITLE_SCORES["VP"];
  }
  if (title.includes('director') || title.includes('head of')) {
    return JOB_TITLE_SCORES["Director"];
  }
  if (title.includes('manager') || title.includes('lead')) {
    return JOB_TITLE_SCORES["Manager"];
  }
  if (title.includes('senior') || title.includes('sr.')) {
    return JOB_TITLE_SCORES["Senior"];
  }
  if (title.includes('junior') || title.includes('jr.') || title.includes('intern')) {
    return JOB_TITLE_SCORES["Junior"];
  }
  
  return JOB_TITLE_SCORES["Mid-Level"];
}

export function updateLeadPriority(lead: Lead): "High" | "Medium" | "Low" {
  const score = lead.score || calculateLeadScore(lead);
  
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

export function categorizeLeadQuality(score: number): "High" | "Medium" | "Low" {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}
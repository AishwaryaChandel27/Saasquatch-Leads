import type { Lead } from '@shared/schema';

// Lightweight ML-inspired scoring model using logistic regression principles
// Features: company_size, job_title_level, industry_value, funding_stage, tech_stack_modern, engagement_score
export interface MLFeatures {
  companySize: number;        // 0-1 normalized
  jobTitleLevel: number;      // 0-1 normalized (decision making power)
  industryValue: number;      // 0-1 normalized (market value)
  fundingStage: number;       // 0-1 normalized (growth stage)
  techStackModern: number;    // 0-1 normalized (tech sophistication)
  engagementScore: number;    // 0-1 normalized (buying signals)
}

// Trained weights (simulating logistic regression coefficients)
const ML_WEIGHTS = {
  companySize: 0.25,      // Large companies have bigger budgets
  jobTitleLevel: 0.30,    // Decision makers are key
  industryValue: 0.20,    // High-value industries pay more
  fundingStage: 0.15,     // Well-funded companies invest in tools
  techStackModern: 0.05,  // Modern tech indicates openness to new tools
  engagementScore: 0.05   // Engagement indicates intent
};

const INTERCEPT = -2.5; // Bias term for logistic regression

export function calculateMLScore(lead: Lead): { score: number; features: MLFeatures; confidence: number } {
  const features = extractFeatures(lead);
  
  // Calculate logistic regression score
  const linearScore = 
    ML_WEIGHTS.companySize * features.companySize +
    ML_WEIGHTS.jobTitleLevel * features.jobTitleLevel +
    ML_WEIGHTS.industryValue * features.industryValue +
    ML_WEIGHTS.fundingStage * features.fundingStage +
    ML_WEIGHTS.techStackModern * features.techStackModern +
    ML_WEIGHTS.engagementScore * features.engagementScore +
    INTERCEPT;
  
  // Apply sigmoid function to get probability (0-1)
  const probability = 1 / (1 + Math.exp(-linearScore));
  
  // Convert to 0-100 score scale
  const score = Math.round(probability * 100);
  
  // Calculate confidence based on feature certainty
  const confidence = calculateConfidence(features);
  
  return { score, features, confidence };
}

function extractFeatures(lead: Lead): MLFeatures {
  return {
    companySize: normalizeCompanySize(lead.companySize || ""),
    jobTitleLevel: normalizeJobTitle(lead.jobTitle || ""),
    industryValue: normalizeIndustry(lead.industry || ""),
    fundingStage: normalizeFundingStage(lead.notes || ""),
    techStackModern: normalizeTechStack(lead.website || ""),
    engagementScore: normalizeEngagement(lead)
  };
}

function normalizeCompanySize(companySize: string): number {
  const sizeMap: { [key: string]: number } = {
    "1-10": 0.1,
    "11-50": 0.3,
    "51-200": 0.6,
    "201-500": 0.8,
    "501-1000": 0.9,
    "1001-5000": 1.0,
    "5000+": 0.95
  };
  return sizeMap[companySize] || 0.4;
}

function normalizeJobTitle(jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('ceo') || title.includes('cto') || title.includes('founder')) return 1.0;
  if (title.includes('vp') || title.includes('vice president')) return 0.85;
  if (title.includes('director') || title.includes('head of')) return 0.7;
  if (title.includes('manager') || title.includes('lead')) return 0.5;
  if (title.includes('senior')) return 0.3;
  
  return 0.2;
}

function normalizeIndustry(industry: string): number {
  const highValueIndustries = ['SaaS', 'FinTech', 'Cybersecurity', 'AI/ML', 'Enterprise Software'];
  const mediumValueIndustries = ['E-commerce', 'HealthTech', 'PropTech', 'Technology'];
  
  if (highValueIndustries.includes(industry)) return 1.0;
  if (mediumValueIndustries.includes(industry)) return 0.7;
  
  return 0.4;
}

function normalizeFundingStage(notes: string): number {
  const lowerNotes = notes.toLowerCase();
  
  if (lowerNotes.includes('series c') || lowerNotes.includes('series d') || lowerNotes.includes('ipo')) return 1.0;
  if (lowerNotes.includes('series b')) return 0.8;
  if (lowerNotes.includes('series a')) return 0.6;
  if (lowerNotes.includes('seed') || lowerNotes.includes('pre-seed')) return 0.4;
  
  return 0.3;
}

function normalizeTechStack(website: string): number {
  // Simple heuristic based on domain patterns
  if (website.includes('.io') || website.includes('.dev') || website.includes('api.')) return 0.8;
  if (website.includes('.com') || website.includes('.net')) return 0.5;
  
  return 0.3;
}

function normalizeEngagement(lead: Lead): number {
  let engagement = 0;
  
  if (lead.email) engagement += 0.3;
  if (lead.website) engagement += 0.2;
  if (lead.notes && lead.notes.length > 0) engagement += 0.3;
  if (lead.priority === 'High') engagement += 0.2;
  
  return Math.min(engagement, 1.0);
}

function calculateConfidence(features: MLFeatures): number {
  // Confidence based on how many features have meaningful values
  const featureValues = Object.values(features);
  const meaningfulFeatures = featureValues.filter(value => value > 0.3).length;
  
  return Math.min(meaningfulFeatures / featureValues.length, 1.0);
}

export function classifyLeadQuality(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}
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
    companySize: normalizeCompanySize(lead.employeeCount || getEmployeeCountFromSize(lead.companySize)),
    jobTitleLevel: normalizeJobTitleLevel(lead.jobTitle),
    industryValue: normalizeIndustryValue(lead.industry),
    fundingStage: normalizeFundingStage(lead.fundingInfo || ''),
    techStackModern: normalizeTechStack(lead.techStack || []),
    engagementScore: normalizeEngagement(lead.recentActivity || '', lead.buyingIntent || 'unknown')
  };
}

function normalizeCompanySize(employeeCount: number): number {
  // Logarithmic scaling for company size (1-10000 employees)
  if (employeeCount <= 0) return 0.1;
  if (employeeCount >= 10000) return 1.0;
  
  // Log scale: 1-10 = 0.1-0.3, 10-100 = 0.3-0.6, 100-1000 = 0.6-0.8, 1000+ = 0.8-1.0
  return Math.min(1.0, Math.log10(employeeCount) / 4 + 0.1);
}

function normalizeJobTitleLevel(jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  
  // C-level executives
  if (title.includes('ceo') || title.includes('cto') || title.includes('cfo') || 
      title.includes('chief') || title.includes('president') || title.includes('founder')) {
    return 1.0;
  }
  
  // VPs and Directors
  if (title.includes('vp') || title.includes('vice president') || title.includes('director')) {
    return 0.8;
  }
  
  // Heads and Senior Managers
  if (title.includes('head') || title.includes('senior manager') || title.includes('principal')) {
    return 0.6;
  }
  
  // Managers and Leads
  if (title.includes('manager') || title.includes('lead') || title.includes('supervisor')) {
    return 0.4;
  }
  
  // Senior individual contributors
  if (title.includes('senior') || title.includes('staff') || title.includes('architect')) {
    return 0.3;
  }
  
  // Regular employees
  return 0.2;
}

function normalizeIndustryValue(industry: string): number {
  const industryScores = {
    // High-value, high-budget industries
    'saas': 1.0,
    'fintech': 0.95,
    'cybersecurity': 0.9,
    'enterprise software': 0.9,
    'ai/ml': 0.85,
    'data analytics': 0.8,
    'cloud services': 0.8,
    'devops': 0.75,
    
    // Growth industries
    'healthtech': 0.7,
    'edtech': 0.65,
    'e-commerce': 0.6,
    'proptech': 0.6,
    'insurtech': 0.55,
    'legaltech': 0.55,
    'hrtech': 0.5,
    'martech': 0.5,
    
    // Traditional industries
    'healthcare': 0.45,
    'financial services': 0.4,
    'manufacturing': 0.35,
    'retail': 0.3,
    'real estate': 0.3,
    'consulting': 0.25,
    'media': 0.25,
    'transportation': 0.2,
    'travel': 0.2,
    'food delivery': 0.15,
    
    // Lower priority
    'government': 0.1,
    'non-profit': 0.05,
    'education': 0.05
  };
  
  const industryLower = industry.toLowerCase();
  
  // Check for exact matches first
  if (industryScores[industryLower]) {
    return industryScores[industryLower];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(industryScores)) {
    if (industryLower.includes(key) || key.includes(industryLower)) {
      return value;
    }
  }
  
  return 0.3; // Default for unknown industries
}

function normalizeFundingStage(fundingInfo: string): number {
  const funding = fundingInfo.toLowerCase();
  
  if (funding.includes('series d') || funding.includes('series e') || funding.includes('pre-ipo')) return 1.0;
  if (funding.includes('series c')) return 0.9;
  if (funding.includes('series b')) return 0.8;
  if (funding.includes('series a')) return 0.7;
  if (funding.includes('seed') && !funding.includes('pre-seed')) return 0.6;
  if (funding.includes('pre-seed')) return 0.4;
  
  // Public companies
  if (funding.includes('public') || funding.includes('ipo') || funding.includes('nasdaq') || funding.includes('nyse')) {
    return 0.75; // Established but may have budget constraints
  }
  
  // High valuation indicators
  if (funding.includes('billion') || funding.includes('unicorn')) return 1.0;
  
  // Extract funding amount
  const millionMatch = funding.match(/(\d+).*million/);
  if (millionMatch) {
    const amount = parseInt(millionMatch[1]);
    if (amount >= 100) return 0.9;
    if (amount >= 50) return 0.8;
    if (amount >= 10) return 0.6;
    if (amount >= 1) return 0.4;
  }
  
  return 0.2; // Unknown or bootstrap
}

function normalizeTechStack(techStack: string[]): number {
  if (techStack.length === 0) return 0.3;
  
  const modernTechnologies = [
    'react', 'vue', 'angular', 'svelte',           // Modern frontend
    'typescript', 'javascript', 'node.js',        // JavaScript ecosystem
    'python', 'go', 'rust', 'kotlin',             // Modern backend languages
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', // Cloud/containerization
    'postgresql', 'mongodb', 'redis',              // Modern databases
    'graphql', 'rest', 'microservices',           // API patterns
    'ci/cd', 'terraform', 'jenkins'               // DevOps
  ];
  
  const stackLower = techStack.map(tech => tech.toLowerCase());
  let modernCount = 0;
  
  for (const tech of modernTechnologies) {
    if (stackLower.some(stackTech => stackTech.includes(tech))) {
      modernCount++;
    }
  }
  
  // Calculate percentage of modern tech adoption
  const modernRatio = modernCount / Math.min(modernTechnologies.length, 10); // Cap at 10 for scoring
  return Math.min(1.0, modernRatio);
}

function normalizeEngagement(recentActivity: string, buyingIntent: string): number {
  let score = 0.2; // Base engagement score
  
  // Buying intent signals
  if (buyingIntent === 'high') score += 0.4;
  else if (buyingIntent === 'medium') score += 0.2;
  else if (buyingIntent === 'low') score += 0.1;
  
  // Activity-based signals
  const activity = recentActivity.toLowerCase();
  if (activity.includes('demo') || activity.includes('trial') || activity.includes('poc')) {
    score += 0.3;
  } else if (activity.includes('download') || activity.includes('whitepaper') || activity.includes('case study')) {
    score += 0.2;
  } else if (activity.includes('webinar') || activity.includes('event') || activity.includes('attended')) {
    score += 0.15;
  } else if (activity.includes('pricing') || activity.includes('contact') || activity.includes('request')) {
    score += 0.1;
  } else if (activity.includes('visit') || activity.includes('view') || activity.includes('browse')) {
    score += 0.05;
  }
  
  return Math.min(1.0, score);
}

function calculateConfidence(features: MLFeatures): number {
  // Confidence based on feature completeness and certainty
  const featureValues = Object.values(features);
  const nonZeroFeatures = featureValues.filter(value => value > 0.1).length;
  const totalFeatures = featureValues.length;
  
  // Base confidence from feature completeness
  const completeness = nonZeroFeatures / totalFeatures;
  
  // Boost confidence for extreme values (very high or very low)
  const extremeValues = featureValues.filter(value => value > 0.8 || value < 0.2).length;
  const extremeBoost = extremeValues / totalFeatures * 0.2;
  
  return Math.min(1.0, completeness + extremeBoost);
}

function getEmployeeCountFromSize(companySize: string): number {
  const sizeMap: Record<string, number> = {
    '1-10': 5,
    '10-50': 25,
    '50-200': 100,
    '200-500': 300,
    '500-1000': 750,
    '1000+': 2000
  };
  
  return sizeMap[companySize] || 50;
}

// Lead quality classification based on ML score
export function classifyLeadQuality(score: number, confidence: number): {
  quality: 'High' | 'Medium' | 'Low';
  priority: 'hot' | 'warm' | 'cold';
  recommendation: string;
} {
  // Adjust thresholds based on confidence
  const confidentThreshold = confidence > 0.7;
  const highThreshold = confidentThreshold ? 75 : 80;
  const mediumThreshold = confidentThreshold ? 50 : 60;
  
  if (score >= highThreshold) {
    return {
      quality: 'High',
      priority: 'hot',
      recommendation: 'Immediate outreach recommended - high conversion probability'
    };
  } else if (score >= mediumThreshold) {
    return {
      quality: 'Medium',
      priority: 'warm',
      recommendation: 'Nurture with targeted content - good potential'
    };
  } else {
    return {
      quality: 'Low',
      priority: 'cold',
      recommendation: 'Long-term development - consider for future campaigns'
    };
  }
}
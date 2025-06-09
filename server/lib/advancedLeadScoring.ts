import type { Lead } from "@shared/schema";

export interface ScoringWeights {
  companySize: number;
  industryValue: number;
  fundingStage: number;
  jobTitleLevel: number;
  recentActivity: number;
  technicalFit: number;
  marketPosition: number;
  growthIndicators: number;
}

export interface ScoringCriteria {
  companySize: number;
  industryValue: number;
  fundingStage: number;
  jobTitleLevel: number;
  recentActivity: number;
  technicalFit: number;
  marketPosition: number;
  growthIndicators: number;
  totalScore: number;
}

export interface LeadQualityMetrics {
  score: number;
  category: 'High' | 'Medium' | 'Low';
  confidence: number;
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  recommendations: string[];
}

// Advanced scoring weights based on sales conversion data
const SCORING_WEIGHTS: ScoringWeights = {
  companySize: 0.25,      // 25% - Company size and employee count
  industryValue: 0.20,    // 20% - Industry attractiveness and market value
  fundingStage: 0.18,     // 18% - Funding status and financial health
  jobTitleLevel: 0.15,    // 15% - Decision-making authority of contact
  recentActivity: 0.10,   // 10% - Recent engagement and buying signals
  technicalFit: 0.07,     // 7% - Technology stack compatibility
  marketPosition: 0.03,   // 3% - Market leadership and brand recognition
  growthIndicators: 0.02  // 2% - Growth metrics and expansion signals
};

// Industry value mapping based on market potential and conversion rates
const INDUSTRY_VALUES: Record<string, number> = {
  'SaaS': 100,
  'Fintech': 95,
  'Cybersecurity': 90,
  'Enterprise Software': 88,
  'AI/ML': 85,
  'Data Analytics': 82,
  'Cloud Services': 80,
  'DevOps': 78,
  'Healthcare Tech': 75,
  'EdTech': 72,
  'E-commerce': 70,
  'MarTech': 68,
  'PropTech': 65,
  'LegalTech': 62,
  'Manufacturing': 55,
  'Retail': 50,
  'Construction': 45,
  'Agriculture': 40,
  'Energy': 38,
  'Government': 35,
  'Non-profit': 25,
  'Education': 30
};

// Company size scoring based on revenue potential and decision complexity
const COMPANY_SIZE_SCORES: Record<string, number> = {
  '1000+': 100,
  '500-1000': 95,
  '200-500': 85,
  '100-200': 75,
  '50-100': 65,
  '20-50': 50,
  '10-20': 35,
  '1-10': 25
};

// Job title decision authority mapping
const JOB_TITLE_AUTHORITY: Record<string, number> = {
  'CEO': 100,
  'CTO': 95,
  'CRO': 90,
  'VP': 85,
  'Director': 75,
  'Head': 70,
  'Manager': 60,
  'Senior': 50,
  'Lead': 45,
  'Engineer': 30,
  'Analyst': 25,
  'Coordinator': 25,
  'Associate': 20,
  'Intern': 15
};

// Funding stage value indicators
const FUNDING_STAGES: Record<string, number> = {
  'Series C+': 100,
  'Series B': 90,
  'Series A': 80,
  'Seed': 65,
  'Pre-seed': 45,
  'Bootstrap': 30,
  'Public': 85,
  'Acquired': 70
};

export function calculateAdvancedLeadScore(lead: Lead): LeadQualityMetrics {
  const criteria: ScoringCriteria = {
    companySize: calculateCompanySizeScore(lead),
    industryValue: calculateIndustryScore(lead),
    fundingStage: calculateFundingScore(lead),
    jobTitleLevel: calculateJobTitleScore(lead),
    recentActivity: calculateActivityScore(lead),
    technicalFit: calculateTechnicalFitScore(lead),
    marketPosition: calculateMarketPositionScore(lead),
    growthIndicators: calculateGrowthScore(lead),
    totalScore: 0
  };

  // Calculate weighted total score
  criteria.totalScore = Math.round(
    (criteria.companySize * SCORING_WEIGHTS.companySize) +
    (criteria.industryValue * SCORING_WEIGHTS.industryValue) +
    (criteria.fundingStage * SCORING_WEIGHTS.fundingStage) +
    (criteria.jobTitleLevel * SCORING_WEIGHTS.jobTitleLevel) +
    (criteria.recentActivity * SCORING_WEIGHTS.recentActivity) +
    (criteria.technicalFit * SCORING_WEIGHTS.technicalFit) +
    (criteria.marketPosition * SCORING_WEIGHTS.marketPosition) +
    (criteria.growthIndicators * SCORING_WEIGHTS.growthIndicators)
  );

  const category = categorizeLeadQuality(criteria.totalScore);
  const confidence = calculateConfidence(criteria);
  const factors = analyzeScoringFactors(criteria, lead);
  const recommendations = generateRecommendations(criteria, lead);

  return {
    score: criteria.totalScore,
    category,
    confidence,
    factors,
    recommendations
  };
}

function calculateCompanySizeScore(lead: Lead): number {
  const employeeCount = lead.employeeCount;
  const companySize = lead.companySize;

  // Priority scoring based on employee count
  if (employeeCount) {
    if (employeeCount >= 1000) return 100;
    if (employeeCount >= 500) return 95;
    if (employeeCount >= 200) return 85;
    if (employeeCount >= 100) return 75;
    if (employeeCount >= 50) return 65;
    if (employeeCount >= 20) return 50;
    if (employeeCount >= 10) return 35;
    return 25;
  }

  // Fallback to company size ranges
  return COMPANY_SIZE_SCORES[companySize] || 40;
}

function calculateIndustryScore(lead: Lead): number {
  const industry = lead.industry.toLowerCase();
  
  // Find matching industry with fuzzy matching
  for (const [key, value] of Object.entries(INDUSTRY_VALUES)) {
    if (industry.includes(key.toLowerCase()) || key.toLowerCase().includes(industry)) {
      return value;
    }
  }
  
  // Default score for unknown industries
  return 50;
}

function calculateFundingScore(lead: Lead): number {
  const funding = lead.fundingInfo?.toLowerCase() || '';
  
  if (funding.includes('series c') || funding.includes('series d') || funding.includes('series e')) return 100;
  if (funding.includes('series b')) return 90;
  if (funding.includes('series a')) return 80;
  if (funding.includes('seed')) return 65;
  if (funding.includes('pre-seed')) return 45;
  if (funding.includes('bootstrap') || funding.includes('self-funded')) return 30;
  if (funding.includes('public') || funding.includes('ipo')) return 85;
  if (funding.includes('acquired')) return 70;
  
  // Extract funding amount for additional scoring
  const fundingMatch = funding.match(/\$(\d+(?:\.\d+)?)\s*(m|million|b|billion)/i);
  if (fundingMatch) {
    const amount = parseFloat(fundingMatch[1]);
    const unit = fundingMatch[2].toLowerCase();
    const totalAmount = unit.startsWith('b') ? amount * 1000 : amount;
    
    if (totalAmount >= 100) return 100;
    if (totalAmount >= 50) return 90;
    if (totalAmount >= 20) return 80;
    if (totalAmount >= 10) return 70;
    if (totalAmount >= 5) return 60;
    if (totalAmount >= 1) return 50;
  }
  
  return 40;
}

function calculateJobTitleScore(lead: Lead): number {
  const jobTitle = lead.jobTitle.toLowerCase();
  
  // Find the highest authority level in the job title
  let maxScore = 0;
  for (const [title, score] of Object.entries(JOB_TITLE_AUTHORITY)) {
    if (jobTitle.includes(title.toLowerCase())) {
      maxScore = Math.max(maxScore, score);
    }
  }
  
  // Bonus for specific high-value roles
  if (jobTitle.includes('founder') || jobTitle.includes('owner')) maxScore = Math.max(maxScore, 100);
  if (jobTitle.includes('chief')) maxScore = Math.max(maxScore, 95);
  if (jobTitle.includes('president')) maxScore = Math.max(maxScore, 90);
  
  return maxScore || 30; // Default for unrecognized titles
}

function calculateActivityScore(lead: Lead): number {
  const activity = lead.recentActivity?.toLowerCase() || '';
  
  // High-intent activities
  if (activity.includes('requested demo') || activity.includes('trial access')) return 100;
  if (activity.includes('pricing') || activity.includes('contacted sales')) return 95;
  if (activity.includes('downloaded roi') || activity.includes('calculator')) return 90;
  if (activity.includes('case studies') || activity.includes('technical documentation')) return 85;
  if (activity.includes('webinar') || activity.includes('product demo')) return 80;
  if (activity.includes('whitepaper') || activity.includes('guide')) return 70;
  if (activity.includes('blog') || activity.includes('newsletter')) return 50;
  if (activity.includes('careers') || activity.includes('hiring')) return 60; // Growth signal
  
  return 30; // Default for minimal activity
}

function calculateTechnicalFitScore(lead: Lead): number {
  const techStack = lead.techStack || [];
  
  // Modern, high-value technology stacks
  const modernTech = ['react', 'typescript', 'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'nodejs', 'python', 'go', 'rust'];
  const legacyTech = ['jquery', 'php', 'perl', 'cobol', 'fortran'];
  
  let score = 50; // Base score
  
  const modernCount = techStack.filter(tech => 
    modernTech.some(modern => tech.toLowerCase().includes(modern))
  ).length;
  
  const legacyCount = techStack.filter(tech => 
    legacyTech.some(legacy => tech.toLowerCase().includes(legacy))
  ).length;
  
  // Boost for modern tech stack
  score += Math.min(modernCount * 10, 40);
  
  // Reduce for legacy tech
  score -= Math.min(legacyCount * 15, 30);
  
  return Math.max(Math.min(score, 100), 0);
}

function calculateMarketPositionScore(lead: Lead): number {
  const companyName = lead.companyName.toLowerCase();
  
  // Well-known companies get higher scores
  const recognizedCompanies = [
    'google', 'microsoft', 'apple', 'amazon', 'facebook', 'meta', 'netflix', 'tesla',
    'uber', 'airbnb', 'stripe', 'shopify', 'salesforce', 'slack', 'zoom', 'spotify',
    'github', 'gitlab', 'atlassian', 'figma', 'notion', 'discord'
  ];
  
  for (const company of recognizedCompanies) {
    if (companyName.includes(company)) {
      return 100;
    }
  }
  
  // Check for indicators of market leadership
  const website = lead.website?.toLowerCase() || '';
  if (website.includes('.com') && !website.includes('blogspot') && !website.includes('wordpress')) {
    return 60; // Professional domain
  }
  
  return 40; // Default score
}

function calculateGrowthScore(lead: Lead): number {
  const activity = lead.recentActivity?.toLowerCase() || '';
  const funding = lead.fundingInfo?.toLowerCase() || '';
  
  let score = 50;
  
  // Growth indicators
  if (activity.includes('hiring') || activity.includes('careers')) score += 30;
  if (funding.includes('recent') || funding.includes('2024') || funding.includes('2023')) score += 20;
  if (lead.employeeCount && lead.employeeCount > 100) score += 20;
  
  return Math.min(score, 100);
}

function categorizeLeadQuality(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
}

function calculateConfidence(criteria: ScoringCriteria): number {
  // Confidence based on data completeness and score consistency
  const scores = [
    criteria.companySize,
    criteria.industryValue,
    criteria.fundingStage,
    criteria.jobTitleLevel,
    criteria.recentActivity,
    criteria.technicalFit
  ];
  
  const nonZeroScores = scores.filter(s => s > 0).length;
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((acc, score) => acc + Math.pow(score - avgScore, 2), 0) / scores.length;
  
  // High confidence when we have complete data and consistent scores
  let confidence = (nonZeroScores / scores.length) * 100;
  
  // Reduce confidence for high variance (inconsistent data)
  confidence -= Math.min(variance / 1000, 20);
  
  return Math.max(Math.min(Math.round(confidence), 100), 30);
}

function analyzeScoringFactors(criteria: ScoringCriteria, lead: Lead): {
  positive: string[];
  negative: string[];
  neutral: string[];
} {
  const positive: string[] = [];
  const negative: string[] = [];
  const neutral: string[] = [];

  if (criteria.companySize >= 80) positive.push(`Large company size (${lead.employeeCount || lead.companySize} employees)`);
  else if (criteria.companySize <= 40) negative.push(`Small company size may limit budget`);
  else neutral.push(`Medium company size`);

  if (criteria.industryValue >= 85) positive.push(`High-value industry (${lead.industry})`);
  else if (criteria.industryValue <= 50) negative.push(`Lower-value industry segment`);

  if (criteria.fundingStage >= 80) positive.push(`Strong funding status (${lead.fundingInfo})`);
  else if (criteria.fundingStage <= 45) negative.push(`Limited funding may impact budget`);

  if (criteria.jobTitleLevel >= 80) positive.push(`High decision-making authority (${lead.jobTitle})`);
  else if (criteria.jobTitleLevel <= 40) negative.push(`Limited decision-making authority`);

  if (criteria.recentActivity >= 80) positive.push(`High buying intent signals`);
  else if (criteria.recentActivity <= 40) negative.push(`Low engagement activity`);

  if (criteria.technicalFit >= 70) positive.push(`Modern technology stack`);
  else if (criteria.technicalFit <= 40) negative.push(`Legacy technology stack`);

  return { positive, negative, neutral };
}

function generateRecommendations(criteria: ScoringCriteria, lead: Lead): string[] {
  const recommendations: string[] = [];

  if (criteria.totalScore >= 80) {
    recommendations.push('Priority prospect - schedule immediate outreach');
    recommendations.push('Prepare executive-level presentation materials');
    recommendations.push('Research recent company news and initiatives');
  } else if (criteria.totalScore >= 60) {
    recommendations.push('Qualified lead - initiate nurturing sequence');
    recommendations.push('Send relevant case studies and ROI materials');
    recommendations.push('Schedule discovery call within 1-2 weeks');
  } else {
    recommendations.push('Low priority - add to long-term nurturing campaign');
    recommendations.push('Focus on educational content and industry insights');
    recommendations.push('Monitor for company growth or role changes');
  }

  if (criteria.jobTitleLevel <= 50) {
    recommendations.push('Identify and connect with senior decision-makers');
  }

  if (criteria.recentActivity >= 80) {
    recommendations.push('Strike while hot - contact within 24 hours');
  }

  if (criteria.technicalFit <= 50) {
    recommendations.push('Research technical requirements and integration needs');
  }

  return recommendations;
}

// Export enhanced lead with scoring
export function enrichLeadWithAdvancedScoring(lead: Lead): Lead & { qualityMetrics: LeadQualityMetrics } {
  const qualityMetrics = calculateAdvancedLeadScore(lead);
  
  return {
    ...lead,
    score: qualityMetrics.score,
    priority: qualityMetrics.category === 'High' ? 'hot' : qualityMetrics.category === 'Medium' ? 'warm' : 'cold',
    qualityMetrics
  };
}
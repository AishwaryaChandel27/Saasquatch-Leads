import type { Lead } from "@shared/schema";

export interface ScoringWeights {
  companySize: number;
  industryValue: number;
  jobTitleLevel: number;
  fundingStage: number;
  techStackModernity: number;
  marketPosition: number;
  growthIndicators: number;
  decisionMakingPower: number;
  buyingSignals: number;
  competitiveLandscape: number;
}

export interface DetailedScoreBreakdown {
  totalScore: number;
  category: 'High' | 'Medium' | 'Low';
  confidence: number;
  breakdown: {
    companySize: { score: number; weight: number; reasoning: string };
    industry: { score: number; weight: number; reasoning: string };
    jobTitle: { score: number; weight: number; reasoning: string };
    funding: { score: number; weight: number; reasoning: string };
    techStack: { score: number; weight: number; reasoning: string };
    market: { score: number; weight: number; reasoning: string };
    growth: { score: number; weight: number; reasoning: string };
    decision: { score: number; weight: number; reasoning: string };
    buying: { score: number; weight: number; reasoning: string };
    competitive: { score: number; weight: number; reasoning: string };
  };
  recommendations: string[];
  riskFactors: string[];
  opportunityFactors: string[];
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  companySize: 0.15,
  industryValue: 0.12,
  jobTitleLevel: 0.18,
  fundingStage: 0.10,
  techStackModernity: 0.08,
  marketPosition: 0.10,
  growthIndicators: 0.12,
  decisionMakingPower: 0.08,
  buyingSignals: 0.05,
  competitiveLandscape: 0.02
};

const HIGH_VALUE_INDUSTRIES = [
  'SaaS', 'Cloud Computing', 'Artificial Intelligence', 'Machine Learning',
  'Cybersecurity', 'Financial Technology', 'Healthcare Technology', 'E-commerce',
  'Enterprise Software', 'DevOps', 'Data Analytics', 'Mobile Technology'
];

const SENIOR_TITLES = [
  'CEO', 'CTO', 'VP', 'Vice President', 'Director', 'Head of', 'Chief',
  'Founder', 'Co-Founder', 'President', 'Senior Director', 'Principal'
];

const MODERN_TECH_STACK = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Go', 'Rust',
  'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'TypeScript',
  'GraphQL', 'Microservices', 'Serverless', 'AI/ML', 'TensorFlow',
  'PyTorch', 'Redis', 'MongoDB', 'PostgreSQL', 'Elasticsearch'
];

const GROWTH_INDICATORS = [
  'hiring', 'expansion', 'funding', 'new product', 'partnership',
  'acquisition', 'IPO', 'international', 'scaling', 'investment'
];

export function calculateEnhancedScore(lead: Lead, weights: ScoringWeights = DEFAULT_WEIGHTS): DetailedScoreBreakdown {
  const breakdown = {
    companySize: calculateCompanySizeScore(lead),
    industry: calculateIndustryScore(lead),
    jobTitle: calculateJobTitleScore(lead),
    funding: calculateFundingScore(lead),
    techStack: calculateTechStackScore(lead),
    market: calculateMarketPositionScore(lead),
    growth: calculateGrowthScore(lead),
    decision: calculateDecisionPowerScore(lead),
    buying: calculateBuyingSignalsScore(lead),
    competitive: calculateCompetitiveScore(lead)
  };

  const weightedScore = 
    breakdown.companySize.score * weights.companySize +
    breakdown.industry.score * weights.industryValue +
    breakdown.jobTitle.score * weights.jobTitleLevel +
    breakdown.funding.score * weights.fundingStage +
    breakdown.techStack.score * weights.techStackModernity +
    breakdown.market.score * weights.marketPosition +
    breakdown.growth.score * weights.growthIndicators +
    breakdown.decision.score * weights.decisionMakingPower +
    breakdown.buying.score * weights.buyingSignals +
    breakdown.competitive.score * weights.competitiveLandscape;

  const totalScore = Math.round(Math.min(100, Math.max(0, weightedScore)));
  const category = categorizeScore(totalScore);
  const confidence = calculateConfidence(breakdown, lead);

  const recommendations = generateRecommendations(breakdown, lead);
  const riskFactors = identifyRiskFactors(breakdown, lead);
  const opportunityFactors = identifyOpportunities(breakdown, lead);

  return {
    totalScore,
    category,
    confidence,
    breakdown,
    recommendations,
    riskFactors,
    opportunityFactors
  };
}

function calculateCompanySizeScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  const sizeMap: Record<string, number> = {
    '1-10': 20,
    '11-50': 40,
    '51-200': 70,
    '201-500': 85,
    '501-1000': 90,
    '1001-5000': 95,
    '5000+': 80  // Large companies can be slower to adopt
  };

  const score = sizeMap[lead.companySize] || 50;
  const reasoning = score >= 80 
    ? `Large company (${lead.companySize}) with substantial budget and resources`
    : score >= 60 
    ? `Mid-size company (${lead.companySize}) with good growth potential`
    : `Smaller company (${lead.companySize}) - may have budget constraints`;

  return { score, weight: DEFAULT_WEIGHTS.companySize, reasoning };
}

function calculateIndustryScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  const isHighValue = HIGH_VALUE_INDUSTRIES.some(industry => 
    lead.industry.toLowerCase().includes(industry.toLowerCase())
  );

  const score = isHighValue ? 90 : 60;
  const reasoning = isHighValue 
    ? `High-value industry (${lead.industry}) with strong technology adoption`
    : `Traditional industry (${lead.industry}) with moderate technology needs`;

  return { score, weight: DEFAULT_WEIGHTS.industryValue, reasoning };
}

function calculateJobTitleScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  const isSenior = SENIOR_TITLES.some(title => 
    lead.jobTitle.toLowerCase().includes(title.toLowerCase())
  );

  const isTech = /engineer|developer|architect|tech|software/i.test(lead.jobTitle);
  const isBusiness = /sales|marketing|business|commercial|revenue/i.test(lead.jobTitle);

  let score = 50;
  let reasoning = `Standard role (${lead.jobTitle})`;

  if (isSenior) {
    score += 30;
    reasoning = `Senior decision-maker (${lead.jobTitle}) with high influence`;
  }
  if (isTech) {
    score += 15;
    reasoning += ` - technical background enables better product evaluation`;
  }
  if (isBusiness) {
    score += 10;
    reasoning += ` - business focus aligns with ROI discussions`;
  }

  return { score: Math.min(100, score), weight: DEFAULT_WEIGHTS.jobTitleLevel, reasoning };
}

function calculateFundingScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  if (!lead.fundingInfo) {
    return { 
      score: 50, 
      weight: DEFAULT_WEIGHTS.fundingStage, 
      reasoning: 'No funding information available' 
    };
  }

  const funding = lead.fundingInfo.toLowerCase();
  let score = 50;
  let reasoning = 'Standard funding status';

  if (funding.includes('series a') || funding.includes('seed')) {
    score = 75;
    reasoning = 'Early-stage funding indicates growth focus and available capital';
  } else if (funding.includes('series b') || funding.includes('series c')) {
    score = 90;
    reasoning = 'Growth-stage funding with substantial capital for expansion';
  } else if (funding.includes('ipo') || funding.includes('public')) {
    score = 85;
    reasoning = 'Public company with stable financials but potentially slower decisions';
  } else if (funding.includes('bootstrap') || funding.includes('self-funded')) {
    score = 60;
    reasoning = 'Self-funded company - careful with spending but decisive';
  }

  return { score, weight: DEFAULT_WEIGHTS.fundingStage, reasoning };
}

function calculateTechStackScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  if (!lead.techStack || lead.techStack.length === 0) {
    return { 
      score: 50, 
      weight: DEFAULT_WEIGHTS.techStackModernity, 
      reasoning: 'No technology stack information available' 
    };
  }

  const modernTechCount = lead.techStack.filter(tech => 
    MODERN_TECH_STACK.some(modern => tech.toLowerCase().includes(modern.toLowerCase()))
  ).length;

  const modernityRatio = modernTechCount / lead.techStack.length;
  const score = Math.round(40 + (modernityRatio * 60));

  const reasoning = score >= 80 
    ? `Modern tech stack (${modernTechCount}/${lead.techStack.length} modern technologies) - likely tech-forward`
    : score >= 60 
    ? `Mixed tech stack with some modern elements - open to innovation`
    : `Legacy tech stack - may need more education on modern solutions`;

  return { score, weight: DEFAULT_WEIGHTS.techStackModernity, reasoning };
}

function calculateMarketPositionScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  // Simplified market position scoring based on company characteristics
  let score = 60; // Default
  let reasoning = 'Standard market position';

  // Industry leaders in high-value sectors get higher scores
  if (HIGH_VALUE_INDUSTRIES.some(industry => 
    lead.industry.toLowerCase().includes(industry.toLowerCase())
  )) {
    score += 20;
    reasoning = 'Strong market position in high-growth industry';
  }

  // Larger companies often have stronger market positions
  if (['501-1000', '1001-5000', '5000+'].includes(lead.companySize)) {
    score += 10;
    reasoning += ' - established company size indicates market presence';
  }

  return { score: Math.min(100, score), weight: DEFAULT_WEIGHTS.marketPosition, reasoning };
}

function calculateGrowthScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  if (!lead.recentActivity) {
    return { 
      score: 50, 
      weight: DEFAULT_WEIGHTS.growthIndicators, 
      reasoning: 'No recent activity information available' 
    };
  }

  const activity = lead.recentActivity.toLowerCase();
  const growthSignals = GROWTH_INDICATORS.filter(indicator => 
    activity.includes(indicator)
  ).length;

  const score = Math.min(100, 50 + (growthSignals * 15));
  const reasoning = growthSignals > 0 
    ? `Strong growth signals detected (${growthSignals} indicators) - company is expanding`
    : 'Limited growth indicators - stable but not rapidly expanding';

  return { score, weight: DEFAULT_WEIGHTS.growthIndicators, reasoning };
}

function calculateDecisionPowerScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  const isSeniorTitle = SENIOR_TITLES.some(title => 
    lead.jobTitle.toLowerCase().includes(title.toLowerCase())
  );

  const isTechLead = /cto|tech|engineer|architect/i.test(lead.jobTitle);
  const isBusinessLead = /ceo|coo|sales|business/i.test(lead.jobTitle);

  let score = 40;
  let reasoning = 'Limited decision-making authority';

  if (isSeniorTitle) {
    score += 40;
    reasoning = 'High decision-making authority';
  }
  if (isTechLead) {
    score += 15;
    reasoning += ' - technical decision influence';
  }
  if (isBusinessLead) {
    score += 20;
    reasoning += ' - business decision authority';
  }

  return { score: Math.min(100, score), weight: DEFAULT_WEIGHTS.decisionMakingPower, reasoning };
}

function calculateBuyingSignalsScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  let score = 50;
  let signals = [];

  if (lead.buyingIntent === 'High') {
    score += 30;
    signals.push('high buying intent');
  } else if (lead.buyingIntent === 'Medium') {
    score += 15;
    signals.push('moderate buying intent');
  }

  if (lead.recentActivity?.toLowerCase().includes('budget')) {
    score += 20;
    signals.push('budget discussions');
  }

  const reasoning = signals.length > 0 
    ? `Positive buying signals: ${signals.join(', ')}`
    : 'No clear buying signals detected';

  return { score: Math.min(100, score), weight: DEFAULT_WEIGHTS.buyingSignals, reasoning };
}

function calculateCompetitiveScore(lead: Lead): { score: number; weight: number; reasoning: string } {
  // Simplified competitive landscape scoring
  const score = 70; // Default moderate competitive pressure
  const reasoning = 'Standard competitive environment - differentiation opportunities exist';

  return { score, weight: DEFAULT_WEIGHTS.competitiveLandscape, reasoning };
}

function categorizeScore(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

function calculateConfidence(breakdown: any, lead: Lead): number {
  let dataPoints = 0;
  let totalPoints = 10;

  if (lead.companySize) dataPoints++;
  if (lead.industry) dataPoints++;
  if (lead.jobTitle) dataPoints++;
  if (lead.fundingInfo) dataPoints++;
  if (lead.techStack && lead.techStack.length > 0) dataPoints++;
  if (lead.recentActivity) dataPoints++;
  if (lead.buyingIntent) dataPoints++;
  if (lead.website) dataPoints++;
  if (lead.location) dataPoints++;
  if (lead.employeeCount) dataPoints++;

  return Math.round((dataPoints / totalPoints) * 100);
}

function generateRecommendations(breakdown: any, lead: Lead): string[] {
  const recommendations = [];

  if (breakdown.jobTitle.score >= 80) {
    recommendations.push('High-priority prospect - senior decision maker identified');
  }

  if (breakdown.companySize.score >= 80) {
    recommendations.push('Large company - prepare enterprise-level proposal');
  }

  if (breakdown.techStack.score >= 80) {
    recommendations.push('Tech-forward company - emphasize technical capabilities');
  }

  if (breakdown.growth.score >= 80) {
    recommendations.push('Growing company - focus on scalability benefits');
  }

  if (breakdown.funding.score >= 80) {
    recommendations.push('Well-funded company - budget likely available');
  }

  return recommendations.length > 0 ? recommendations : ['Standard outreach approach recommended'];
}

function identifyRiskFactors(breakdown: any, lead: Lead): string[] {
  const risks = [];

  if (breakdown.companySize.score <= 40) {
    risks.push('Small company size may indicate limited budget');
  }

  if (breakdown.jobTitle.score <= 40) {
    risks.push('Limited decision-making authority');
  }

  if (breakdown.techStack.score <= 40) {
    risks.push('Legacy technology stack may indicate resistance to change');
  }

  if (breakdown.buying.score <= 30) {
    risks.push('No clear buying signals detected');
  }

  return risks;
}

function identifyOpportunities(breakdown: any, lead: Lead): string[] {
  const opportunities = [];

  if (breakdown.growth.score >= 70) {
    opportunities.push('Company growth creates expansion opportunities');
  }

  if (breakdown.industry.score >= 80) {
    opportunities.push('High-value industry with strong technology adoption');
  }

  if (breakdown.techStack.score >= 70) {
    opportunities.push('Modern tech stack indicates openness to innovation');
  }

  if (breakdown.funding.score >= 70) {
    opportunities.push('Strong funding position enables investment in new solutions');
  }

  return opportunities;
}
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Lead, InsertLead } from '@shared/schema';

// Real-world data enrichment using public APIs and web scraping
export interface EnrichmentData {
  companyInfo?: {
    description?: string;
    website?: string;
    industry?: string;
    employeeCount?: number;
    location?: string;
    fundingInfo?: string;
    techStack?: string[];
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
  marketData?: {
    marketCap?: string;
    revenue?: string;
    growthRate?: string;
    competitorCount?: number;
  };
  newsData?: {
    recentNews?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    pressReleases?: string[];
  };
}

// Enrich company data using Clearbit-style API (free tier simulation)
export async function enrichCompanyFromDomain(domain: string): Promise<EnrichmentData | null> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    // Scrape company homepage for basic info
    const companyInfo = await scrapeCompanyHomepage(`https://${cleanDomain}`);
    
    // Get GitHub organization data if available
    const techStack = await getTechStackFromGitHub(cleanDomain);
    
    // Search for news mentions
    const newsData = await searchCompanyNews(cleanDomain);
    
    return {
      companyInfo: {
        ...companyInfo,
        techStack: techStack || companyInfo.techStack
      },
      newsData
    };
  } catch (error) {
    console.error(`Enrichment failed for ${domain}:`, error);
    return null;
  }
}

// Scrape company homepage for structured data
async function scrapeCompanyHomepage(url: string): Promise<Partial<EnrichmentData['companyInfo']>> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeadBot/1.0)'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract meta tags and structured data
    const description = $('meta[name="description"]').attr('content') || 
                      $('meta[property="og:description"]').attr('content');
    
    const title = $('title').text();
    
    // Look for employee count indicators
    const bodyText = $('body').text().toLowerCase();
    let employeeCount;
    
    const employeeMatches = bodyText.match(/(\d+)\+?\s*(employees?|team members?|people)/i);
    if (employeeMatches) {
      employeeCount = parseInt(employeeMatches[1]);
    }
    
    // Extract tech stack from script tags and meta
    const techStack = extractTechStackFromHTML($);
    
    // Look for funding information
    const fundingInfo = extractFundingInfo(bodyText);
    
    // Extract social media links
    const socialMedia = {
      linkedin: $('a[href*="linkedin.com"]').attr('href'),
      twitter: $('a[href*="twitter.com"], a[href*="x.com"]').attr('href'),
      github: $('a[href*="github.com"]').attr('href')
    };
    
    return {
      description,
      employeeCount,
      techStack,
      fundingInfo,
      socialMedia
    };
  } catch (error) {
    console.error('Homepage scraping failed:', error);
    return {};
  }
}

// Extract tech stack from HTML analysis
function extractTechStackFromHTML($: cheerio.CheerioAPI): string[] {
  const techStack: string[] = [];
  
  // Check for common CDN links and scripts
  const scripts = $('script[src]');
  const links = $('link[href]');
  
  scripts.each((_, script) => {
    const src = $(script).attr('src') || '';
    if (src.includes('react')) techStack.push('React');
    if (src.includes('vue')) techStack.push('Vue.js');
    if (src.includes('angular')) techStack.push('Angular');
    if (src.includes('jquery')) techStack.push('jQuery');
    if (src.includes('bootstrap')) techStack.push('Bootstrap');
  });
  
  links.each((_, link) => {
    const href = $(link).attr('href') || '';
    if (href.includes('tailwind')) techStack.push('Tailwind CSS');
    if (href.includes('bootstrap')) techStack.push('Bootstrap');
  });
  
  // Check for framework indicators in HTML structure
  const htmlContent = $.html();
  if (htmlContent.includes('data-react')) techStack.push('React');
  if (htmlContent.includes('ng-')) techStack.push('Angular');
  if (htmlContent.includes('v-')) techStack.push('Vue.js');
  
  return [...new Set(techStack)]; // Remove duplicates
}

// Extract funding information from text
function extractFundingInfo(text: string): string | undefined {
  const fundingPatterns = [
    /series [a-z]\s*[-–]\s*\$?(\d+[a-z]*)/i,
    /raised\s*\$?(\d+[a-z]*)/i,
    /funding\s*round.*\$?(\d+[a-z]*)/i,
    /\$(\d+[a-z]*)\s*(million|billion|m|b)/i,
    /(seed|pre-seed|series [a-z]|ipo|public)/i
  ];
  
  for (const pattern of fundingPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return undefined;
}

// Get tech stack from GitHub organization
async function getTechStackFromGitHub(domain: string): Promise<string[] | null> {
  try {
    // Try to find GitHub organization by domain
    const orgName = domain.split('.')[0];
    
    const response = await axios.get(`https://api.github.com/orgs/${orgName}/repos`, {
      params: { per_page: 10, sort: 'stars' }
    });
    
    const languages = new Set<string>();
    
    for (const repo of response.data) {
      if (repo.language) {
        languages.add(repo.language);
      }
      
      // Get languages for top repos
      try {
        const langResponse = await axios.get(repo.languages_url);
        Object.keys(langResponse.data).forEach(lang => languages.add(lang));
      } catch (error) {
        // Continue if language fetch fails
      }
    }
    
    return Array.from(languages);
  } catch (error) {
    return null;
  }
}

// Search for company news using NewsAPI or similar
async function searchCompanyNews(companyName: string): Promise<Partial<EnrichmentData['newsData']>> {
  try {
    // For demonstration, we'll use a mock news search
    // In production, you'd use NewsAPI, Google News API, or similar
    const recentNews = [
      `${companyName} announces new product launch`,
      `${companyName} raises Series B funding`,
      `${companyName} expands to new markets`
    ];
    
    return {
      recentNews,
      sentiment: 'positive'
    };
  } catch (error) {
    return {};
  }
}

// ML-based lead quality scoring using weighted features
export function calculateMLLeadScore(lead: Lead, enrichmentData?: EnrichmentData): number {
  let score = 0;
  const weights = {
    companySize: 0.25,
    jobTitle: 0.25,
    industry: 0.20,
    funding: 0.15,
    techStack: 0.10,
    engagement: 0.05
  };
  
  // Company size scoring (0-100)
  const companySizeScore = getCompanySizeScore(lead.employeeCount || 0);
  score += companySizeScore * weights.companySize;
  
  // Job title relevance (0-100)
  const jobTitleScore = getJobTitleRelevanceScore(lead.jobTitle);
  score += jobTitleScore * weights.jobTitle;
  
  // Industry value (0-100)
  const industryScore = getIndustryValueScore(lead.industry);
  score += industryScore * weights.industry;
  
  // Funding stage (0-100)
  const fundingScore = getFundingStageScore(lead.fundingInfo || '');
  score += fundingScore * weights.funding;
  
  // Tech stack compatibility (0-100)
  const techScore = getTechStackCompatibilityScore(lead.techStack || []);
  score += techScore * weights.techStack;
  
  // Engagement signals (0-100)
  const engagementScore = getEngagementScore(lead);
  score += engagementScore * weights.engagement;
  
  return Math.round(score);
}

function getCompanySizeScore(employeeCount: number): number {
  if (employeeCount >= 1000) return 100;
  if (employeeCount >= 500) return 90;
  if (employeeCount >= 200) return 80;
  if (employeeCount >= 50) return 70;
  if (employeeCount >= 10) return 60;
  return 40;
}

function getJobTitleRelevanceScore(jobTitle: string): number {
  const title = jobTitle.toLowerCase();
  const decisionMakers = ['ceo', 'cto', 'cfo', 'vp', 'director', 'head', 'chief'];
  const technicalRoles = ['engineer', 'developer', 'architect', 'lead'];
  
  for (const role of decisionMakers) {
    if (title.includes(role)) return 100;
  }
  
  for (const role of technicalRoles) {
    if (title.includes(role)) return 70;
  }
  
  return 40;
}

function getIndustryValueScore(industry: string): number {
  const highValue = ['saas', 'fintech', 'enterprise software', 'cybersecurity'];
  const mediumValue = ['healthcare', 'e-commerce', 'data analytics', 'cloud services'];
  
  const industryLower = industry.toLowerCase();
  
  for (const ind of highValue) {
    if (industryLower.includes(ind)) return 100;
  }
  
  for (const ind of mediumValue) {
    if (industryLower.includes(ind)) return 75;
  }
  
  return 50;
}

function getFundingStageScore(fundingInfo: string): number {
  const funding = fundingInfo.toLowerCase();
  
  if (funding.includes('series c') || funding.includes('series d')) return 100;
  if (funding.includes('series b')) return 90;
  if (funding.includes('series a')) return 80;
  if (funding.includes('seed')) return 70;
  if (funding.includes('public')) return 85;
  
  return 40;
}

function getTechStackCompatibilityScore(techStack: string[]): number {
  const modernTech = ['react', 'typescript', 'node.js', 'python', 'go', 'kubernetes'];
  const matchCount = techStack.filter(tech => 
    modernTech.some(modern => tech.toLowerCase().includes(modern))
  ).length;
  
  return Math.min(100, (matchCount / modernTech.length) * 100);
}

function getEngagementScore(lead: Lead): number {
  let score = 50; // Base score
  
  if (lead.recentActivity) {
    const activity = lead.recentActivity.toLowerCase();
    if (activity.includes('demo') || activity.includes('trial')) score += 30;
    else if (activity.includes('download')) score += 20;
    else if (activity.includes('visit')) score += 10;
  }
  
  return Math.min(100, score);
}

// Categorize lead quality based on ML score
export function categorizeLeadQuality(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  return 'Low';
}
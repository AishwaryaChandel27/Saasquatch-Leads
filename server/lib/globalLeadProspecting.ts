import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { InsertLead } from '@shared/schema';

export interface ProspectingOptions {
  industry?: string;
  companySize?: string;
  location?: string;
  limit: number;
  sources: ('linkedin' | 'github' | 'crunchbase' | 'news')[];
}

export interface ProspectingResult {
  leads: InsertLead[];
  totalFound: number;
  sources: string[];
  industries: string[];
}

// Industry categories for comprehensive coverage
const GLOBAL_INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Media',
  'Consulting',
  'Energy',
  'Automotive',
  'Food & Beverage',
  'Retail',
  'Insurance',
  'Transportation',
  'Construction',
  'Telecommunications',
  'Agriculture',
  'Aerospace',
  'Biotechnology'
];

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5000+ employees'
];

const GLOBAL_LOCATIONS = [
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'Netherlands',
  'Australia',
  'Singapore',
  'India',
  'Japan',
  'Brazil',
  'Israel',
  'Sweden',
  'Switzerland',
  'Ireland'
];

export async function prospectGlobalLeads(options: ProspectingOptions): Promise<ProspectingResult> {
  const allLeads: InsertLead[] = [];
  const sourcesUsed: string[] = [];
  const industriesFound: string[] = [];

  console.log(`Starting global lead prospecting: ${options.limit} leads from ${options.sources.join(', ')}`);

  try {
    // Parallel processing for better performance
    const prospectingPromises = options.sources.map(async (source) => {
      switch (source) {
        case 'linkedin':
          return await prospectFromLinkedIn(options);
        case 'github':
          return await prospectFromGitHub(options);
        case 'crunchbase':
          return await prospectFromCrunchbase(options);
        case 'news':
          return await prospectFromNewsSources(options);
        default:
          return { leads: [], source: '' };
      }
    });

    const results = await Promise.allSettled(prospectingPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.leads.length > 0) {
        allLeads.push(...result.value.leads);
        sourcesUsed.push(options.sources[index]);
        
        // Track industries found
        result.value.leads.forEach(lead => {
          if (lead.industry && !industriesFound.includes(lead.industry)) {
            industriesFound.push(lead.industry);
          }
        });
      }
    });

    // Remove duplicates and limit results
    const uniqueLeads = removeDuplicateLeads(allLeads);
    const limitedLeads = uniqueLeads.slice(0, options.limit);

    console.log(`Global prospecting completed: ${limitedLeads.length} unique leads from ${sourcesUsed.length} sources`);

    return {
      leads: limitedLeads,
      totalFound: uniqueLeads.length,
      sources: sourcesUsed,
      industries: industriesFound
    };
  } catch (error) {
    console.error('Global lead prospecting error:', error);
    throw new Error(`Failed to prospect global leads: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function prospectFromLinkedIn(options: ProspectingOptions): Promise<{ leads: InsertLead[], source: string }> {
  const leads: InsertLead[] = [];
  
  try {
    // Use Google search to find LinkedIn company pages
    const industries = options.industry ? [options.industry] : GLOBAL_INDUSTRIES.slice(0, 5);
    
    for (const industry of industries) {
      const searchQuery = `site:linkedin.com/company ${industry} ${options.location || 'global'}`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=20`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        
        $('.g').each((i, element) => {
          const titleElement = $(element).find('h3');
          const linkElement = $(element).find('a').first();
          const snippetElement = $(element).find('.VwiC3b');
          
          if (titleElement.length && linkElement.length) {
            const title = titleElement.text().trim();
            const link = linkElement.attr('href');
            const snippet = snippetElement.text().trim();
            
            if (link?.includes('linkedin.com/company') && title) {
              const companyName = extractCompanyNameFromLinkedIn(title);
              if (companyName && leads.length < options.limit / 2) {
                leads.push(generateLeadFromLinkedIn(companyName, industry, snippet, link));
              }
            }
          }
        });
      }
      
      if (leads.length >= options.limit / 2) break;
    }
  } catch (error) {
    console.error('LinkedIn prospecting error:', error);
  }
  
  return { leads, source: 'LinkedIn' };
}

async function prospectFromGitHub(options: ProspectingOptions): Promise<{ leads: InsertLead[], source: string }> {
  const leads: InsertLead[] = [];
  
  try {
    // Search for organizations on GitHub
    const technologies = ['react', 'nodejs', 'python', 'java', 'typescript', 'go', 'kubernetes'];
    
    for (const tech of technologies) {
      const searchUrl = `https://api.github.com/search/users?q=type:org ${tech}&sort=repositories&per_page=30`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Lead-Generator-App'
        }
      });
      
      if (response.ok) {
        const data = await response.json() as any;
        
        for (const org of data.items || []) {
          if (leads.length >= options.limit / 3) break;
          
          // Get organization details
          const orgResponse = await fetch(org.url, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Lead-Generator-App'
            }
          });
          
          if (orgResponse.ok) {
            const orgData = await orgResponse.json() as any;
            leads.push(generateLeadFromGitHub(orgData, tech));
          }
        }
      }
      
      if (leads.length >= options.limit / 3) break;
    }
  } catch (error) {
    console.error('GitHub prospecting error:', error);
  }
  
  return { leads, source: 'GitHub' };
}

async function prospectFromCrunchbase(options: ProspectingOptions): Promise<{ leads: InsertLead[], source: string }> {
  const leads: InsertLead[] = [];
  
  try {
    // Use Google search to find Crunchbase company profiles
    const industries = options.industry ? [options.industry] : GLOBAL_INDUSTRIES.slice(0, 5);
    
    for (const industry of industries) {
      const searchQuery = `site:crunchbase.com/organization ${industry} startup company`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=15`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        
        $('.g').each((i, element) => {
          const titleElement = $(element).find('h3');
          const linkElement = $(element).find('a').first();
          const snippetElement = $(element).find('.VwiC3b');
          
          if (titleElement.length && linkElement.length) {
            const title = titleElement.text().trim();
            const link = linkElement.attr('href');
            const snippet = snippetElement.text().trim();
            
            if (link?.includes('crunchbase.com/organization') && title) {
              const companyName = extractCompanyNameFromCrunchbase(title);
              if (companyName && leads.length < options.limit / 4) {
                leads.push(generateLeadFromCrunchbase(companyName, industry, snippet, link));
              }
            }
          }
        });
      }
      
      if (leads.length >= options.limit / 4) break;
    }
  } catch (error) {
    console.error('Crunchbase prospecting error:', error);
  }
  
  return { leads, source: 'Crunchbase' };
}

async function prospectFromNewsSources(options: ProspectingOptions): Promise<{ leads: InsertLead[], source: string }> {
  const leads: InsertLead[] = [];
  
  try {
    // Search for companies in business news
    const keywords = ['funding', 'startup', 'new company', 'business launch', 'series a', 'ipo'];
    
    for (const keyword of keywords) {
      const searchQuery = `${keyword} ${options.industry || 'technology'} company 2024`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=nws&num=20`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        
        $('.g').each((i, element) => {
          const titleElement = $(element).find('h3');
          const snippetElement = $(element).find('.VwiC3b');
          
          if (titleElement.length && snippetElement.length) {
            const title = titleElement.text().trim();
            const snippet = snippetElement.text().trim();
            
            const companyName = extractCompanyNameFromNews(title, snippet);
            if (companyName && leads.length < options.limit / 4) {
              leads.push(generateLeadFromNews(companyName, snippet, options.industry || 'Technology'));
            }
          }
        });
      }
      
      if (leads.length >= options.limit / 4) break;
    }
  } catch (error) {
    console.error('News prospecting error:', error);
  }
  
  return { leads, source: 'News Sources' };
}

// Helper functions
function extractCompanyNameFromLinkedIn(title: string): string | null {
  // Remove "| LinkedIn" and other common suffixes
  const cleaned = title.replace(/\s*\|\s*LinkedIn.*$/i, '').trim();
  return cleaned.length > 2 ? cleaned : null;
}

function extractCompanyNameFromCrunchbase(title: string): string | null {
  // Remove "- Crunchbase" and other suffixes
  const cleaned = title.replace(/\s*-\s*Crunchbase.*$/i, '').trim();
  return cleaned.length > 2 ? cleaned : null;
}

function extractCompanyNameFromNews(title: string, snippet: string): string | null {
  // Look for company names in news titles and snippets
  const text = `${title} ${snippet}`;
  const matches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Solutions|Systems)\b/g);
  return matches ? matches[0] : null;
}

function generateLeadFromLinkedIn(companyName: string, industry: string, snippet: string, linkedinUrl: string): InsertLead {
  return {
    companyName,
    contactName: 'Business Development',
    jobTitle: 'Decision Maker',
    email: null,
    phone: null,
    companySize: getRandomCompanySize(),
    industry,
    location: getRandomLocation(),
    website: null,
    linkedinUrl,
    score: Math.floor(Math.random() * 40) + 60, // 60-100 for LinkedIn leads
    priority: 'warm',
    tags: ['LinkedIn Prospect'],
    notes: `Found via LinkedIn: ${snippet.substring(0, 100)}...`,
    lastContact: null,
    nextFollowUp: null,
    isEnriched: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateLeadFromGitHub(orgData: any, technology: string): InsertLead {
  return {
    companyName: orgData.name || orgData.login,
    contactName: 'Technical Lead',
    jobTitle: 'CTO/Engineering Manager',
    email: orgData.email,
    phone: null,
    companySize: estimateCompanySizeFromRepos(orgData.public_repos),
    industry: 'Technology',
    location: orgData.location || 'Global',
    website: orgData.blog || null,
    linkedinUrl: null,
    score: Math.floor(Math.random() * 30) + 50, // 50-80 for GitHub leads
    priority: 'warm',
    tags: ['GitHub Organization', technology],
    notes: `GitHub org with ${orgData.public_repos} repositories. Bio: ${orgData.bio || 'N/A'}`,
    lastContact: null,
    nextFollowUp: null,
    isEnriched: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateLeadFromCrunchbase(companyName: string, industry: string, snippet: string, crunchbaseUrl: string): InsertLead {
  return {
    companyName,
    contactName: 'Founder/CEO',
    jobTitle: 'Chief Executive Officer',
    email: null,
    phone: null,
    companySize: getRandomCompanySize(),
    industry,
    location: getRandomLocation(),
    website: null,
    linkedinUrl: null,
    score: Math.floor(Math.random() * 35) + 65, // 65-100 for Crunchbase leads
    priority: 'hot',
    tags: ['Crunchbase Profile', 'Startup'],
    notes: `Crunchbase profile: ${snippet.substring(0, 150)}...`,
    lastContact: null,
    nextFollowUp: null,
    isEnriched: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateLeadFromNews(companyName: string, snippet: string, industry: string): InsertLead {
  return {
    companyName,
    contactName: 'Executive Team',
    jobTitle: 'Business Development',
    email: null,
    phone: null,
    companySize: getRandomCompanySize(),
    industry,
    location: getRandomLocation(),
    website: null,
    linkedinUrl: null,
    score: Math.floor(Math.random() * 25) + 70, // 70-95 for news leads
    priority: 'hot',
    tags: ['News Mention', 'Recent Activity'],
    notes: `Recent news coverage: ${snippet.substring(0, 150)}...`,
    lastContact: null,
    nextFollowUp: null,
    isEnriched: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function getRandomCompanySize(): string {
  return COMPANY_SIZES[Math.floor(Math.random() * COMPANY_SIZES.length)];
}

function getRandomLocation(): string {
  return GLOBAL_LOCATIONS[Math.floor(Math.random() * GLOBAL_LOCATIONS.length)];
}

function estimateCompanySizeFromRepos(repoCount: number): string {
  if (repoCount < 10) return '1-10 employees';
  if (repoCount < 50) return '11-50 employees';
  if (repoCount < 100) return '51-200 employees';
  if (repoCount < 200) return '201-500 employees';
  return '500+ employees';
}

function removeDuplicateLeads(leads: InsertLead[]): InsertLead[] {
  const seen = new Set<string>();
  return leads.filter(lead => {
    const key = lead.companyName.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getAvailableIndustries(): string[] {
  return GLOBAL_INDUSTRIES;
}

export function getAvailableLocations(): string[] {
  return GLOBAL_LOCATIONS;
}

export function getAvailableCompanySizes(): string[] {
  return COMPANY_SIZES;
}
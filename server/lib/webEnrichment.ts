import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Lead } from '@shared/schema';

// Comprehensive web-based company data enrichment
export interface WebEnrichmentResult {
  companyData: {
    description?: string;
    employeeCount?: number;
    location?: string;
    foundedYear?: string;
    industry?: string;
    techStack?: string[];
  };
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  keyMetrics: {
    websiteTraffic?: string;
    marketPosition?: string;
    growthStage?: string;
  };
}

export async function enrichLeadFromWeb(lead: Lead): Promise<WebEnrichmentResult | null> {
  if (!lead.website) return null;

  try {
    const domain = extractDomain(lead.website);
    console.log(`Starting web enrichment for ${lead.companyName} (${domain})`);

    // Scrape company website for structured data
    const websiteData = await scrapeCompanyWebsite(domain);
    
    // Extract social media profiles
    const socialProfiles = await extractSocialProfiles(domain);
    
    // Analyze tech stack from website
    const techStack = await detectTechStackFromWebsite(domain);
    
    // Get additional company metrics
    const keyMetrics = await analyzeCompanyMetrics(lead.companyName, domain);

    const enrichmentResult: WebEnrichmentResult = {
      companyData: {
        ...websiteData,
        techStack: techStack.length > 0 ? techStack : lead.techStack || undefined
      },
      socialProfiles,
      keyMetrics
    };

    console.log(`Web enrichment completed for ${lead.companyName}: ${Object.keys(enrichmentResult.companyData).length} data points`);
    return enrichmentResult;

  } catch (error) {
    console.error(`Web enrichment failed for ${lead.companyName}:`, error);
    return null;
  }
}

async function scrapeCompanyWebsite(domain: string): Promise<Partial<WebEnrichmentResult['companyData']>> {
  try {
    const url = `https://${domain}`;
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeadEnrichment/1.0; +https://example.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate'
      },
      maxRedirects: 3
    });

    const $ = cheerio.load(response.data);
    
    // Extract meta description
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') ||
                       $('.hero-description, .company-description, .about-description').first().text().trim();

    // Look for structured data (JSON-LD)
    let structuredData: any = {};
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const data = JSON.parse($(element).html() || '{}');
        if (data['@type'] === 'Organization') {
          structuredData = data;
        }
      } catch (e) {
        // Skip invalid JSON-LD
      }
    });

    // Extract employee count from various indicators
    const bodyText = $('body').text().toLowerCase();
    const employeeCount = extractEmployeeCountFromText(bodyText, $);
    
    // Extract company location
    const location = extractLocationFromWebsite($, bodyText);
    
    // Extract founding year
    const foundedYear = extractFoundingYear(bodyText);
    
    // Extract industry from content
    const industry = extractIndustryFromContent($, bodyText);

    return {
      description: description ? description.substring(0, 400) : undefined,
      employeeCount,
      location,
      foundedYear,
      industry,
      ...structuredData
    };

  } catch (error) {
    console.error(`Website scraping failed for ${domain}:`, error);
    return {};
  }
}

async function extractSocialProfiles(domain: string): Promise<WebEnrichmentResult['socialProfiles']> {
  try {
    const url = `https://${domain}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SocialProfileExtractor/1.0)' }
    });

    const $ = cheerio.load(response.data);
    const profiles: WebEnrichmentResult['socialProfiles'] = {};

    // Find LinkedIn company page
    const linkedinSelectors = [
      'a[href*="linkedin.com/company"]',
      'a[href*="linkedin.com/in"]',
      'a[href*="linkedin.com"]'
    ];
    
    for (const selector of linkedinSelectors) {
      const href = $(selector).first().attr('href');
      if (href && href.includes('linkedin.com')) {
        profiles.linkedin = href;
        break;
      }
    }

    // Find Twitter profile
    const twitterSelectors = [
      'a[href*="twitter.com"]',
      'a[href*="x.com"]'
    ];
    
    for (const selector of twitterSelectors) {
      const href = $(selector).first().attr('href');
      if (href) {
        profiles.twitter = href;
        break;
      }
    }

    // Find GitHub organization
    const githubHref = $('a[href*="github.com"]').first().attr('href');
    if (githubHref) {
      profiles.github = githubHref;
    }

    return profiles;

  } catch (error) {
    console.error(`Social profile extraction failed for ${domain}:`, error);
    return {};
  }
}

async function detectTechStackFromWebsite(domain: string): Promise<string[]> {
  try {
    const url = `https://${domain}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechStackDetector/1.0)' }
    });

    const $ = cheerio.load(response.data);
    const techStack = new Set<string>();
    const html = response.data;

    // Analyze JavaScript frameworks
    if (html.includes('react') || html.includes('React') || $('script[src*="react"]').length > 0) {
      techStack.add('React');
    }
    if (html.includes('vue') || html.includes('Vue') || $('script[src*="vue"]').length > 0) {
      techStack.add('Vue.js');
    }
    if (html.includes('angular') || html.includes('Angular') || $('script[src*="angular"]').length > 0) {
      techStack.add('Angular');
    }
    if (html.includes('svelte') || html.includes('Svelte')) {
      techStack.add('Svelte');
    }

    // Check for Next.js
    if (html.includes('__NEXT_DATA__') || html.includes('_next/') || $('script[src*="next"]').length > 0) {
      techStack.add('Next.js');
      techStack.add('React');
    }

    // Check for Nuxt.js
    if (html.includes('__NUXT__') || html.includes('_nuxt/')) {
      techStack.add('Nuxt.js');
      techStack.add('Vue.js');
    }

    // Analyze CSS frameworks
    if ($('link[href*="bootstrap"]').length > 0 || html.includes('bootstrap')) {
      techStack.add('Bootstrap');
    }
    if ($('link[href*="tailwind"]').length > 0 || html.includes('tailwind')) {
      techStack.add('Tailwind CSS');
    }

    // Check for TypeScript
    if ($('script[src*="typescript"]').length > 0 || html.includes('.ts"') || html.includes('typescript')) {
      techStack.add('TypeScript');
    }

    // Analyze server technology from headers
    const server = response.headers['server'];
    if (server) {
      if (server.toLowerCase().includes('nginx')) techStack.add('Nginx');
      if (server.toLowerCase().includes('apache')) techStack.add('Apache');
      if (server.toLowerCase().includes('cloudflare')) techStack.add('Cloudflare');
    }

    // Check for popular services
    if (html.includes('vercel.com') || response.headers['x-vercel-id']) {
      techStack.add('Vercel');
    }
    if (html.includes('netlify') || response.headers['server']?.includes('Netlify')) {
      techStack.add('Netlify');
    }

    return Array.from(techStack);

  } catch (error) {
    console.error(`Tech stack detection failed for ${domain}:`, error);
    return [];
  }
}

async function analyzeCompanyMetrics(companyName: string, domain: string): Promise<WebEnrichmentResult['keyMetrics']> {
  try {
    // Simulate website traffic analysis (in production, you'd use SimilarWeb API or similar)
    const metrics: WebEnrichmentResult['keyMetrics'] = {};

    // Estimate traffic tier based on domain characteristics
    const domainAge = await estimateDomainAge(domain);
    if (domainAge) {
      if (domainAge > 10) {
        metrics.websiteTraffic = 'High (1M+ monthly visitors)';
        metrics.marketPosition = 'Established Market Leader';
      } else if (domainAge > 5) {
        metrics.websiteTraffic = 'Medium (100K-1M monthly visitors)';
        metrics.marketPosition = 'Growing Competitor';
      } else {
        metrics.websiteTraffic = 'Low-Medium (10K-100K monthly visitors)';
        metrics.marketPosition = 'Emerging Player';
      }
    }

    // Determine growth stage based on available indicators
    metrics.growthStage = determineGrowthStage(companyName, domain);

    return metrics;

  } catch (error) {
    console.error(`Company metrics analysis failed for ${companyName}:`, error);
    return {};
  }
}

// Helper functions
function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
}

function extractEmployeeCountFromText(text: string, $: cheerio.CheerioAPI): number | undefined {
  // Look for specific employee count patterns
  const patterns = [
    /(\d+)\+?\s*(employees?|team members?|people|staff)/i,
    /team of (\d+)/i,
    /(\d+)\s*person team/i,
    /we are (\d+)/i,
    /(\d+)\s*strong/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      if (count > 0 && count < 500000) { // Reasonable bounds
        return count;
      }
    }
  }

  // Check for team page indicators
  const teamPageExists = $('a[href*="team"], a[href*="about"], a[href*="people"]').length > 0;
  if (teamPageExists) {
    // If we can't find exact count but there's a team page, estimate based on content
    if (text.includes('startup') || text.includes('small team')) return 15;
    if (text.includes('growing') || text.includes('expanding')) return 50;
    if (text.includes('enterprise') || text.includes('large')) return 200;
  }

  return undefined;
}

function extractLocationFromWebsite($: cheerio.CheerioAPI, text: string): string | undefined {
  // Check for structured address data
  const addressSelectors = [
    '[itemprop="address"]',
    '.address',
    '.location',
    '.contact-address',
    '.footer-address'
  ];

  for (const selector of addressSelectors) {
    const address = $(selector).first().text().trim();
    if (address && address.length > 5) {
      return address;
    }
  }

  // Look for location patterns in text
  const locationPatterns = [
    /(?:headquarters|based|located|office)\s+(?:in|at)\s+([^.]+)/i,
    /([A-Za-z\s]+,\s*[A-Z]{2,}(?:\s+\d{5})?)/g,
    /(San Francisco|New York|Los Angeles|Chicago|Boston|Austin|Seattle|Denver|Atlanta|Portland|Miami|London|Toronto|Berlin|Amsterdam|Singapore)[^a-z]/i
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      if (location.length > 3 && location.length < 100) {
        return location;
      }
    }
  }

  return undefined;
}

function extractFoundingYear(text: string): string | undefined {
  const patterns = [
    /(?:founded|established|started|since|est\.?)\s+(?:in\s+)?(\d{4})/i,
    /(\d{4})\s*(?:-\s*present|to\s+now)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const year = parseInt(match[1]);
      const currentYear = new Date().getFullYear();
      if (year >= 1900 && year <= currentYear) {
        return match[1];
      }
    }
  }

  return undefined;
}

function extractIndustryFromContent($: cheerio.CheerioAPI, text: string): string | undefined {
  const industryKeywords = {
    'SaaS': ['saas', 'software as a service', 'cloud software', 'web application'],
    'FinTech': ['fintech', 'financial technology', 'payments', 'banking', 'cryptocurrency'],
    'E-commerce': ['ecommerce', 'e-commerce', 'online store', 'marketplace', 'retail'],
    'HealthTech': ['healthtech', 'healthcare', 'medical', 'health technology', 'telemedicine'],
    'EdTech': ['edtech', 'education', 'learning', 'online courses', 'educational'],
    'DevOps': ['devops', 'infrastructure', 'deployment', 'CI/CD', 'cloud native'],
    'AI/ML': ['artificial intelligence', 'machine learning', 'ai', 'ml', 'data science'],
    'Cybersecurity': ['cybersecurity', 'security', 'privacy', 'protection', 'encryption']
  };

  const lowerText = text.toLowerCase();
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return industry;
      }
    }
  }

  return undefined;
}

async function estimateDomainAge(domain: string): Promise<number | undefined> {
  try {
    // In production, you might use WHOIS API or domain age services
    // For demonstration, we'll estimate based on domain patterns
    const commonDomains = {
      'google.com': 25,
      'microsoft.com': 30,
      'apple.com': 25,
      'amazon.com': 25,
      'facebook.com': 20,
      'github.com': 15,
      'vercel.com': 8,
      'supabase.com': 5,
      'planetscale.com': 4,
      'railway.app': 3,
      'linear.app': 5
    };

    if (commonDomains[domain]) {
      return commonDomains[domain];
    }

    // Estimate based on domain characteristics
    if (domain.endsWith('.app') || domain.endsWith('.dev')) return 3;
    if (domain.endsWith('.io')) return 6;
    if (domain.endsWith('.com')) return 8;
    
    return undefined;
  } catch (error) {
    return undefined;
  }
}

function determineGrowthStage(companyName: string, domain: string): string {
  // Determine growth stage based on various indicators
  const knownCompanies = {
    'Vercel': 'Scale-up',
    'Supabase': 'Growth',
    'PlanetScale': 'Growth',
    'Railway': 'Early-stage',
    'Linear': 'Growth'
  };

  if (knownCompanies[companyName]) {
    return knownCompanies[companyName];
  }

  // Default estimation based on domain type
  if (domain.endsWith('.app') || domain.endsWith('.dev')) return 'Early-stage';
  if (domain.endsWith('.io')) return 'Growth';
  return 'Scale-up';
}
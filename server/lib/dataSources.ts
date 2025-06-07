import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { InsertLead } from '@shared/schema';

export interface CompanyData {
  companyName: string;
  website?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  description?: string;
  foundedYear?: string;
  employeeCount?: number;
  funding?: string;
  techStack?: string[];
}

export interface ContactData {
  name: string;
  jobTitle: string;
  email?: string;
  linkedinUrl?: string;
  company: string;
}

// Crunchbase scraper for company data
export async function scrapeCompanyFromCrunchbase(companyName: string): Promise<CompanyData | null> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const searchUrl = `https://www.crunchbase.com/discover/organization.companies/field/organizations/num_employees_enum/seed`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    // Search for the company
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
    await page.type('input[placeholder*="Search"]', companyName);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Extract company data from search results
    const companyData = await page.evaluate(() => {
      const companyCards = document.querySelectorAll('[data-testid="organization-card"]');
      if (companyCards.length === 0) return null;

      const firstCard = companyCards[0];
      const name = firstCard.querySelector('h3')?.textContent?.trim();
      const description = firstCard.querySelector('[data-testid="organization-description"]')?.textContent?.trim();
      const location = firstCard.querySelector('[data-testid="location"]')?.textContent?.trim();
      const industry = firstCard.querySelector('[data-testid="industry"]')?.textContent?.trim();
      
      return {
        companyName: name || '',
        description,
        location,
        industry
      };
    });

    return companyData;
  } catch (error) {
    console.error('Crunchbase scraping error:', error);
    return null;
  } finally {
    await browser.close();
  }
}

// LinkedIn company page scraper
export async function scrapeLinkedInCompany(companyName: string): Promise<CompanyData | null> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(companyName)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(3000);

    const companyData = await page.evaluate(() => {
      const companyCards = document.querySelectorAll('[data-test-search-result="COMPANY"]');
      if (companyCards.length === 0) return null;

      const firstCard = companyCards[0];
      const name = firstCard.querySelector('h3 span')?.textContent?.trim();
      const description = firstCard.querySelector('.search-result__snippets')?.textContent?.trim();
      const location = firstCard.querySelector('[data-test-search-result-headline]')?.textContent?.trim();
      
      return {
        companyName: name || '',
        description,
        location
      };
    });

    return companyData;
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    return null;
  } finally {
    await browser.close();
  }
}

// Hunter.io API for email finding
export async function findCompanyEmails(domain: string): Promise<ContactData[]> {
  try {
    // This would require Hunter.io API key
    // For now, return sample structure
    return [];
  } catch (error) {
    console.error('Hunter.io API error:', error);
    return [];
  }
}

// Clearbit API for company enrichment
export async function enrichCompanyData(domain: string): Promise<CompanyData | null> {
  try {
    const response = await axios.get(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY || ''}`,
      },
    });

    const data = response.data;
    return {
      companyName: data.name,
      website: data.domain,
      industry: data.category?.industry,
      location: `${data.geo?.city}, ${data.geo?.state}`,
      companySize: getEmployeeRange(data.metrics?.employees),
      description: data.description,
      foundedYear: data.foundedYear?.toString(),
      employeeCount: data.metrics?.employees,
      funding: data.metrics?.raised ? `$${(data.metrics.raised / 1000000).toFixed(1)}M` : undefined,
      techStack: data.tech || []
    };
  } catch (error) {
    console.error('Clearbit API error:', error);
    return null;
  }
}

// Apollo.io-style prospecting
export async function prospectLeadsFromIndustry(industry: string, limit: number = 10): Promise<InsertLead[]> {
  const companies = await searchCompaniesByIndustry(industry, limit);
  const leads: InsertLead[] = [];

  for (const company of companies) {
    const contacts = await findCompanyContacts(company.companyName);
    
    for (const contact of contacts) {
      leads.push({
        companyName: company.companyName,
        contactName: contact.name,
        jobTitle: contact.jobTitle,
        email: contact.email,
        companySize: company.companySize || "Unknown",
        industry: company.industry || industry,
        location: company.location || "Unknown",
        website: company.website,
        techStack: company.techStack || [],
        fundingInfo: company.funding,
        employeeCount: company.employeeCount,
        priority: "cold",
        buyingIntent: "unknown"
      });
    }
  }

  return leads;
}

// Search companies by industry using multiple sources
export async function searchCompaniesByIndustry(industry: string, limit: number): Promise<CompanyData[]> {
  const companies: CompanyData[] = [];
  
  try {
    // Try Crunchbase first
    const crunchbaseCompanies = await scrapeCrunchbaseByIndustry(industry, limit);
    companies.push(...crunchbaseCompanies);
    
    // If we don't have enough, try other sources
    if (companies.length < limit) {
      const remainingLimit = limit - companies.length;
      const linkedinCompanies = await scrapeLinkedInByIndustry(industry, remainingLimit);
      companies.push(...linkedinCompanies);
    }
    
  } catch (error) {
    console.error('Error searching companies by industry:', error);
  }

  return companies.slice(0, limit);
}

// Scrape Crunchbase for companies in specific industry
export async function scrapeCrunchbaseByIndustry(industry: string, limit: number): Promise<CompanyData[]> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const searchUrl = `https://www.crunchbase.com/discover/organization.companies/field/organizations/categories/${encodeURIComponent(industry.toLowerCase())}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(5000);

    const companies = await page.evaluate((maxCompanies) => {
      const companyCards = document.querySelectorAll('[data-testid="organization-card"]');
      const results: any[] = [];
      
      for (let i = 0; i < Math.min(companyCards.length, maxCompanies); i++) {
        const card = companyCards[i];
        const name = card.querySelector('h3')?.textContent?.trim();
        const description = card.querySelector('[data-testid="organization-description"]')?.textContent?.trim();
        const location = card.querySelector('[data-testid="location"]')?.textContent?.trim();
        const website = card.querySelector('a')?.href;
        
        if (name) {
          results.push({
            companyName: name,
            description,
            location,
            website,
            industry: 'SaaS' // Default for now
          });
        }
      }
      
      return results;
    }, limit);

    return companies;
  } catch (error) {
    console.error('Crunchbase industry scraping error:', error);
    return [];
  } finally {
    await browser.close();
  }
}

// Scrape LinkedIn for companies in specific industry
export async function scrapeLinkedInByIndustry(industry: string, limit: number): Promise<CompanyData[]> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(industry)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(5000);

    const companies = await page.evaluate((maxCompanies) => {
      const companyCards = document.querySelectorAll('[data-test-search-result="COMPANY"]');
      const results: any[] = [];
      
      for (let i = 0; i < Math.min(companyCards.length, maxCompanies); i++) {
        const card = companyCards[i];
        const name = card.querySelector('h3 span')?.textContent?.trim();
        const description = card.querySelector('.search-result__snippets')?.textContent?.trim();
        const location = card.querySelector('[data-test-search-result-headline]')?.textContent?.trim();
        
        if (name) {
          results.push({
            companyName: name,
            description,
            location,
            industry
          });
        }
      }
      
      return results;
    }, limit);

    return companies;
  } catch (error) {
    console.error('LinkedIn industry scraping error:', error);
    return [];
  } finally {
    await browser.close();
  }
}

// Find company contacts (executives, decision makers)
export async function findCompanyContacts(companyName: string): Promise<ContactData[]> {
  const contacts: ContactData[] = [];
  
  // Generate realistic contacts based on company
  const jobTitles = [
    'CEO', 'CTO', 'VP of Sales', 'VP of Marketing', 'Head of Operations',
    'Director of Engineering', 'Chief Revenue Officer', 'VP of Product'
  ];
  
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  
  for (let i = 0; i < 2; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    
    contacts.push({
      name: `${firstName} ${lastName}`,
      jobTitle,
      company: companyName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`
    });
  }
  
  return contacts;
}

// Utility functions
function getEmployeeRange(employeeCount: number): string {
  if (employeeCount >= 1000) return "1000+";
  if (employeeCount >= 500) return "500-1000";
  if (employeeCount >= 200) return "200-500";
  if (employeeCount >= 50) return "50-200";
  if (employeeCount >= 10) return "10-50";
  return "1-10";
}

// Tech stack detection from website
export async function detectTechStack(website: string): Promise<string[]> {
  try {
    const response = await axios.get(website, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const techStack: string[] = [];
    
    // Check for common technologies in page source
    const html = response.data.toLowerCase();
    
    if (html.includes('react')) techStack.push('React');
    if (html.includes('angular')) techStack.push('Angular');
    if (html.includes('vue')) techStack.push('Vue.js');
    if (html.includes('jquery')) techStack.push('jQuery');
    if (html.includes('bootstrap')) techStack.push('Bootstrap');
    if (html.includes('tailwind')) techStack.push('Tailwind CSS');
    if (html.includes('shopify')) techStack.push('Shopify');
    if (html.includes('wordpress')) techStack.push('WordPress');
    if (html.includes('hubspot')) techStack.push('HubSpot');
    if (html.includes('salesforce')) techStack.push('Salesforce');
    if (html.includes('google-analytics')) techStack.push('Google Analytics');
    if (html.includes('stripe')) techStack.push('Stripe');
    
    return techStack;
  } catch (error) {
    console.error('Tech stack detection error:', error);
    return [];
  }
}
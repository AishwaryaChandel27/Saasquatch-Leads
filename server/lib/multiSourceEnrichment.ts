import { Lead } from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";

export interface LinkedInCompanyData {
  name: string;
  industry: string;
  companySize: string;
  headquarters: string;
  founded: number;
  specialties: string[];
  followers: number;
  employeeCount: number;
  companyType: string;
  website: string;
  description: string;
}

export interface CrunchbaseCompanyData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  foundedOn: string;
  companyType: string;
  status: string;
  categories: string[];
  operatingStatus: string;
  fundingTotal: string;
  fundingRounds: number;
  lastFundingType: string;
  lastFundingDate: string;
  investors: string[];
  headquarters: string;
  employeeCount: string;
  website: string;
  stockSymbol?: string;
}

export interface GitHubCompanyData {
  login: string;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
  techStack: string[];
  programmingLanguages: string[];
  repositories: {
    name: string;
    language: string;
    stars: number;
    forks: number;
    description: string;
  }[];
}

export interface GoogleCompanyData {
  name: string;
  description: string;
  website: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  businessHours: string[];
  businessType: string;
  categories: string[];
  socialProfiles: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  news: {
    title: string;
    source: string;
    date: string;
    url: string;
  }[];
}

export interface EnrichedCompanyData {
  linkedin?: LinkedInCompanyData;
  crunchbase?: CrunchbaseCompanyData;
  github?: GitHubCompanyData;
  google?: GoogleCompanyData;
  enrichmentScore: number;
  dataQuality: 'high' | 'medium' | 'low';
  sourceReliability: {
    linkedin: number;
    crunchbase: number;
    github: number;
    google: number;
  };
  lastUpdated: string;
}

export async function enrichCompanyFromMultipleSources(
  companyName: string,
  domain?: string
): Promise<EnrichedCompanyData> {
  console.log(`Starting multi-source enrichment for: ${companyName}`);
  
  const enrichmentResults: Partial<EnrichedCompanyData> = {
    sourceReliability: { linkedin: 0, crunchbase: 0, github: 0, google: 0 },
    lastUpdated: new Date().toISOString()
  };

  // Parallel enrichment from all sources
  const [linkedinData, crunchbaseData, githubData, googleData] = await Promise.allSettled([
    enrichFromLinkedIn(companyName, domain),
    enrichFromCrunchbase(companyName),
    enrichFromGitHub(companyName, domain),
    enrichFromGoogle(companyName)
  ]);

  // Process LinkedIn data
  if (linkedinData.status === 'fulfilled' && linkedinData.value) {
    enrichmentResults.linkedin = linkedinData.value;
    enrichmentResults.sourceReliability!.linkedin = 0.9;
  }

  // Process Crunchbase data
  if (crunchbaseData.status === 'fulfilled' && crunchbaseData.value) {
    enrichmentResults.crunchbase = crunchbaseData.value;
    enrichmentResults.sourceReliability!.crunchbase = 0.95;
  }

  // Process GitHub data
  if (githubData.status === 'fulfilled' && githubData.value) {
    enrichmentResults.github = githubData.value;
    enrichmentResults.sourceReliability!.github = 0.8;
  }

  // Process Google data
  if (googleData.status === 'fulfilled' && googleData.value) {
    enrichmentResults.google = googleData.value;
    enrichmentResults.sourceReliability!.google = 0.7;
  }

  // Calculate enrichment score and data quality
  const { enrichmentScore, dataQuality } = calculateEnrichmentMetrics(enrichmentResults);
  enrichmentResults.enrichmentScore = enrichmentScore;
  enrichmentResults.dataQuality = dataQuality;

  return enrichmentResults as EnrichedCompanyData;
}

async function enrichFromLinkedIn(companyName: string, domain?: string): Promise<LinkedInCompanyData | null> {
  try {
    // In a real implementation, you would use LinkedIn API or authorized scraping
    // For demonstration, we'll simulate the structure
    const searchQuery = domain ? `site:linkedin.com/company ${domain}` : `site:linkedin.com/company "${companyName}"`;
    
    // Simulated LinkedIn company data structure
    const mockLinkedInData: LinkedInCompanyData = {
      name: companyName,
      industry: "Technology",
      companySize: "1000+",
      headquarters: "San Francisco, CA",
      founded: 2010,
      specialties: ["Software Development", "AI", "Machine Learning"],
      followers: 50000,
      employeeCount: 1500,
      companyType: "Private Company",
      website: domain || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      description: `${companyName} is a leading technology company focused on innovation.`
    };

    return mockLinkedInData;
  } catch (error) {
    console.error(`LinkedIn enrichment failed for ${companyName}:`, error);
    return null;
  }
}

async function enrichFromCrunchbase(companyName: string): Promise<CrunchbaseCompanyData | null> {
  try {
    // In a real implementation, you would use Crunchbase API
    // For demonstration, we'll simulate the structure
    const mockCrunchbaseData: CrunchbaseCompanyData = {
      name: companyName,
      shortDescription: `${companyName} develops innovative technology solutions.`,
      fullDescription: `${companyName} is a technology company that provides cutting-edge solutions for modern businesses.`,
      foundedOn: "2010-01-01",
      companyType: "For Profit",
      status: "Operating",
      categories: ["Software", "Technology", "Enterprise Software"],
      operatingStatus: "Active",
      fundingTotal: "$50M",
      fundingRounds: 3,
      lastFundingType: "Series B",
      lastFundingDate: "2023-06-15",
      investors: ["Sequoia Capital", "Andreessen Horowitz", "Index Ventures"],
      headquarters: "San Francisco, California, United States",
      employeeCount: "501-1000",
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`
    };

    return mockCrunchbaseData;
  } catch (error) {
    console.error(`Crunchbase enrichment failed for ${companyName}:`, error);
    return null;
  }
}

async function enrichFromGitHub(companyName: string, domain?: string): Promise<GitHubCompanyData | null> {
  try {
    const orgName = companyName.toLowerCase().replace(/\s+/g, '-');
    
    // In a real implementation, you would use GitHub API
    const mockGitHubData: GitHubCompanyData = {
      login: orgName,
      name: companyName,
      company: companyName,
      blog: domain || `https://${orgName}.com`,
      location: "San Francisco, CA",
      email: `contact@${orgName}.com`,
      bio: `Official GitHub organization for ${companyName}`,
      publicRepos: 45,
      followers: 1200,
      following: 15,
      createdAt: "2015-03-10T10:00:00Z",
      updatedAt: new Date().toISOString(),
      techStack: ["TypeScript", "Python", "Go", "React", "Node.js"],
      programmingLanguages: ["JavaScript", "TypeScript", "Python", "Go", "Java"],
      repositories: [
        {
          name: `${orgName}-api`,
          language: "TypeScript",
          stars: 234,
          forks: 45,
          description: "Main API service"
        },
        {
          name: `${orgName}-frontend`,
          language: "React",
          stars: 156,
          forks: 23,
          description: "Frontend application"
        }
      ]
    };

    return mockGitHubData;
  } catch (error) {
    console.error(`GitHub enrichment failed for ${companyName}:`, error);
    return null;
  }
}

async function enrichFromGoogle(companyName: string): Promise<GoogleCompanyData | null> {
  try {
    // In a real implementation, you would use Google My Business API or Google Search API
    const mockGoogleData: GoogleCompanyData = {
      name: companyName,
      description: `${companyName} is a leading technology company providing innovative solutions.`,
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      address: "123 Tech Street, San Francisco, CA 94105",
      phone: "+1-555-123-4567",
      rating: 4.5,
      reviewCount: 128,
      businessHours: [
        "Monday: 9:00 AM – 6:00 PM",
        "Tuesday: 9:00 AM – 6:00 PM",
        "Wednesday: 9:00 AM – 6:00 PM",
        "Thursday: 9:00 AM – 6:00 PM",
        "Friday: 9:00 AM – 6:00 PM",
        "Saturday: Closed",
        "Sunday: Closed"
      ],
      businessType: "Technology Company",
      categories: ["Software Company", "Technology", "Business Services"],
      socialProfiles: {
        linkedin: `https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}`,
        twitter: `https://twitter.com/${companyName.toLowerCase().replace(/\s+/g, '')}`,
        facebook: `https://facebook.com/${companyName.toLowerCase().replace(/\s+/g, '')}`
      },
      news: [
        {
          title: `${companyName} Announces New Product Launch`,
          source: "TechCrunch",
          date: "2024-01-15",
          url: "https://techcrunch.com/example"
        },
        {
          title: `${companyName} Raises Series B Funding`,
          source: "VentureBeat",
          date: "2023-12-10",
          url: "https://venturebeat.com/example"
        }
      ]
    };

    return mockGoogleData;
  } catch (error) {
    console.error(`Google enrichment failed for ${companyName}:`, error);
    return null;
  }
}

function calculateEnrichmentMetrics(data: Partial<EnrichedCompanyData>): {
  enrichmentScore: number;
  dataQuality: 'high' | 'medium' | 'low';
} {
  const sources = ['linkedin', 'crunchbase', 'github', 'google'] as const;
  const availableSources = sources.filter(source => data[source]);
  const sourceCount = availableSources.length;
  
  // Calculate weighted score based on source reliability
  let totalScore = 0;
  let totalWeight = 0;
  
  availableSources.forEach(source => {
    const reliability = data.sourceReliability?.[source] || 0;
    totalScore += reliability;
    totalWeight += 1;
  });
  
  const enrichmentScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  
  let dataQuality: 'high' | 'medium' | 'low';
  if (sourceCount >= 3 && enrichmentScore >= 80) {
    dataQuality = 'high';
  } else if (sourceCount >= 2 && enrichmentScore >= 60) {
    dataQuality = 'medium';
  } else {
    dataQuality = 'low';
  }
  
  return { enrichmentScore, dataQuality };
}

export function determineCompanyType(enrichedData: EnrichedCompanyData): string {
  // Determine company type based on multiple sources
  const { linkedin, crunchbase, github } = enrichedData;
  
  // Check for public company indicators
  if (crunchbase?.stockSymbol || 
      linkedin?.companyType?.toLowerCase().includes('public') ||
      crunchbase?.status === 'Public') {
    return 'public';
  }
  
  // Check for unicorn status (valuation > $1B)
  if (crunchbase?.fundingTotal) {
    const fundingAmount = parseFundingAmount(crunchbase.fundingTotal);
    if (fundingAmount >= 1000000000) {
      return 'unicorn';
    }
  }
  
  // Check for startup indicators
  if (crunchbase?.lastFundingType?.includes('Series') ||
      crunchbase?.lastFundingType?.includes('Seed') ||
      (linkedin?.founded && linkedin.founded > 2015)) {
    return 'startup';
  }
  
  // Check for enterprise/MNC indicators
  if ((linkedin?.employeeCount && linkedin.employeeCount > 10000) ||
      linkedin?.companySize === '10,000+' ||
      crunchbase?.employeeCount === '10,001+') {
    return 'mnc';
  }
  
  if ((linkedin?.employeeCount && linkedin.employeeCount > 1000) ||
      linkedin?.companySize === '1000+' ||
      crunchbase?.employeeCount?.includes('1001-')) {
    return 'enterprise';
  }
  
  // Default to startup for newer companies
  return 'startup';
}

function parseFundingAmount(fundingString: string): number {
  const cleanString = fundingString.replace(/[$,\s]/g, '').toLowerCase();
  let multiplier = 1;
  
  if (cleanString.includes('b')) {
    multiplier = 1000000000;
  } else if (cleanString.includes('m')) {
    multiplier = 1000000;
  } else if (cleanString.includes('k')) {
    multiplier = 1000;
  }
  
  const number = parseFloat(cleanString.replace(/[^0-9.]/g, ''));
  return number * multiplier;
}

export async function batchEnrichCompanies(leads: Lead[]): Promise<Map<number, EnrichedCompanyData>> {
  const enrichmentMap = new Map<number, EnrichedCompanyData>();
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (lead) => {
      try {
        const enrichedData = await enrichCompanyFromMultipleSources(
          lead.companyName,
          lead.website || undefined
        );
        return { leadId: lead.id, data: enrichedData };
      } catch (error) {
        console.error(`Failed to enrich company ${lead.companyName}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        enrichmentMap.set(result.value.leadId, result.value.data);
      }
    });
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < leads.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return enrichmentMap;
}
import axios from 'axios';

// Clearbit Company API integration for comprehensive company data
export interface ClearbitCompanyData {
  name: string;
  domain: string;
  category: {
    industry: string;
    sector: string;
    industryGroup: string;
  };
  description: string;
  foundedYear: number;
  location: string;
  timeZone: string;
  utcOffset: number;
  geo: {
    streetNumber: string;
    streetName: string;
    subPremise: string;
    city: string;
    postalCode: string;
    state: string;
    stateCode: string;
    country: string;
    countryCode: string;
    lat: number;
    lng: number;
  };
  logo: string;
  facebook: {
    handle: string;
    likes: number;
  };
  linkedin: {
    handle: string;
  };
  twitter: {
    handle: string;
    id: string;
    bio: string;
    followers: number;
    following: number;
    location: string;
    site: string;
    avatar: string;
  };
  crunchbase: {
    handle: string;
  };
  emailProvider: boolean;
  type: string;
  ticker: string;
  identifiers: {
    usEIN: string;
  };
  phone: string;
  metrics: {
    alexaUsRank: number;
    alexaGlobalRank: number;
    employees: number;
    employeesRange: string;
    marketCap: number;
    raised: number;
    annualRevenue: number;
  };
  indexedAt: string;
  tech: string[];
  techCategories: string[];
  parent: {
    domain: string;
  };
  ultimateParent: {
    domain: string;
  };
}

export async function enrichCompanyWithClearbit(companyName: string): Promise<ClearbitCompanyData | null> {
  try {
    // First, try to find the company by name using domain lookup
    const domain = await findCompanyDomain(companyName);
    if (!domain) {
      console.log(`No domain found for company: ${companyName}`);
      return null;
    }

    // Use Clearbit's Company API to get comprehensive data
    const response = await axios.get(`https://company.clearbit.com/v2/companies/find`, {
      params: {
        domain: domain
      },
      headers: {
        'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data) {
      console.log(`Clearbit enrichment successful for ${companyName}`);
      return response.data;
    }

    return null;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log(`Company not found in Clearbit: ${companyName}`);
      } else if (error.response?.status === 401) {
        console.error('Clearbit API authentication failed');
      } else if (error.response?.status === 402) {
        console.error('Clearbit API quota exceeded');
      } else {
        console.error(`Clearbit API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
    } else {
      console.error(`Clearbit enrichment error for ${companyName}:`, error);
    }
    return null;
  }
}

async function findCompanyDomain(companyName: string): Promise<string | null> {
  // Try common domain patterns first
  const commonDomains = [
    `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    `${companyName.toLowerCase().replace(/\s+/g, '')}.io`,
    `${companyName.toLowerCase().replace(/\s+/g, '')}.app`,
    `${companyName.toLowerCase().replace(/\s+/g, '')}.co`,
  ];

  // Known company domains for popular tech companies
  const knownDomains: Record<string, string> = {
    'vercel': 'vercel.com',
    'supabase': 'supabase.com',
    'planetscale': 'planetscale.com',
    'railway': 'railway.app',
    'linear': 'linear.app',
    'stripe': 'stripe.com',
    'airbnb': 'airbnb.com',
    'doordash': 'doordash.com',
    'github': 'github.com',
    'microsoft': 'microsoft.com',
    'google': 'google.com',
    'apple': 'apple.com',
    'amazon': 'amazon.com',
    'facebook': 'facebook.com',
    'meta': 'meta.com',
    'netflix': 'netflix.com',
    'shopify': 'shopify.com',
    'salesforce': 'salesforce.com',
    'slack': 'slack.com',
    'zoom': 'zoom.us',
    'figma': 'figma.com',
    'notion': 'notion.so',
    'discord': 'discord.com',
    'spotify': 'spotify.com',
    'uber': 'uber.com',
    'lyft': 'lyft.com',
    'twitter': 'twitter.com',
    'x': 'x.com',
    'instagram': 'instagram.com',
    'whatsapp': 'whatsapp.com',
    'linkedin': 'linkedin.com',
    'youtube': 'youtube.com',
    'dropbox': 'dropbox.com',
    'adobe': 'adobe.com',
    'oracle': 'oracle.com',
    'ibm': 'ibm.com',
    'intel': 'intel.com',
    'nvidia': 'nvidia.com',
    'amd': 'amd.com',
    'tesla': 'tesla.com',
    'spacex': 'spacex.com'
  };

  const normalizedName = companyName.toLowerCase().trim();
  
  // Check known domains first
  if (knownDomains[normalizedName]) {
    return knownDomains[normalizedName];
  }

  // Try common patterns
  for (const domain of commonDomains) {
    try {
      const response = await axios.head(`https://${domain}`, { timeout: 5000 });
      if (response.status === 200) {
        return domain;
      }
    } catch (error) {
      // Continue to next domain
    }
  }

  return null;
}

export function calculateClearbitScore(data: ClearbitCompanyData): number {
  let score = 0;
  const maxScore = 100;

  // Company size scoring (30 points)
  if (data.metrics?.employees) {
    if (data.metrics.employees >= 1000) score += 30;
    else if (data.metrics.employees >= 500) score += 25;
    else if (data.metrics.employees >= 100) score += 20;
    else if (data.metrics.employees >= 50) score += 15;
    else if (data.metrics.employees >= 10) score += 10;
    else score += 5;
  }

  // Industry value scoring (25 points)
  const highValueIndustries = ['software', 'technology', 'saas', 'fintech', 'cybersecurity', 'ai', 'machine learning'];
  const industry = data.category?.industry?.toLowerCase() || '';
  const sector = data.category?.sector?.toLowerCase() || '';
  
  if (highValueIndustries.some(term => industry.includes(term) || sector.includes(term))) {
    score += 25;
  } else if (['healthcare', 'financial', 'education'].some(term => industry.includes(term))) {
    score += 20;
  } else {
    score += 10;
  }

  // Funding/Revenue scoring (20 points)
  if (data.metrics?.raised && data.metrics.raised > 0) {
    if (data.metrics.raised >= 100000000) score += 20; // $100M+
    else if (data.metrics.raised >= 50000000) score += 18; // $50M+
    else if (data.metrics.raised >= 10000000) score += 15; // $10M+
    else if (data.metrics.raised >= 1000000) score += 12; // $1M+
    else score += 8;
  } else if (data.metrics?.annualRevenue && data.metrics.annualRevenue > 0) {
    if (data.metrics.annualRevenue >= 100000000) score += 20;
    else if (data.metrics.annualRevenue >= 50000000) score += 18;
    else if (data.metrics.annualRevenue >= 10000000) score += 15;
    else score += 10;
  }

  // Tech stack sophistication (15 points)
  if (data.tech && data.tech.length > 0) {
    const modernTech = ['react', 'angular', 'vue', 'node.js', 'python', 'go', 'rust', 'kubernetes', 'docker', 'aws', 'azure', 'gcp'];
    const techMatch = data.tech.filter(tech => 
      modernTech.some(modern => tech.toLowerCase().includes(modern))
    ).length;
    
    if (techMatch >= 5) score += 15;
    else if (techMatch >= 3) score += 12;
    else if (techMatch >= 1) score += 8;
    else score += 3;
  }

  // Online presence scoring (10 points)
  let presenceScore = 0;
  if (data.linkedin?.handle) presenceScore += 3;
  if (data.twitter?.handle) presenceScore += 2;
  if (data.facebook?.handle) presenceScore += 2;
  if (data.crunchbase?.handle) presenceScore += 3;
  score += Math.min(presenceScore, 10);

  return Math.min(Math.round(score), maxScore);
}

export function categorizeClearbitPriority(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'warm';
  return 'cold';
}
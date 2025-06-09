import { google } from 'googleapis';

const customsearch = google.customsearch('v1');

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface CompanySearchData {
  basicInfo: {
    name: string;
    website: string;
    description: string;
    industry: string;
  };
  news: Array<{
    title: string;
    link: string;
    snippet: string;
    date?: string;
  }>;
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  fundingInfo: string[];
  techInfo: string[];
}

export async function searchCompanyInfo(companyName: string): Promise<CompanySearchData> {
  const searchData: CompanySearchData = {
    basicInfo: {
      name: companyName,
      website: '',
      description: '',
      industry: ''
    },
    news: [],
    socialMedia: {},
    fundingInfo: [],
    techInfo: []
  };

  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    console.log(`Google Search API not configured. Please provide GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID`);
    return searchData;
  }

  try {
    // Basic company info search
    const basicQuery = `${companyName} company official website`;
    const basicResults = await performGoogleSearch(basicQuery);
    
    if (basicResults.length > 0) {
      const mainResult = basicResults[0];
      searchData.basicInfo.website = mainResult.displayLink;
      searchData.basicInfo.description = mainResult.snippet;
    }

    // News search
    const newsQuery = `${companyName} funding news recent`;
    const newsResults = await performGoogleSearch(newsQuery);
    searchData.news = newsResults.slice(0, 5).map(result => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet
    }));

    // Social media search
    const linkedinQuery = `${companyName} site:linkedin.com/company`;
    const linkedinResults = await performGoogleSearch(linkedinQuery);
    if (linkedinResults.length > 0) {
      searchData.socialMedia.linkedin = linkedinResults[0].link;
    }

    // Funding information
    const fundingQuery = `${companyName} funding series investment`;
    const fundingResults = await performGoogleSearch(fundingQuery);
    searchData.fundingInfo = fundingResults.slice(0, 3).map(r => r.snippet);

    // Technology stack
    const techQuery = `${companyName} technology stack engineering`;
    const techResults = await performGoogleSearch(techQuery);
    searchData.techInfo = techResults.slice(0, 3).map(r => r.snippet);

  } catch (error) {
    console.error('Google Search failed:', error);
  }

  return searchData;
}

async function performGoogleSearch(query: string): Promise<GoogleSearchResult[]> {
  try {
    const response = await customsearch.cse.list({
      auth: process.env.GOOGLE_API_KEY,
      cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
      q: query,
      num: 5
    });

    return (response.data.items || []).map(item => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink || ''
    }));
  } catch (error) {
    console.error('Google Custom Search API error:', error);
    return [];
  }
}

export async function fetchGoogleSearchResults(query: string): Promise<{
  items: GoogleSearchResult[];
  searchInformation: any;
}> {
  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    return { items: [], searchInformation: null };
  }

  try {
    const results = await performGoogleSearch(query);
    return {
      items: results,
      searchInformation: { totalResults: results.length }
    };
  } catch (error) {
    console.error('Google search failed:', error);
    return { items: [], searchInformation: null };
  }
}

export function extractCompanyInfoFromSearchResults(results: GoogleSearchResult[], companyName: string) {
  const companyInfo = {
    website: '',
    description: '',
    industry: '',
    location: '',
    employees: '',
    founded: ''
  };

  for (const result of results) {
    const snippet = result.snippet.toLowerCase();
    const title = result.title.toLowerCase();

    // Extract website
    if (!companyInfo.website && result.displayLink) {
      companyInfo.website = `https://${result.displayLink}`;
    }

    // Extract description
    if (!companyInfo.description && snippet.includes(companyName.toLowerCase())) {
      companyInfo.description = result.snippet;
    }

    // Extract industry keywords
    const industries = ['software', 'technology', 'fintech', 'saas', 'healthcare', 'e-commerce', 'ai', 'machine learning'];
    for (const industry of industries) {
      if (snippet.includes(industry) || title.includes(industry)) {
        companyInfo.industry = industry;
        break;
      }
    }

    // Extract location
    const locationPatterns = [/based in ([^,]+)/i, /headquartered in ([^,]+)/i, /located in ([^,]+)/i];
    for (const pattern of locationPatterns) {
      const match = result.snippet.match(pattern);
      if (match && !companyInfo.location) {
        companyInfo.location = match[1];
        break;
      }
    }

    // Extract employee count
    const employeeMatch = result.snippet.match(/(\d+[\+\-\d\s]*) employees?/i);
    if (employeeMatch && !companyInfo.employees) {
      companyInfo.employees = employeeMatch[1];
    }

    // Extract founding year
    const foundedMatch = result.snippet.match(/founded in (\d{4})/i);
    if (foundedMatch && !companyInfo.founded) {
      companyInfo.founded = foundedMatch[1];
    }
  }

  return companyInfo;
}
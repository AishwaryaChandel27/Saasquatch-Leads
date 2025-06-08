import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface RealWorldCompanyData {
  basicInfo: {
    companyName: string;
    domain: string;
    description: string;
    website: string;
    headquarters: string;
    foundedYear: string;
    logo: string;
  };
  socialPresence: {
    linkedin: string;
    twitter: string;
    github: string;
    facebook: string;
  };
  businessMetrics: {
    employeeCount: number;
    industry: string;
    revenue: string;
    funding: string;
    techStack: string[];
  };
  newsAndEvents: {
    recentNews: string[];
    pressReleases: string[];
    jobPostings: number;
  };
}

// Google Search API simulation using web scraping
export async function searchGoogleForCompany(companyName: string): Promise<Partial<RealWorldCompanyData>> {
  try {
    const searchQuery = encodeURIComponent(`${companyName} company information headquarters founded`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    // In a real implementation, you would use Google Custom Search API
    // For now, we'll extract what we can from basic web search
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google search failed: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract basic information from search results
    const searchResults = $('.g').map((i, el) => {
      const title = $(el).find('h3').text();
      const snippet = $(el).find('.VwiC3b').text();
      return { title, snippet };
    }).get();
    
    return extractCompanyInfoFromSearch(searchResults, companyName);
  } catch (error) {
    console.error('Google search error:', error);
    return { basicInfo: { companyName, domain: '', description: '', website: '', headquarters: '', foundedYear: '', logo: '' } };
  }
}

// GitHub data extraction
export async function getGitHubData(companyName: string): Promise<{ repositories: string[], techStack: string[], activity: string }> {
  try {
    // Search for company GitHub organization
    const searchUrl = `https://api.github.com/search/users?q=${encodeURIComponent(companyName)}+type:org`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Lead-Generator-App'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    if (data.items && data.items.length > 0) {
      const org = data.items[0];
      
      // Get repositories
      const reposResponse = await fetch(`https://api.github.com/users/${org.login}/repos?sort=updated&per_page=10`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Lead-Generator-App'
        }
      });
      
      if (reposResponse.ok) {
        const repos = await reposResponse.json() as any[];
        const repositories = repos.map(repo => repo.name);
        const techStack = extractTechStackFromRepos(repos);
        
        return {
          repositories,
          techStack,
          activity: `${repos.length} public repositories, last updated ${repos[0]?.updated_at || 'unknown'}`
        };
      }
    }
    
    return { repositories: [], techStack: [], activity: 'No GitHub presence found' };
  } catch (error) {
    console.error('GitHub data error:', error);
    return { repositories: [], techStack: [], activity: 'GitHub data unavailable' };
  }
}

// LinkedIn company data (basic web scraping)
export async function getLinkedInCompanyData(companyName: string): Promise<{ employeeCount: number, industry: string, description: string }> {
  try {
    // LinkedIn requires special handling due to anti-scraping measures
    // In production, you'd use LinkedIn API or specialized services
    
    const searchQuery = encodeURIComponent(`${companyName} site:linkedin.com/company`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract LinkedIn company page URL from search results
      const linkedinUrl = $('a[href*="linkedin.com/company"]').first().attr('href');
      
      if (linkedinUrl) {
        // Basic company info extraction from search snippets
        const snippet = $('.g').first().find('.VwiC3b').text();
        return parseLinkedInSnippet(snippet);
      }
    }
    
    return { employeeCount: 0, industry: 'Unknown', description: 'No LinkedIn data available' };
  } catch (error) {
    console.error('LinkedIn data error:', error);
    return { employeeCount: 0, industry: 'Unknown', description: 'LinkedIn data unavailable' };
  }
}

// Crunchbase data simulation
export async function getCrunchbaseData(companyName: string): Promise<{ funding: string, investors: string[], valuation: string }> {
  try {
    // Search for Crunchbase information
    const searchQuery = encodeURIComponent(`${companyName} site:crunchbase.com`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract funding information from search snippets
      const snippets = $('.g .VwiC3b').map((i, el) => $(el).text()).get();
      return extractFundingInfo(snippets);
    }
    
    return { funding: 'No funding data', investors: [], valuation: 'Unknown' };
  } catch (error) {
    console.error('Crunchbase data error:', error);
    return { funding: 'Funding data unavailable', investors: [], valuation: 'Unknown' };
  }
}

// News feed aggregation
export async function getCompanyNews(companyName: string): Promise<{ recentNews: string[], sentiment: string }> {
  try {
    const searchQuery = encodeURIComponent(`${companyName} news recent`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=nws`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const newsItems = $('.g').map((i, el) => {
        const title = $(el).find('h3').text();
        const source = $(el).find('.source').text();
        const date = $(el).find('.date').text();
        return `${title} - ${source} ${date}`.trim();
      }).get().slice(0, 5);
      
      const sentiment = analyzeSentiment(newsItems);
      
      return { recentNews: newsItems, sentiment };
    }
    
    return { recentNews: [], sentiment: 'neutral' };
  } catch (error) {
    console.error('News data error:', error);
    return { recentNews: [], sentiment: 'neutral' };
  }
}

// Comprehensive data aggregation
export async function aggregateRealWorldData(companyName: string, domain?: string): Promise<RealWorldCompanyData> {
  try {
    const [googleData, githubData, linkedinData, crunchbaseData, newsData] = await Promise.allSettled([
      searchGoogleForCompany(companyName),
      getGitHubData(companyName),
      getLinkedInCompanyData(companyName),
      getCrunchbaseData(companyName),
      getCompanyNews(companyName)
    ]);

    const google = googleData.status === 'fulfilled' ? googleData.value : {};
    const github = githubData.status === 'fulfilled' ? githubData.value : { repositories: [], techStack: [], activity: '' };
    const linkedin = linkedinData.status === 'fulfilled' ? linkedinData.value : { employeeCount: 0, industry: 'Unknown', description: '' };
    const crunchbase = crunchbaseData.status === 'fulfilled' ? crunchbaseData.value : { funding: '', investors: [], valuation: '' };
    const news = newsData.status === 'fulfilled' ? newsData.value : { recentNews: [], sentiment: 'neutral' };

    return {
      basicInfo: {
        companyName,
        domain: domain || google.basicInfo?.domain || '',
        description: linkedin.description || google.basicInfo?.description || '',
        website: domain || google.basicInfo?.website || '',
        headquarters: google.basicInfo?.headquarters || 'Unknown',
        foundedYear: google.basicInfo?.foundedYear || 'Unknown',
        logo: google.basicInfo?.logo || ''
      },
      socialPresence: {
        linkedin: `https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}`,
        twitter: '',
        github: github.repositories.length > 0 ? `https://github.com/${companyName}` : '',
        facebook: ''
      },
      businessMetrics: {
        employeeCount: linkedin.employeeCount,
        industry: linkedin.industry,
        revenue: crunchbase.valuation,
        funding: crunchbase.funding,
        techStack: github.techStack
      },
      newsAndEvents: {
        recentNews: news.recentNews,
        pressReleases: [],
        jobPostings: 0
      }
    };
  } catch (error) {
    console.error('Data aggregation error:', error);
    throw new Error(`Failed to aggregate data for ${companyName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions
function extractCompanyInfoFromSearch(searchResults: any[], companyName: string) {
  const info = {
    basicInfo: {
      companyName,
      domain: '',
      description: '',
      website: '',
      headquarters: '',
      foundedYear: '',
      logo: ''
    }
  };
  
  for (const result of searchResults) {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    
    // Extract founded year
    const yearMatch = text.match(/founded\s+(?:in\s+)?(\d{4})/);
    if (yearMatch && !info.basicInfo.foundedYear) {
      info.basicInfo.foundedYear = yearMatch[1];
    }
    
    // Extract headquarters
    const hqMatch = text.match(/(?:headquarters|based|located)\s+(?:in\s+)?([^,.\n]+)/);
    if (hqMatch && !info.basicInfo.headquarters) {
      info.basicInfo.headquarters = hqMatch[1].trim();
    }
    
    // Extract description
    if (!info.basicInfo.description && result.snippet.length > 50) {
      info.basicInfo.description = result.snippet;
    }
  }
  
  return info;
}

function extractTechStackFromRepos(repos: any[]): string[] {
  const languages = new Set<string>();
  
  repos.forEach(repo => {
    if (repo.language) {
      languages.add(repo.language);
    }
  });
  
  return Array.from(languages);
}

function parseLinkedInSnippet(snippet: string) {
  const employeeMatch = snippet.match(/(\d+(?:,\d+)*)\s+employees/i);
  const industryMatch = snippet.match(/industry[:\s]+([^.\n]+)/i);
  
  return {
    employeeCount: employeeMatch ? parseInt(employeeMatch[1].replace(/,/g, '')) : 0,
    industry: industryMatch ? industryMatch[1].trim() : 'Unknown',
    description: snippet
  };
}

function extractFundingInfo(snippets: string[]) {
  const fundingInfo = { funding: 'No funding data', investors: [] as string[], valuation: 'Unknown' };
  
  for (const snippet of snippets) {
    const text = snippet.toLowerCase();
    
    // Look for funding amounts
    const fundingMatch = text.match(/raised\s+\$([0-9.]+[bm]?)/i) || text.match(/funding\s+of\s+\$([0-9.]+[bm]?)/i);
    if (fundingMatch && fundingInfo.funding === 'No funding data') {
      fundingInfo.funding = `$${fundingMatch[1]}`;
    }
    
    // Look for valuation
    const valuationMatch = text.match(/valued\s+at\s+\$([0-9.]+[bm]?)/i) || text.match(/valuation\s+of\s+\$([0-9.]+[bm]?)/i);
    if (valuationMatch && fundingInfo.valuation === 'Unknown') {
      fundingInfo.valuation = `$${valuationMatch[1]}`;
    }
  }
  
  return fundingInfo;
}

function analyzeSentiment(newsItems: string[]): string {
  const positiveWords = ['growth', 'success', 'expansion', 'funding', 'partnership', 'innovation', 'launch'];
  const negativeWords = ['layoffs', 'decline', 'loss', 'controversy', 'lawsuit', 'bankruptcy', 'closure'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  newsItems.forEach(item => {
    const text = item.toLowerCase();
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}
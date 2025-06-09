import axios from 'axios';

const SERPAPI_KEY = process.env.SERPAPI_KEY!;

export async function fetchGoogleSearchResults(query: string): Promise<{
  domain: string;
  snippet: string;
  traffic: string;
  seo: string;
  trends: string;
}> {
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        api_key: SERPAPI_KEY,
        engine: 'google',
      }
    });

    const organic = response.data.organic_results?.[0];
    const domain = organic?.link?.split('/')[2] || 'Unknown';
    const snippet = organic?.snippet || 'No snippet found';
    
    // Fake data for now, can be fetched via SEMrush/Ahrefs APIs or inferred heuristically
    const traffic = "High"; // Placeholder for actual traffic metrics
    const seo = "Top 1%"; // Placeholder for SEO rank
    const trends = "Rising in interest"; // Could be replaced by Google Trends API

    return { domain, snippet, traffic, seo, trends };
  } catch (error) {
    console.error('Error fetching Google Search results:', error);
    return {
      domain: 'Unknown',
      snippet: 'No data found',
      traffic: 'Unknown',
      seo: 'Unknown',
      trends: 'Unknown'
    };
  }
}

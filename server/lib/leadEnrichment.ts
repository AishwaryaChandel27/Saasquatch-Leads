import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Lead } from "@shared/schema";

export interface EnrichmentSources {
  linkedin: LinkedInCompanyData | null;
  crunchbase: CrunchbaseData | null;
  news: NewsData | null;
  social: SocialPresence | null;
  financial: FinancialData | null;
}

export interface LinkedInCompanyData {
  companyName: string;
  industry: string;
  companySize: string;
  headquarters: string;
  founded: string;
  specialties: string[];
  about: string;
  website: string;
  employeeCount: number;
  followerCount: number;
  recentUpdates: string[];
}

export interface CrunchbaseData {
  companyName: string;
  shortDescription: string;
  categories: string[];
  foundedDate: string;
  operatingStatus: string;
  fundingStatus: string;
  totalFunding: number;
  lastFundingDate: string;
  lastFundingType: string;
  lastFundingAmount: number;
  investors: string[];
  acquisitions: string[];
  keyPeople: Array<{
    name: string;
    title: string;
    linkedinUrl?: string;
  }>;
}

export interface NewsData {
  recentNews: Array<{
    title: string;
    summary: string;
    date: string;
    source: string;
    url: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  pressReleases: string[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  growthSignals: string[];
  riskFactors: string[];
}

export interface SocialPresence {
  twitter: {
    handle: string;
    followers: number;
    recentTweets: string[];
    engagementRate: number;
  } | null;
  linkedin: {
    companyPage: string;
    followers: number;
    recentPosts: string[];
  } | null;
  github: {
    organization: string;
    repositories: number;
    stars: number;
    lastActivity: string;
  } | null;
}

export interface FinancialData {
  revenue: {
    estimated: number;
    year: number;
    source: string;
  } | null;
  valuation: {
    amount: number;
    date: string;
    source: string;
  } | null;
  employees: {
    current: number;
    growth: number;
    source: string;
  } | null;
  marketCap: number | null;
}

export async function enrichLeadData(lead: Lead): Promise<EnrichmentSources> {
  const results: EnrichmentSources = {
    linkedin: null,
    crunchbase: null,
    news: null,
    social: null,
    financial: null
  };

  // Run enrichment from multiple sources in parallel
  try {
    const [linkedin, crunchbase, news, social, financial] = await Promise.allSettled([
      enrichFromLinkedIn(lead.companyName, lead.website),
      enrichFromCrunchbase(lead.companyName),
      enrichFromNews(lead.companyName),
      enrichSocialPresence(lead.companyName, lead.website),
      enrichFinancialData(lead.companyName)
    ]);

    if (linkedin.status === 'fulfilled') results.linkedin = linkedin.value;
    if (crunchbase.status === 'fulfilled') results.crunchbase = crunchbase.value;
    if (news.status === 'fulfilled') results.news = news.value;
    if (social.status === 'fulfilled') results.social = social.value;
    if (financial.status === 'fulfilled') results.financial = financial.value;

  } catch (error) {
    console.error('Lead enrichment error:', error);
  }

  return results;
}

async function enrichFromLinkedIn(companyName: string, website?: string | null): Promise<LinkedInCompanyData | null> {
  try {
    // Use LinkedIn company search API or web scraping
    const searchUrl = `https://www.linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Extract company information from LinkedIn page
    const about = $('.break-words').first().text().trim();
    const industry = $('dd:contains("Industry")').next().text().trim();
    const size = $('dd:contains("Company size")').next().text().trim();
    const headquarters = $('dd:contains("Headquarters")').next().text().trim();
    const founded = $('dd:contains("Founded")').next().text().trim();
    
    // Extract specialties and recent updates
    const specialties = $('.specialties').text().split(',').map(s => s.trim()).filter(Boolean);
    const recentUpdates = $('.feed-shared-update-v2').slice(0, 5).map((_, el) => 
      $(el).find('.break-words').text().trim()
    ).get();

    return {
      companyName,
      industry: industry || 'Unknown',
      companySize: size || 'Unknown',
      headquarters: headquarters || 'Unknown',
      founded: founded || 'Unknown',
      specialties,
      about: about || '',
      website: website || '',
      employeeCount: extractEmployeeCount(size),
      followerCount: extractFollowerCount($),
      recentUpdates
    };

  } catch (error) {
    console.error('LinkedIn enrichment error:', error);
    return null;
  }
}

async function enrichFromCrunchbase(companyName: string): Promise<CrunchbaseData | null> {
  try {
    // Simulate Crunchbase API call or web scraping
    const searchUrl = `https://www.crunchbase.com/organization/${companyName.toLowerCase().replace(/\s+/g, '-')}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Extract Crunchbase data
    const shortDescription = $('.description').first().text().trim();
    const categories = $('.categories').text().split(',').map(c => c.trim()).filter(Boolean);
    const foundedDate = $('[data-label="Founded Date"]').text().trim();
    const operatingStatus = $('[data-label="Operating Status"]').text().trim();
    
    // Extract funding information
    const totalFunding = extractFundingAmount($('[data-label="Total Funding Amount"]').text());
    const lastFundingDate = $('[data-label="Last Funding Date"]').text().trim();
    const lastFundingType = $('[data-label="Last Funding Type"]').text().trim();
    const lastFundingAmount = extractFundingAmount($('[data-label="Last Funding Amount"]').text());
    
    // Extract investors and key people
    const investors = $('.investors .name').map((_, el) => $(el).text().trim()).get();
    const keyPeople = $('.key-people .person').map((_, el) => ({
      name: $(el).find('.name').text().trim(),
      title: $(el).find('.title').text().trim(),
      linkedinUrl: $(el).find('a[href*="linkedin"]').attr('href')
    })).get();

    return {
      companyName,
      shortDescription: shortDescription || '',
      categories,
      foundedDate: foundedDate || 'Unknown',
      operatingStatus: operatingStatus || 'Active',
      fundingStatus: lastFundingType || 'Unknown',
      totalFunding,
      lastFundingDate: lastFundingDate || 'Unknown',
      lastFundingType: lastFundingType || 'Unknown',
      lastFundingAmount,
      investors,
      acquisitions: [],
      keyPeople
    };

  } catch (error) {
    console.error('Crunchbase enrichment error:', error);
    return null;
  }
}

async function enrichFromNews(companyName: string): Promise<NewsData | null> {
  try {
    // Use news APIs to get recent company mentions
    const newsResults = await searchCompanyNews(companyName);
    
    const recentNews = newsResults.slice(0, 10).map(article => ({
      title: article.title,
      summary: article.summary || article.title,
      date: article.publishedAt,
      source: article.source.name,
      url: article.url,
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || ''))
    }));

    // Analyze overall sentiment and extract signals
    const overallSentiment = calculateOverallSentiment(recentNews);
    const growthSignals = extractGrowthSignals(recentNews);
    const riskFactors = extractRiskFactors(recentNews);

    return {
      recentNews,
      pressReleases: recentNews.filter(news => 
        news.title.toLowerCase().includes('announces') || 
        news.title.toLowerCase().includes('launches')
      ).map(news => news.title),
      overallSentiment,
      growthSignals,
      riskFactors
    };

  } catch (error) {
    console.error('News enrichment error:', error);
    return null;
  }
}

async function enrichSocialPresence(companyName: string, website?: string | null): Promise<SocialPresence | null> {
  try {
    const domain = website ? extractDomain(website) : null;
    
    // Search for social media profiles
    const [twitter, linkedin, github] = await Promise.allSettled([
      findTwitterProfile(companyName),
      findLinkedInCompany(companyName),
      findGitHubOrganization(companyName, domain)
    ]);

    return {
      twitter: twitter.status === 'fulfilled' ? twitter.value : null,
      linkedin: linkedin.status === 'fulfilled' ? linkedin.value : null,
      github: github.status === 'fulfilled' ? github.value : null
    };

  } catch (error) {
    console.error('Social presence enrichment error:', error);
    return null;
  }
}

async function enrichFinancialData(companyName: string): Promise<FinancialData | null> {
  try {
    // Estimate financial data from various sources
    const revenue = await estimateRevenue(companyName);
    const valuation = await getValuation(companyName);
    const employees = await getEmployeeData(companyName);
    const marketCap = await getMarketCap(companyName);

    return {
      revenue,
      valuation,
      employees,
      marketCap
    };

  } catch (error) {
    console.error('Financial data enrichment error:', error);
    return null;
  }
}

// Utility functions for data extraction and analysis

function extractEmployeeCount(sizeText: string): number {
  const match = sizeText.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function extractFollowerCount($: cheerio.CheerioAPI): number {
  const followerText = $('.follower-count').text();
  const match = followerText.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function extractFundingAmount(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d+)?)\s*(M|B|K)?/i);
  if (!match) return 0;
  
  const amount = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase();
  
  switch (unit) {
    case 'B': return amount * 1000000000;
    case 'M': return amount * 1000000;
    case 'K': return amount * 1000;
    default: return amount;
  }
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['growth', 'success', 'launch', 'funding', 'expansion', 'partnership', 'innovation'];
  const negativeWords = ['decline', 'loss', 'lawsuit', 'investigation', 'bankruptcy', 'layoffs', 'controversy'];
  
  const lowerText = text.toLowerCase();
  const positiveScore = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeScore = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

function calculateOverallSentiment(news: Array<{ sentiment: string }>): 'positive' | 'neutral' | 'negative' {
  const sentimentCounts = news.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const positive = sentimentCounts.positive || 0;
  const negative = sentimentCounts.negative || 0;
  
  if (positive > negative) return 'positive';
  if (negative > positive) return 'negative';
  return 'neutral';
}

function extractGrowthSignals(news: Array<{ title: string; summary: string }>): string[] {
  const growthKeywords = ['expansion', 'hiring', 'funding', 'launch', 'partnership', 'acquisition', 'growth', 'series'];
  const signals: string[] = [];
  
  news.forEach(item => {
    const text = (item.title + ' ' + item.summary).toLowerCase();
    growthKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        signals.push(`Recent ${keyword} activity detected`);
      }
    });
  });
  
  return [...new Set(signals)]; // Remove duplicates
}

function extractRiskFactors(news: Array<{ title: string; summary: string }>): string[] {
  const riskKeywords = ['lawsuit', 'investigation', 'decline', 'loss', 'bankruptcy', 'layoffs', 'controversy'];
  const risks: string[] = [];
  
  news.forEach(item => {
    const text = (item.title + ' ' + item.summary).toLowerCase();
    riskKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        risks.push(`${keyword} mentioned in recent news`);
      }
    });
  });
  
  return [...new Set(risks)]; // Remove duplicates
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Placeholder functions for external API calls

async function searchCompanyNews(companyName: string): Promise<any[]> {
  // This would integrate with News API, Google News, or similar services
  // For now, return simulated news data
  return [
    {
      title: `${companyName} announces new product launch`,
      description: `${companyName} launches innovative solution for enterprise customers`,
      publishedAt: new Date().toISOString(),
      source: { name: 'TechCrunch' },
      url: 'https://example.com/news'
    }
  ];
}

async function findTwitterProfile(companyName: string) {
  // Twitter API integration would go here
  return null;
}

async function findLinkedInCompany(companyName: string) {
  // LinkedIn API integration would go here
  return null;
}

async function findGitHubOrganization(companyName: string, domain?: string | null) {
  // GitHub API integration would go here
  return null;
}

async function estimateRevenue(companyName: string) {
  // Revenue estimation logic would go here
  return null;
}

async function getValuation(companyName: string) {
  // Valuation data retrieval would go here
  return null;
}

async function getEmployeeData(companyName: string) {
  // Employee data retrieval would go here
  return null;
}

async function getMarketCap(companyName: string) {
  // Market cap data retrieval would go here
  return null;
}

export function calculateEnrichmentScore(enrichmentData: EnrichmentSources): {
  score: number;
  completeness: number;
  confidence: number;
} {
  let score = 0;
  let dataPoints = 0;
  let totalPossiblePoints = 5;

  // Score based on data availability and quality
  if (enrichmentData.linkedin) {
    score += 30;
    dataPoints++;
  }
  
  if (enrichmentData.crunchbase) {
    score += 25;
    dataPoints++;
  }
  
  if (enrichmentData.news) {
    score += 20;
    dataPoints++;
    // Boost for positive sentiment
    if (enrichmentData.news.overallSentiment === 'positive') score += 5;
  }
  
  if (enrichmentData.social) {
    score += 15;
    dataPoints++;
  }
  
  if (enrichmentData.financial) {
    score += 10;
    dataPoints++;
  }

  const completeness = (dataPoints / totalPossiblePoints) * 100;
  const confidence = Math.min(score + completeness / 2, 100);

  return {
    score: Math.min(score, 100),
    completeness,
    confidence
  };
}
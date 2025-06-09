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
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  pressReleases: Array<{
    title: string;
    date: string;
    content: string;
  }>;
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SocialPresence {
  linkedin: { url: string; followers: number; posts: number };
  twitter: { handle: string; followers: number; tweets: number };
  github: { url: string; repos: number; stars: number };
  facebook: { url: string; likes: number };
}

export interface FinancialData {
  revenue: string;
  valuation: string;
  fundingRounds: Array<{
    type: string;
    amount: number;
    date: string;
    investors: string[];
  }>;
  marketCap: string;
  profitability: 'profitable' | 'breaking-even' | 'burning-cash';
}

export function enrichLeadData(lead: Lead): Lead & { enrichmentScore: number } {
  const score = calculateEnrichmentScore(lead);
  return {
    ...lead,
    enrichmentScore: score
  };
}

export function calculateEnrichmentScore(lead: Lead): number {
  let score = 0;
  
  // Base score from existing lead data
  if (lead.companyName) score += 10;
  if (lead.website) score += 15;
  if (lead.industry) score += 20;
  if (lead.companySize) score += 15;
  if (lead.location) score += 10;
  if (lead.contactName) score += 15;
  if (lead.jobTitle) score += 15;
  
  return Math.min(score, 100);
}

export async function enrichFromMultipleSources(lead: Lead): Promise<EnrichmentSources> {
  const enrichmentData: EnrichmentSources = {
    linkedin: null,
    crunchbase: null,
    news: null,
    social: null,
    financial: null
  };

  try {
    // In a real implementation, these would make actual API calls
    // For now, return null to indicate data not available
    console.log(`Enrichment requested for ${lead.companyName} but external APIs not configured`);
  } catch (error) {
    console.error('Enrichment failed:', error);
  }

  return enrichmentData;
}
import { leads, type Lead, type InsertLead, type UpdateLead } from "@shared/schema";

export interface IStorage {
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: UpdateLead): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  getLeadsByFilter(filters: {
    industry?: string;
    companySize?: string;
    priority?: string;
    minScore?: number;
    search?: string;
  }): Promise<Lead[]>;
}

export class MemStorage implements IStorage {
  private leads: Map<number, Lead>;
  private currentId: number;

  constructor() {
    this.leads = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Initialize with empty data - leads will be fetched from real sources
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => b.score - a.score);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentId++;
    const lead: Lead = {
      id,
      companyName: insertLead.companyName,
      contactName: insertLead.contactName,
      jobTitle: insertLead.jobTitle,
      email: insertLead.email || null,
      phone: insertLead.phone || null,
      companySize: insertLead.companySize,
      industry: insertLead.industry,
      location: insertLead.location,
      website: insertLead.website || null,
      score: 0,
      priority: insertLead.priority || "cold",
      techStack: Array.isArray(insertLead.techStack) ? insertLead.techStack : (insertLead.techStack ? [insertLead.techStack] : null),
      aiInsights: insertLead.aiInsights || null,
      fundingInfo: insertLead.fundingInfo || null,
      employeeCount: insertLead.employeeCount || null,
      recentActivity: insertLead.recentActivity || null,
      buyingIntent: insertLead.buyingIntent || "unknown",
      budgetRange: insertLead.budgetRange || null,
      decisionTimeline: insertLead.decisionTimeline || null,
      isEnriched: false,
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: number, updateLead: UpdateLead): Promise<Lead | undefined> {
    const existingLead = this.leads.get(id);
    if (!existingLead) {
      return undefined;
    }

    const updatedLead: Lead = { ...existingLead, ...updateLead };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  async getLeadsByFilter(filters: {
    industry?: string;
    companySize?: string;
    priority?: string;
    minScore?: number;
    search?: string;
  }): Promise<Lead[]> {
    let filteredLeads = Array.from(this.leads.values());

    if (filters.industry) {
      filteredLeads = filteredLeads.filter(lead => 
        lead.industry.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    if (filters.companySize) {
      filteredLeads = filteredLeads.filter(lead => lead.companySize === filters.companySize);
    }

    if (filters.priority) {
      filteredLeads = filteredLeads.filter(lead => lead.priority === filters.priority);
    }

    if (filters.minScore !== undefined) {
      filteredLeads = filteredLeads.filter(lead => lead.score >= filters.minScore!);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.companyName.toLowerCase().includes(searchTerm) ||
        lead.contactName.toLowerCase().includes(searchTerm) ||
        lead.industry.toLowerCase().includes(searchTerm) ||
        lead.jobTitle.toLowerCase().includes(searchTerm)
      );
    }

    return filteredLeads.sort((a, b) => b.score - a.score);
  }
}

export const storage = new MemStorage();

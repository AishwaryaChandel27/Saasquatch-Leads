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
    // Seed with some initial leads for demonstration
    const seedLeads: InsertLead[] = [
      {
        companyName: "TechCorp Industries",
        contactName: "Sarah Johnson",
        jobTitle: "VP of Sales",
        email: "sarah.johnson@techcorp.com",
        companySize: "500-1000",
        industry: "SaaS",
        location: "San Francisco, CA",
        website: "https://techcorp.com",
        priority: "hot",
        techStack: ["Salesforce", "Slack", "AWS", "HubSpot"],
        fundingInfo: "Series C - $50M",
        employeeCount: 750,
        recentActivity: "Downloaded whitepaper on enterprise solutions",
        buyingIntent: "high",
        budgetRange: "$50K - $200K",
        decisionTimeline: "Q1 2024",
        isEnriched: true,
      },
      {
        companyName: "InnovateScale",
        contactName: "Michael Chen",
        jobTitle: "CTO",
        email: "michael.chen@innovatescale.com",
        companySize: "200-500",
        industry: "FinTech",
        location: "New York, NY",
        website: "https://innovatescale.com",
        priority: "hot",
        techStack: ["MongoDB", "React", "Node.js", "Docker"],
        fundingInfo: "Series B - $25M",
        employeeCount: 350,
        recentActivity: "Attended webinar on API integrations",
        buyingIntent: "high",
        budgetRange: "$25K - $100K",
        decisionTimeline: "Q2 2024",
        isEnriched: true,
      },
      {
        companyName: "DataSync Solutions",
        contactName: "Amanda Rodriguez",
        jobTitle: "Head of Marketing",
        email: "amanda.rodriguez@datasync.com",
        companySize: "50-200",
        industry: "Data Analytics",
        location: "Austin, TX",
        website: "https://datasync.com",
        priority: "warm",
        techStack: ["Tableau", "Snowflake", "Python", "Jupyter"],
        fundingInfo: "Series A - $10M",
        employeeCount: 125,
        recentActivity: "Requested demo of analytics platform",
        buyingIntent: "medium",
        budgetRange: "$10K - $50K",
        decisionTimeline: "Q3 2024",
        isEnriched: true,
      },
      {
        companyName: "CloudLink Systems",
        contactName: "Robert Kim",
        jobTitle: "Operations Manager",
        email: "robert.kim@cloudlink.com",
        companySize: "10-50",
        industry: "Cloud Services",
        location: "Seattle, WA",
        website: "https://cloudlink.com",
        priority: "cold",
        techStack: ["AWS", "Kubernetes", "Terraform"],
        fundingInfo: "Seed - $2M",
        employeeCount: 35,
        recentActivity: "Visited pricing page",
        buyingIntent: "low",
        budgetRange: "$5K - $25K",
        decisionTimeline: "H2 2024",
        isEnriched: false,
      },
    ];

    seedLeads.forEach(lead => {
      this.createLead(lead);
    });
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
      ...insertLead,
      id,
      score: 0,
      isEnriched: insertLead.isEnriched || false,
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

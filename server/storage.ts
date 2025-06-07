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
    // Add sample high-quality leads to demonstrate the scoring system
    const sampleLeads = [
      {
        companyName: "Stripe",
        contactName: "Emily Rodriguez",
        jobTitle: "VP of Engineering",
        email: "emily.rodriguez@stripe.com",
        phone: "+1-555-0101",
        companySize: "1000+",
        industry: "Fintech",
        location: "San Francisco, CA",
        website: "https://stripe.com",
        priority: "hot" as const,
        techStack: ["React", "Node.js", "Python", "Kubernetes"],
        fundingInfo: "Series H - $600M",
        employeeCount: 4000,
        recentActivity: "Expanding AI payment fraud detection",
        buyingIntent: "high" as const,
        budgetRange: "$2M-$10M",
        decisionTimeline: "Q1 2025",
        isEnriched: true
      },
      {
        companyName: "Airbnb",
        contactName: "Michael Chen",
        jobTitle: "Chief Technology Officer",
        email: "michael.chen@airbnb.com",
        phone: "+1-555-0102",
        companySize: "1000+",
        industry: "Travel & Hospitality",
        location: "San Francisco, CA",
        website: "https://airbnb.com",
        priority: "hot" as const,
        techStack: ["React", "Java", "Python", "Kubernetes", "AWS"],
        fundingInfo: "Public Company",
        employeeCount: 6100,
        recentActivity: "Investing in ML for personalization",
        buyingIntent: "high" as const,
        budgetRange: "$5M-$20M",
        decisionTimeline: "Q2 2025",
        isEnriched: true
      },
      {
        companyName: "Snowflake",
        contactName: "Sarah Kim",
        jobTitle: "VP of Product",
        email: "sarah.kim@snowflake.com",
        phone: "+1-555-0103",
        companySize: "1000+",
        industry: "Data & Analytics",
        location: "San Mateo, CA",
        website: "https://snowflake.com",
        priority: "hot" as const,
        techStack: ["Java", "Scala", "Python", "Kubernetes"],
        fundingInfo: "Public Company",
        employeeCount: 5000,
        recentActivity: "Launching new AI capabilities",
        buyingIntent: "high" as const,
        budgetRange: "$3M-$15M",
        decisionTimeline: "Q1 2025",
        isEnriched: true
      },
      {
        companyName: "Databricks",
        contactName: "Alex Thompson",
        jobTitle: "Director of Engineering",
        email: "alex.thompson@databricks.com",
        phone: "+1-555-0104",
        companySize: "1000+",
        industry: "Data & Analytics",
        location: "San Francisco, CA",
        website: "https://databricks.com",
        priority: "warm" as const,
        techStack: ["Spark", "Scala", "Python", "Kubernetes"],
        fundingInfo: "Series I - $1.6B",
        employeeCount: 4500,
        recentActivity: "Expanding lakehouse platform",
        buyingIntent: "medium" as const,
        budgetRange: "$1M-$5M",
        decisionTimeline: "Q2 2025",
        isEnriched: true
      },
      {
        companyName: "Notion",
        contactName: "Jessica Park",
        jobTitle: "Head of Growth",
        email: "jessica.park@notion.so",
        phone: "+1-555-0105",
        companySize: "100-500",
        industry: "Productivity Software",
        location: "San Francisco, CA",
        website: "https://notion.so",
        priority: "warm" as const,
        techStack: ["React", "Node.js", "PostgreSQL"],
        fundingInfo: "Series C - $275M",
        employeeCount: 500,
        recentActivity: "Building AI writing assistant",
        buyingIntent: "medium" as const,
        budgetRange: "$500K-$2M",
        decisionTimeline: "Q3 2025",
        isEnriched: true
      }
    ];

    sampleLeads.forEach((leadData, index) => {
      const id = ++this.currentId;
      const lead: Lead = {
        id,
        companyName: leadData.companyName,
        contactName: leadData.contactName,
        jobTitle: leadData.jobTitle,
        email: leadData.email,
        phone: leadData.phone,
        companySize: leadData.companySize,
        industry: leadData.industry,
        location: leadData.location,
        website: leadData.website,
        score: 85 - (index * 5), // High scores for demonstration
        priority: leadData.priority,
        techStack: leadData.techStack,
        aiInsights: null,
        fundingInfo: leadData.fundingInfo,
        employeeCount: leadData.employeeCount,
        recentActivity: leadData.recentActivity,
        buyingIntent: leadData.buyingIntent,
        budgetRange: leadData.budgetRange,
        decisionTimeline: leadData.decisionTimeline,
        isEnriched: leadData.isEnriched
      };
      this.leads.set(id, lead);
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

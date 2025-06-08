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
        companyType: "unicorn",
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
        companyType: "public",
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
        location: "San Mateo, CA, USA",
        website: "https://snowflake.com",
        priority: "hot" as const,
        techStack: ["Java", "Scala", "Python", "Kubernetes"],
        fundingInfo: "Public Company",
        employeeCount: 5000,
        recentActivity: "Launching new AI capabilities",
        buyingIntent: "high" as const,
        budgetRange: "$3M-$15M",
        decisionTimeline: "Q1 2025",
        companyType: "public",
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
        companyType: "unicorn",
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
        location: "San Francisco, CA, USA",
        website: "https://notion.so",
        priority: "warm" as const,
        techStack: ["React", "Node.js", "PostgreSQL"],
        fundingInfo: "Series C - $275M",
        employeeCount: 500,
        recentActivity: "Building AI writing assistant",
        buyingIntent: "medium" as const,
        budgetRange: "$500K-$2M",
        decisionTimeline: "Q3 2025",
        companyType: "startup",
        isEnriched: true
      },
      {
        companyName: "Shopify",
        contactName: "David Kim",
        jobTitle: "VP of Engineering",
        email: "d.kim@shopify.com",
        phone: "+1-613-241-2828",
        companySize: "1000+",
        industry: "E-commerce",
        location: "Ottawa, ON, Canada",
        website: "https://shopify.com",
        priority: "hot" as const,
        techStack: ["Ruby", "React", "Go", "Kubernetes"],
        fundingInfo: "Public Company",
        employeeCount: 10000,
        recentActivity: "AI-powered commerce features",
        buyingIntent: "high" as const,
        budgetRange: "$5M-$25M",
        decisionTimeline: "Q1 2025",
        companyType: "public",
        isEnriched: true
      },
      {
        companyName: "Revolut",
        contactName: "Emma Williams",
        jobTitle: "CTO",
        email: "e.williams@revolut.com",
        phone: "+44-20-3322-8352",
        companySize: "1000+",
        industry: "FinTech",
        location: "London, UK",
        website: "https://revolut.com",
        priority: "hot" as const,
        techStack: ["Java", "Kotlin", "React", "AWS"],
        fundingInfo: "Series E - $800M",
        employeeCount: 8000,
        recentActivity: "Crypto trading expansion",
        buyingIntent: "high" as const,
        budgetRange: "$3M-$12M",
        decisionTimeline: "Q2 2025",
        companyType: "unicorn",
        isEnriched: true
      },
      {
        companyName: "SAP",
        contactName: "Hans Mueller",
        jobTitle: "Director of Innovation",
        email: "h.mueller@sap.com",
        phone: "+49-6227-7-47474",
        companySize: "1000+",
        industry: "Enterprise Software",
        location: "Walldorf, Germany",
        website: "https://sap.com",
        priority: "warm" as const,
        techStack: ["Java", "HANA", "JavaScript", "Cloud"],
        fundingInfo: "Public Company",
        employeeCount: 112000,
        recentActivity: "AI business transformation",
        buyingIntent: "medium" as const,
        budgetRange: "$10M-$50M",
        decisionTimeline: "Q3 2025",
        companyType: "mnc",
        isEnriched: true
      },
      {
        companyName: "Paytm",
        contactName: "Priya Sharma",
        jobTitle: "VP of Technology",
        email: "p.sharma@paytm.com",
        phone: "+91-120-4770770",
        companySize: "1000+",
        industry: "FinTech",
        location: "Noida, UP, India",
        website: "https://paytm.com",
        priority: "hot" as const,
        techStack: ["Java", "React", "MongoDB", "AWS"],
        fundingInfo: "Public Company",
        employeeCount: 15000,
        recentActivity: "Digital lending platform",
        buyingIntent: "high" as const,
        budgetRange: "$2M-$8M",
        decisionTimeline: "Q1 2025",
        companyType: "public",
        isEnriched: true
      },
      {
        companyName: "Grab",
        contactName: "Li Wei",
        jobTitle: "Head of Data Science",
        email: "l.wei@grab.com",
        phone: "+65-6571-5808",
        companySize: "1000+",
        industry: "Transportation & Logistics",
        location: "Singapore",
        website: "https://grab.com",
        priority: "hot" as const,
        techStack: ["Go", "Python", "Kafka", "Kubernetes"],
        fundingInfo: "Public Company",
        employeeCount: 9000,
        recentActivity: "Super app expansion",
        buyingIntent: "high" as const,
        budgetRange: "$4M-$15M",
        decisionTimeline: "Q2 2025",
        companyType: "public",
        isEnriched: true
      },
      {
        companyName: "Nubank",
        contactName: "Carlos Silva",
        jobTitle: "Head of Engineering",
        email: "c.silva@nubank.com.br",
        phone: "+55-11-4118-2172",
        companySize: "1000+",
        industry: "FinTech",
        location: "São Paulo, Brazil",
        website: "https://nubank.com.br",
        priority: "hot" as const,
        techStack: ["Clojure", "Kotlin", "React", "AWS"],
        fundingInfo: "Public Company",
        employeeCount: 5000,
        recentActivity: "Credit expansion platform",
        buyingIntent: "high" as const,
        budgetRange: "$3M-$10M",
        decisionTimeline: "Q1 2025",
        companyType: "public",
        isEnriched: true
      },
      {
        companyName: "Afterpay",
        contactName: "Sophie Chen",
        jobTitle: "VP of Product",
        email: "s.chen@afterpay.com",
        phone: "+61-2-8072-1400",
        companySize: "1000+",
        industry: "FinTech",
        location: "Melbourne, VIC, Australia",
        website: "https://afterpay.com",
        priority: "warm" as const,
        techStack: ["Java", "React", "AWS", "Microservices"],
        fundingInfo: "Acquired by Block",
        employeeCount: 3000,
        recentActivity: "Global expansion strategy",
        buyingIntent: "medium" as const,
        budgetRange: "$2M-$7M",
        decisionTimeline: "Q3 2025",
        companyType: "enterprise",
        isEnriched: true
      },
      {
        companyName: "Canva",
        contactName: "James Park",
        jobTitle: "Director of Engineering",
        email: "j.park@canva.com",
        phone: "+61-2-8188-3301",
        companySize: "1000+",
        industry: "Design & Creative",
        location: "Sydney, NSW, Australia",
        website: "https://canva.com",
        priority: "warm" as const,
        techStack: ["TypeScript", "React", "AWS", "GraphQL"],
        fundingInfo: "Series A - $200M",
        employeeCount: 4000,
        recentActivity: "AI design generation",
        buyingIntent: "medium" as const,
        budgetRange: "$1M-$5M",
        decisionTimeline: "Q2 2025",
        isEnriched: true
      },
      {
        companyName: "Klarna",
        contactName: "Anna Larsson",
        jobTitle: "Chief Innovation Officer",
        email: "a.larsson@klarna.com",
        phone: "+46-8-120-120-00",
        companySize: "1000+",
        industry: "FinTech",
        location: "Stockholm, Sweden",
        website: "https://klarna.com",
        priority: "hot" as const,
        techStack: ["Java", "Python", "React", "AWS"],
        fundingInfo: "Series D - $650M",
        employeeCount: 7000,
        recentActivity: "AI shopping assistant",
        buyingIntent: "high" as const,
        budgetRange: "$3M-$12M",
        decisionTimeline: "Q1 2025",
        isEnriched: true
      },
      {
        companyName: "Rakuten",
        contactName: "Yuki Tanaka",
        jobTitle: "VP of Technology",
        email: "y.tanaka@rakuten.com",
        phone: "+81-3-6670-6200",
        companySize: "1000+",
        industry: "E-commerce",
        location: "Tokyo, Japan",
        website: "https://rakuten.com",
        priority: "warm" as const,
        techStack: ["Java", "Scala", "React", "Cloud"],
        fundingInfo: "Public Company",
        employeeCount: 28000,
        recentActivity: "Ecosystem integration",
        buyingIntent: "medium" as const,
        budgetRange: "$5M-$20M",
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
        companyType: leadData.companyType || "enterprise",
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

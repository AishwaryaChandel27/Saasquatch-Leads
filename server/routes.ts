import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertLeadSchema, updateLeadSchema } from "@shared/schema";
import { generateCompanyInsights, generateOutreachEmail } from "./lib/openai";
import { calculateLeadScore, enrichLeadData, updateLeadPriority } from "./lib/leadScoring";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all leads with optional filtering
  app.get("/api/leads", async (req, res) => {
    try {
      const filterSchema = z.object({
        industry: z.string().optional(),
        companySize: z.string().optional(),
        priority: z.string().optional(),
        minScore: z.coerce.number().optional(),
        search: z.string().optional(),
      });

      const filters = filterSchema.parse(req.query);
      const leads = await storage.getLeadsByFilter(filters);
      
      res.json(leads);
    } catch (error) {
      res.status(400).json({ message: "Invalid filter parameters" });
    }
  });

  // Get single lead
  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Invalid lead ID" });
    }
  });

  // Create new lead
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      
      // Calculate initial score
      const enrichedLead = enrichLeadData(lead);
      await storage.updateLead(lead.id, enrichedLead);
      
      res.status(201).json(enrichedLead);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid lead data" : "Failed to create lead" 
      });
    }
  });

  // Update lead
  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateLeadSchema.parse(req.body);
      
      const updatedLead = await storage.updateLead(id, updateData);
      
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(updatedLead);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof z.ZodError ? "Invalid update data" : "Failed to update lead" 
      });
    }
  });

  // Delete lead
  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLead(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Invalid lead ID" });
    }
  });

  // Recalculate lead score
  app.post("/api/leads/:id/score", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      const { score, breakdown } = calculateLeadScore(lead);
      const priority = updateLeadPriority(score);
      
      const updatedLead = await storage.updateLead(id, { 
        score, 
        priority,
        isEnriched: true 
      });
      
      res.json({ 
        lead: updatedLead, 
        breakdown 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate score" });
    }
  });

  // Generate AI insights for a lead
  app.post("/api/leads/:id/insights", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      const insights = await generateCompanyInsights(
        lead.companyName,
        lead.industry,
        lead.companySize,
        lead.contactName,
        lead.jobTitle,
        lead.techStack || undefined,
        lead.fundingInfo || undefined,
        lead.recentActivity || undefined
      );
      
      // Update lead with AI insights
      await storage.updateLead(id, {
        aiInsights: JSON.stringify(insights),
        buyingIntent: insights.buyingIntent,
        budgetRange: insights.budgetRange,
        decisionTimeline: insights.decisionTimeline,
        isEnriched: true,
      });
      
      res.json(insights);
    } catch (error) {
      console.error("AI insights generation error:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Generate outreach email
  app.post("/api/leads/:id/email", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      let insights;
      if (lead.aiInsights) {
        insights = JSON.parse(lead.aiInsights);
      } else {
        // Generate insights if not available
        insights = await generateCompanyInsights(
          lead.companyName,
          lead.industry,
          lead.companySize,
          lead.contactName,
          lead.jobTitle,
          lead.techStack || undefined,
          lead.fundingInfo || undefined,
          lead.recentActivity || undefined
        );
      }
      
      const { productName } = req.body;
      const email = await generateOutreachEmail(
        lead.contactName,
        lead.companyName,
        lead.jobTitle,
        insights,
        productName
      );
      
      res.json({ email });
    } catch (error) {
      console.error("Email generation error:", error);
      res.status(500).json({ message: "Failed to generate outreach email" });
    }
  });

  // Export leads to CSV
  app.get("/api/leads/export/csv", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      
      const csvHeaders = [
        "Company Name",
        "Contact Name", 
        "Job Title",
        "Email",
        "Phone",
        "Company Size",
        "Industry",
        "Location",
        "Website",
        "Lead Score",
        "Priority",
        "Tech Stack",
        "Buying Intent",
        "Budget Range",
        "Decision Timeline",
        "Recent Activity"
      ];
      
      const csvRows = leads.map(lead => [
        lead.companyName,
        lead.contactName,
        lead.jobTitle,
        lead.email || "",
        lead.phone || "",
        lead.companySize,
        lead.industry,
        lead.location,
        lead.website || "",
        lead.score.toString(),
        lead.priority,
        (lead.techStack || []).join("; "),
        lead.buyingIntent || "",
        lead.budgetRange || "",
        lead.decisionTimeline || "",
        lead.recentActivity || ""
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(","))
        .join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=saasquatch_leads.csv");
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export leads" });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      
      const stats = {
        totalLeads: leads.length,
        highPriority: leads.filter(lead => lead.priority === "hot").length,
        aiEnriched: leads.filter(lead => lead.isEnriched).length,
        conversionRate: "24.7%", // This would be calculated based on actual conversion data
        averageScore: Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length) || 0,
        scoreDistribution: {
          hot: leads.filter(lead => lead.score >= 80).length,
          warm: leads.filter(lead => lead.score >= 60 && lead.score < 80).length,
          cold: leads.filter(lead => lead.score < 60).length,
        },
        industryBreakdown: leads.reduce((acc, lead) => {
          acc[lead.industry] = (acc[lead.industry] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

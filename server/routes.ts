import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertLeadSchema, updateLeadSchema } from "@shared/schema";
import { generateCompanyInsights, generateOutreachEmail } from "./lib/openai";
import { generateCompanyAnalysis } from "./lib/aiAnalysis";
import { calculateLeadScore, updateLeadPriority } from "./lib/leadScoring";
import { calculateMLScore, classifyLeadQuality } from "./lib/mlScoring";
import { aggregateRealWorldData } from "./lib/realWorldData";
import { prospectGlobalLeads, getAvailableIndustries, getAvailableLocations, getAvailableCompanySizes } from "./lib/globalLeadProspecting";
import { enrichCompanyWithClearbit, calculateClearbitScore, categorizeClearbitPriority } from "./lib/clearbit";
import { calculateAdvancedLeadScore, enrichLeadWithAdvancedScoring } from "./lib/advancedLeadScoring";
import { enrichLeadData, calculateEnrichmentScore } from "./lib/leadEnrichment";
import { calculateEnhancedScore } from "./lib/enhancedScoring";
import { intelligentProspecting, prospectHighValueTargets } from "./lib/intelligentProspecting";
import { 
  prospectFromGitHub,
  prospectFromYCombinator, 
  prospectByTechnology,
  prospectMultipleSources
} from "./lib/simpleDataSources";

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
      const updatedLead = await storage.updateLead(lead.id, { score: enrichedLead.score });
      
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

  // Enhanced lead analysis with comprehensive scoring
  app.post("/api/leads/:id/analyze", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      // Calculate enhanced scoring with detailed breakdown
      const enhancedScoring = calculateEnhancedScore(lead);
      
      // Generate AI insights
      const aiInsights = await generateCompanyInsights(lead.companyName).catch(() => null);

      const analysis = {
        leadId,
        qualityMetrics: {
          score: enhancedScoring.totalScore,
          category: enhancedScoring.category,
          confidence: enhancedScoring.confidence,
          factors: {
            positive: enhancedScoring.opportunityFactors,
            negative: enhancedScoring.riskFactors,
            neutral: []
          },
          recommendations: enhancedScoring.recommendations
        },
        enrichmentData: enhancedScoring.breakdown,
        enrichmentScore: {
          score: enhancedScoring.totalScore,
          completeness: enhancedScoring.confidence,
          confidence: enhancedScoring.confidence
        },
        aiInsights,
        analysisTimestamp: new Date().toISOString()
      };

      // Update lead with enhanced scoring
      await storage.updateLead(leadId, {
        score: enhancedScoring.totalScore,
        priority: enhancedScoring.category === 'High' ? 'hot' : 
                 enhancedScoring.category === 'Medium' ? 'warm' : 'cold',
        aiInsights: aiInsights ? JSON.stringify(aiInsights) : null,
        isEnriched: true
      });

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing lead:", error);
      res.status(500).json({ message: "Failed to analyze lead" });
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

  // Company search endpoint with Clearbit integration for comprehensive data
  app.post("/api/companies/search", async (req, res) => {
    try {
      const { companyName } = req.body;
      
      if (!companyName) {
        return res.status(400).json({ message: "Company name is required" });
      }

      console.log(`Searching for company: ${companyName}`);
      
      // First check existing leads database
      const existingLead = (await storage.getLeads()).find(
        lead => lead.companyName.toLowerCase().includes(companyName.toLowerCase())
      );

      if (existingLead) {
        // Try to enhance with Clearbit data
        const clearbitData = await enrichCompanyWithClearbit(existingLead.companyName);
        
        if (clearbitData) {
          const clearbitScore = calculateClearbitScore(clearbitData);
          const clearbitPriority = categorizeClearbitPriority(clearbitScore);
          
          return res.json({
            companyName: clearbitData.name,
            domain: clearbitData.domain,
            industry: clearbitData.category?.industry || existingLead.industry,
            sector: clearbitData.category?.sector,
            industryGroup: clearbitData.category?.industryGroup,
            description: clearbitData.description,
            foundedYear: clearbitData.foundedYear,
            location: clearbitData.location || existingLead.location,
            logo: clearbitData.logo,
            website: `https://${clearbitData.domain}`,
            phone: clearbitData.phone,
            
            // Social media and online presence
            linkedinUrl: clearbitData.linkedin?.handle ? `https://linkedin.com/company/${clearbitData.linkedin.handle}` : null,
            twitterUrl: clearbitData.twitter?.handle ? `https://twitter.com/${clearbitData.twitter.handle}` : null,
            facebookUrl: clearbitData.facebook?.handle ? `https://facebook.com/${clearbitData.facebook.handle}` : null,
            crunchbaseUrl: clearbitData.crunchbase?.handle ? `https://crunchbase.com/organization/${clearbitData.crunchbase.handle}` : null,
            
            // Company metrics
            employeeCount: clearbitData.metrics?.employees || existingLead.employeeCount,
            employeesRange: clearbitData.metrics?.employeesRange,
            marketCap: clearbitData.metrics?.marketCap,
            annualRevenue: clearbitData.metrics?.annualRevenue,
            totalFunding: clearbitData.metrics?.raised,
            
            // Tech stack and categories
            techStack: clearbitData.tech || existingLead.techStack,
            techCategories: clearbitData.techCategories,
            
            // Scoring
            score: clearbitScore,
            priority: clearbitPriority,
            mlScore: existingLead.score,
            mlPriority: existingLead.priority,
            
            // Enriched insights
            aiInsights: {
              summary: `${clearbitData.name} is a ${clearbitData.category?.industry || 'technology'} company founded in ${clearbitData.foundedYear} with ${clearbitData.metrics?.employees || 'unknown'} employees. Clearbit score: ${clearbitScore}/100.`,
              keyInsights: [
                `Industry: ${clearbitData.category?.industry || 'Not specified'}`,
                `Founded: ${clearbitData.foundedYear || 'Unknown'}`,
                `Employees: ${clearbitData.metrics?.employees || 'Not specified'}`,
                `Location: ${clearbitData.location || 'Not specified'}`,
                `Revenue: ${clearbitData.metrics?.annualRevenue ? `$${(clearbitData.metrics.annualRevenue / 1000000).toFixed(1)}M` : 'Not disclosed'}`,
                `Funding: ${clearbitData.metrics?.raised ? `$${(clearbitData.metrics.raised / 1000000).toFixed(1)}M` : 'Not disclosed'}`,
                `Tech Stack: ${clearbitData.tech?.length || 0} technologies`
              ],
              recommendedApproach: `High-value ${clearbitPriority} priority prospect. Focus on ${clearbitData.category?.industry || 'technology'} solutions with ${clearbitData.metrics?.employees || 'company size'} employee company scale.`
            }
          });
        }
        
        // Fallback to existing lead data if Clearbit fails
        return res.json({
          companyName: existingLead.companyName,
          industry: existingLead.industry,
          location: existingLead.location,
          website: existingLead.website,
          employeeCount: existingLead.employeeCount,
          fundingInfo: existingLead.fundingInfo,
          techStack: existingLead.techStack,
          score: existingLead.score,
          priority: existingLead.priority,
          description: `${existingLead.companyName} is a ${existingLead.industry} company with ${existingLead.employeeCount} employees in ${existingLead.location}.`,
          aiInsights: {
            summary: `${existingLead.companyName} shows strong potential with ${existingLead.score}/100 ML score`,
            keyInsights: [
              `Industry: ${existingLead.industry}`,
              `Employee Count: ${existingLead.employeeCount}`,
              `Funding: ${existingLead.fundingInfo}`,
              `Priority: ${existingLead.priority.toUpperCase()}`
            ],
            recommendedApproach: `Target ${existingLead.priority} priority outreach focused on ${existingLead.industry} solutions`
          }
        });
      }

      // If not in database, try direct Clearbit search
      const clearbitData = await enrichCompanyWithClearbit(companyName);
      
      if (clearbitData) {
        const clearbitScore = calculateClearbitScore(clearbitData);
        const clearbitPriority = categorizeClearbitPriority(clearbitScore);
        
        return res.json({
          companyName: clearbitData.name,
          domain: clearbitData.domain,
          industry: clearbitData.category?.industry,
          sector: clearbitData.category?.sector,
          industryGroup: clearbitData.category?.industryGroup,
          description: clearbitData.description,
          foundedYear: clearbitData.foundedYear,
          location: clearbitData.location,
          logo: clearbitData.logo,
          website: `https://${clearbitData.domain}`,
          phone: clearbitData.phone,
          
          // Social media and online presence
          linkedinUrl: clearbitData.linkedin?.handle ? `https://linkedin.com/company/${clearbitData.linkedin.handle}` : null,
          twitterUrl: clearbitData.twitter?.handle ? `https://twitter.com/${clearbitData.twitter.handle}` : null,
          facebookUrl: clearbitData.facebook?.handle ? `https://facebook.com/${clearbitData.facebook.handle}` : null,
          crunchbaseUrl: clearbitData.crunchbase?.handle ? `https://crunchbase.com/organization/${clearbitData.crunchbase.handle}` : null,
          
          // Company metrics
          employeeCount: clearbitData.metrics?.employees,
          employeesRange: clearbitData.metrics?.employeesRange,
          marketCap: clearbitData.metrics?.marketCap,
          annualRevenue: clearbitData.metrics?.annualRevenue,
          totalFunding: clearbitData.metrics?.raised,
          
          // Tech stack and categories
          techStack: clearbitData.tech,
          techCategories: clearbitData.techCategories,
          
          // Scoring
          score: clearbitScore,
          priority: clearbitPriority,
          
          // Enriched insights
          aiInsights: {
            summary: `${clearbitData.name} is a ${clearbitData.category?.industry || 'technology'} company founded in ${clearbitData.foundedYear} with ${clearbitData.metrics?.employees || 'unknown'} employees. Clearbit enrichment score: ${clearbitScore}/100.`,
            keyInsights: [
              `Industry: ${clearbitData.category?.industry || 'Not specified'}`,
              `Founded: ${clearbitData.foundedYear || 'Unknown'}`,
              `Employees: ${clearbitData.metrics?.employees || 'Not specified'}`,
              `Location: ${clearbitData.location || 'Not specified'}`,
              `Revenue: ${clearbitData.metrics?.annualRevenue ? `$${(clearbitData.metrics.annualRevenue / 1000000).toFixed(1)}M` : 'Not disclosed'}`,
              `Funding: ${clearbitData.metrics?.raised ? `$${(clearbitData.metrics.raised / 1000000).toFixed(1)}M` : 'Not disclosed'}`,
              `Tech Stack: ${clearbitData.tech?.length || 0} technologies identified`
            ],
            recommendedApproach: `New ${clearbitPriority} priority prospect identified via Clearbit. Strong potential for ${clearbitData.category?.industry || 'technology'} solutions.`
          }
        });
      }

      // If not found anywhere
      res.status(404).json({ 
        message: "Company not found in Clearbit database or current leads",
        suggestion: "Try searching for a well-known company like Stripe, Airbnb, or Uber"
      });

    } catch (error) {
      console.error("Company search error:", error);
      res.status(500).json({ 
        message: "Failed to search for company",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Lead enrichment endpoints
  app.post("/api/leads/:id/enrich", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      // Import multi-source enrichment functions
      const { enrichCompanyFromMultipleSources, determineCompanyType } = await import("./lib/multiSourceEnrichment");
      
      // Enrich from LinkedIn, Crunchbase, GitHub, and Google
      const enrichedData = await enrichCompanyFromMultipleSources(
        lead.companyName,
        lead.website || undefined
      );
      
      // Determine company type based on enriched data
      const companyType = determineCompanyType(enrichedData);
      
      const enrichmentData = {
        companyType,
        ...(enrichedData.linkedin?.employeeCount && {
          employeeCount: enrichedData.linkedin.employeeCount
        }),
        ...(enrichedData.github?.techStack && {
          techStack: enrichedData.github.techStack
        }),
        sources: ['linkedin', 'crunchbase', 'github', 'google']
      };
      
      // Update lead with enriched data
      const updatedLead = await storage.updateLead(leadId, {
        ...enrichmentData,
        isEnriched: true
      });

      res.json({
        success: true,
        lead: updatedLead,
        enrichmentSources: enrichmentData.sources || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Lead enrichment failed:", error);
      res.status(500).json({ 
        error: "Enrichment failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Batch enrichment for multiple leads
  app.post("/api/leads/batch-enrich", async (req, res) => {
    try {
      const { leadIds } = req.body;
      
      if (!Array.isArray(leadIds)) {
        return res.status(400).json({ error: "leadIds must be an array" });
      }

      const results = [];
      for (const leadId of leadIds) {
        try {
          const lead = await storage.getLead(leadId);
          if (lead) {
            // Import multi-source enrichment functions
            const { enrichCompanyFromMultipleSources, determineCompanyType } = await import("./lib/multiSourceEnrichment");
            
            // Enrich from LinkedIn, Crunchbase, GitHub, and Google
            const enrichedData = await enrichCompanyFromMultipleSources(
              lead.companyName,
              lead.website || undefined
            );
            
            // Determine company type based on enriched data
            const companyType = determineCompanyType(enrichedData);
            
            const enrichmentData = {
              companyType,
              ...(enrichedData.linkedin?.employeeCount && {
                employeeCount: enrichedData.linkedin.employeeCount
              }),
              ...(enrichedData.github?.techStack && {
                techStack: enrichedData.github.techStack
              }),
              sources: ['linkedin', 'crunchbase', 'github', 'google']
            };
            const updatedLead = await storage.updateLead(leadId, {
              ...enrichmentData,
              isEnriched: true
            });
            results.push({ leadId, success: true, lead: updatedLead });
          } else {
            results.push({ leadId, success: false, error: "Lead not found" });
          }
        } catch (error) {
          results.push({ 
            leadId, 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
          });
        }
      }

      res.json({
        success: true,
        results,
        enrichedCount: results.filter(r => r.success).length,
        totalCount: leadIds.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Batch enrichment failed:", error);
      res.status(500).json({ 
        error: "Batch enrichment failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI-powered company analysis endpoint
  app.post("/api/leads/:id/analyze", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const { generateCompanyAnalysis } = await import("./lib/aiAnalysis");
      const analysis = await generateCompanyAnalysis(lead);

      res.json({
        success: true,
        leadId,
        analysis,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("AI analysis failed:", error);
      res.status(500).json({ 
        error: "Analysis generation failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
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



  // Prospect leads from real data sources (must come before :id route)
  app.post("/api/leads/prospect", async (req, res) => {
    try {
      const { source, industry, technology, limit = 10 } = req.body;
      let leads = [];
      
      switch (source) {
        case 'github':
          leads = await prospectFromGitHub(limit);
          break;
        case 'ycombinator':
          leads = await prospectFromYCombinator(limit);
          break;
        case 'technology':
          if (!technology) {
            return res.status(400).json({ message: "Technology parameter required for technology source" });
          }
          leads = await prospectByTechnology(technology, limit);
          break;
        default:
          leads = await prospectMultipleSources(limit);
      }
      
      // Store the leads and calculate scores
      const storedLeads = [];
      for (const leadData of leads) {
        const lead = await storage.createLead(leadData);
        const enrichedLead = enrichLeadData(lead);
        await storage.updateLead(lead.id, enrichedLead);
        storedLeads.push(enrichedLead);
      }
      
      res.json({
        message: `Successfully prospected ${storedLeads.length} leads from ${source || 'multiple sources'}`,
        leads: storedLeads,
        source,
        count: storedLeads.length
      });
    } catch (error) {
      console.error("Lead prospecting error:", error);
      res.status(500).json({ message: "Failed to prospect leads from data sources" });
    }
  });

  // Get available data sources for prospecting (must come before :id route)
  app.get("/api/leads/sources", async (req, res) => {
    try {
      const sources = [
        {
          id: 'github',
          name: 'GitHub Organizations',
          description: 'Tech companies with active open source repositories',
          dataPoints: ['Company name', 'Tech stack', 'Employee count estimate', 'Location']
        },
        {
          id: 'ycombinator',
          name: 'Y Combinator Companies',
          description: 'Startups from Y Combinator accelerator program',
          dataPoints: ['Company name', 'Industry', 'Team size', 'Location', 'Description']
        },
        {
          id: 'technology',
          name: 'Companies by Technology',
          description: 'Companies using specific technologies (requires technology parameter)',
          dataPoints: ['Company name', 'Website', 'Tech stack', 'Industry']
        }
      ];
      
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  // Advanced ML-based lead enrichment with real-world data
  app.post("/api/leads/enrich-all", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      let mlEnrichedCount = 0;
      let webEnrichedCount = 0;
      let linkedinEnrichedCount = 0;
      let fundingEnrichedCount = 0;
      
      for (const lead of leads) {
        const updates: any = {};
        
        // Apply ML-based scoring algorithm
        if (!lead.isEnriched) {
          const mlResult = calculateMLScore(lead);
          const classification = classifyLeadQuality(mlResult.score, mlResult.confidence);
          
          updates.score = mlResult.score;
          updates.priority = classification.priority;
          updates.isEnriched = true;
          mlEnrichedCount++;
          
          console.log(`ML scoring for ${lead.companyName}: ${mlResult.score}/100 (${classification.quality})`);
        }
        
        // Enrich with real-world website data
        if (lead.website && !lead.aiInsights) {
          try {
            const webData = await aggregateRealWorldData(lead.companyName, lead.website);
            if (webData?.basicInfo) {
              if (webData.basicInfo.description) {
                updates.description = webData.basicInfo.description;
              }
              if (webData.businessMetrics.employeeCount) {
                updates.employeeCount = webData.businessMetrics.employeeCount;
              }
              if (webData.companyInfo.location) {
                updates.location = webData.companyInfo.location;
              }
              if (webData.techData?.technologies) {
                updates.techStack = webData.techData.technologies;
              }
              
              webEnrichedCount++;
              console.log(`Web enrichment for ${lead.companyName}: ${Object.keys(webData.companyInfo).length} data points`);
            }
          } catch (error) {
            console.error(`Web enrichment failed for ${lead.companyName}:`, error);
          }
        }
        
        // Enrich with LinkedIn company data
        if (!lead.description) {
          try {
            const linkedinData = await searchLinkedInCompany(lead.companyName);
            if (linkedinData.description) {
              updates.description = linkedinData.description;
              linkedinEnrichedCount++;
              console.log(`LinkedIn enrichment for ${lead.companyName}: Added company description`);
            }
          } catch (error) {
            console.error(`LinkedIn enrichment failed for ${lead.companyName}:`, error);
          }
        }
        
        // Enrich with Crunchbase funding data
        if (!lead.fundingInfo) {
          try {
            const fundingData = await getCrunchbaseFunding(lead.companyName);
            if (fundingData?.lastRound) {
              updates.fundingInfo = `${fundingData.lastRound} - ${fundingData.totalFunding}`;
              fundingEnrichedCount++;
              console.log(`Funding enrichment for ${lead.companyName}: ${fundingData.lastRound}`);
            }
          } catch (error) {
            console.error(`Funding enrichment failed for ${lead.companyName}:`, error);
          }
        }
        
        // Generate AI insights if we have enough data
        if (updates.techStack && !lead.aiInsights) {
          try {
            const insights = await generateCompanyInsights(lead.companyName, {
              industry: lead.industry,
              size: lead.companySize,
              techStack: updates.techStack || lead.techStack || [],
              funding: updates.fundingInfo || lead.fundingInfo || ''
            });
            updates.aiInsights = insights;
          } catch (error) {
            console.error(`AI insights generation failed for ${lead.companyName}:`, error);
          }
        }
        
        // Apply all updates
        if (Object.keys(updates).length > 0) {
          await storage.updateLead(lead.id, updates);
        }
      }
      
      res.json({
        message: `Advanced enrichment completed: ${mlEnrichedCount} ML scored, ${webEnrichedCount} web enriched, ${linkedinEnrichedCount} LinkedIn enriched, ${fundingEnrichedCount} funding enriched`,
        enrichmentStats: {
          mlEnrichedCount,
          webEnrichedCount,
          linkedinEnrichedCount,
          fundingEnrichedCount,
          totalLeads: leads.length
        }
      });
    } catch (error) {
      console.error("Advanced enrichment error:", error);
      res.status(500).json({ message: "Failed to perform advanced lead enrichment" });
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

  // Generate comprehensive company analysis report with real-world data
  app.post("/api/leads/:id/analysis", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      console.log(`Generating comprehensive analysis for ${lead.companyName}...`);
      const analysisReport = await generateCompanyAnalysis(lead);
      
      res.json({
        leadId: id,
        companyName: lead.companyName,
        generatedAt: new Date().toISOString(),
        report: analysisReport
      });
    } catch (error) {
      console.error('Company analysis error:', error);
      res.status(500).json({ 
        message: "Failed to generate company analysis",
        error: error instanceof Error ? error.message : "Analysis service temporarily unavailable"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

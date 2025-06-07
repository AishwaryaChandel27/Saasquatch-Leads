import { pgTable, text, serial, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  jobTitle: text("job_title").notNull(),
  email: text("email"),
  phone: text("phone"),
  companySize: text("company_size").notNull(),
  industry: text("industry").notNull(),
  location: text("location").notNull(),
  website: text("website"),
  score: integer("score").notNull().default(0),
  priority: text("priority").notNull().default("cold"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  aiInsights: text("ai_insights"),
  fundingInfo: text("funding_info"),
  employeeCount: integer("employee_count"),
  recentActivity: text("recent_activity"),
  buyingIntent: text("buying_intent").default("unknown"),
  budgetRange: text("budget_range"),
  decisionTimeline: text("decision_timeline"),
  isEnriched: boolean("is_enriched").default(false),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  score: true,
  isEnriched: true,
});

export const updateLeadSchema = createInsertSchema(leads).omit({
  id: true,
}).partial();

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Scoring criteria schema
export const scoringCriteriaSchema = z.object({
  companySize: z.number().min(0).max(25),
  industryMatch: z.number().min(0).max(25),
  jobTitleRelevance: z.number().min(0).max(25),
  engagementSignals: z.number().min(0).max(25),
});

export type ScoringCriteria = z.infer<typeof scoringCriteriaSchema>;

// AI insights schema
export const aiInsightsSchema = z.object({
  summary: z.string(),
  buyingIntent: z.enum(["high", "medium", "low", "unknown"]),
  budgetRange: z.string().optional(),
  decisionTimeline: z.string().optional(),
  keyInsights: z.array(z.string()),
  recommendedApproach: z.string(),
});

export type AIInsights = z.infer<typeof aiInsightsSchema>;

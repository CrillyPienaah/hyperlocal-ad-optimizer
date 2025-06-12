import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  address: text("address").notNull(),
  phone: text("phone"),
  industry: text("industry").notNull(),
  businessType: text("business_type").notNull(),
  customBusinessType: text("custom_business_type"),
  description: text("description"),
  isOnboardingComplete: boolean("is_onboarding_complete").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'local-awareness', 'store-visits', 'lead-generation', 'event-promotion'
  status: text("status").notNull().default("active"), // 'active', 'paused', 'completed'
  targetLocation: text("target_location").notNull(),
  targetRadius: decimal("target_radius", { precision: 5, scale: 2 }).notNull(),
  audienceType: text("audience_type").notNull(), // 'everyone', 'workers', 'residents', 'recent-visitors'
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }).notNull(),
  duration: text("duration").notNull(), // '1-week', '2-weeks', '1-month', '3-months', 'ongoing'
  adContent: text("ad_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaignMetrics = pgTable("campaign_metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).notNull().default("0.00"),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const businessProfileSchema = insertBusinessSchema.extend({
  businessType: z.enum(["restaurant", "retail", "service", "healthcare", "fitness", "beauty", "professional", "education", "entertainment", "other"]),
  customBusinessType: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
}).refine((data) => {
  if (data.businessType === "other" && !data.customBusinessType) {
    return false;
  }
  return true;
}, {
  message: "Custom business type is required when 'Other' is selected",
  path: ["customBusinessType"],
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignMetricsSchema = createInsertSchema(campaignMetrics).omit({
  id: true,
  date: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertCampaignMetrics = z.infer<typeof insertCampaignMetricsSchema>;
export type CampaignMetrics = typeof campaignMetrics.$inferSelect;

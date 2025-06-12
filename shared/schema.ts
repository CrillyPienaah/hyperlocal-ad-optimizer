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
  // Location fields
  city: text("city"),
  primaryNeighborhood: text("primary_neighborhood"),
  serviceAreas: text("service_areas"),
  serviceRadius: integer("service_radius"), // in kilometers
  serviceAtLocation: boolean("service_at_location").default(false),
  serviceAtCustomerLocation: boolean("service_at_customer_location").default(false),
  // Audience fields
  customerDescription: text("customer_description"),
  targetAgeGroups: text("target_age_groups"), // JSON array of age groups
  customerInterests: text("customer_interests"), // JSON array of interests
  communityInvolvement: text("community_involvement"),
  // Budget fields
  budgetTier: text("budget_tier"), // "50-200", "201-500", "501-1000", "1000+"
  budgetTimeframe: text("budget_timeframe"), // "monthly", "per-campaign"
  marketingGoal: text("marketing_goal"),
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

export const insertBusinessSchema = createInsertSchema(businesses, {
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
}).omit({
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

export const locationProfileSchema = z.object({
  city: z.string().min(2, "City is required").max(100, "City name too long"),
  primaryNeighborhood: z.string().max(100, "Neighborhood name too long").optional(),
  serviceAreas: z.string().max(500, "Service areas description too long").optional(),
  serviceRadius: z.number().min(1, "Service radius must be at least 1km").max(50, "Service radius cannot exceed 50km"),
  serviceAtLocation: z.boolean().default(false),
  serviceAtCustomerLocation: z.boolean().default(false),
}).refine(data => data.serviceAtLocation || data.serviceAtCustomerLocation, {
  message: "At least one service method must be selected",
  path: ["serviceAtLocation"],
});

export const audienceProfileSchema = z.object({
  customerDescription: z.string().min(10, "Customer description must be at least 10 characters").max(1000, "Description too long"),
  targetAgeGroups: z.array(z.enum(["18-24", "25-34", "35-44", "45-54", "55-64", "65+"])).min(1, "Select at least one age group"),
  customerInterests: z.array(z.string().min(1).max(50)).min(1, "Add at least one customer interest").max(20, "Too many interests"),
  communityInvolvement: z.enum(["high", "medium", "low", "none"], {
    errorMap: () => ({ message: "Please select community involvement level" })
  }),
});

export const budgetProfileSchema = z.object({
  budgetTier: z.enum(["50-200", "201-500", "501-1000", "1000+"], {
    errorMap: () => ({ message: "Please select a budget tier" })
  }),
  budgetTimeframe: z.enum(["monthly", "per-campaign"], {
    errorMap: () => ({ message: "Please select budget timeframe" })
  }),
  marketingGoal: z.enum([
    "increase-awareness",
    "drive-foot-traffic", 
    "generate-leads",
    "boost-sales",
    "promote-events",
    "build-community"
  ], {
    errorMap: () => ({ message: "Please select a marketing goal" })
  }),
});

export const insertCampaignSchema = createInsertSchema(campaigns, {
  name: z.string().min(1, "Campaign name is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignMetricsSchema = createInsertSchema(campaignMetrics, {
  impressions: z.number().min(0),
  clicks: z.number().min(0),
}).omit({
  id: true,
  date: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertCampaignMetrics = z.infer<typeof insertCampaignMetricsSchema>;
export type CampaignMetrics = typeof campaignMetrics.$inferSelect;

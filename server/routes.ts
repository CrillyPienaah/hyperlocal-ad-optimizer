import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessSchema, insertCampaignSchema, insertCampaignMetricsSchema, businessProfileSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Business routes
  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/businesses", async (req, res) => {
    try {
      const validatedData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(validatedData);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Business profile route for onboarding
  app.post("/api/business-profile", async (req, res) => {
    try {
      const validatedData = businessProfileSchema.parse(req.body);
      const business = await storage.createBusiness(validatedData);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const business = await storage.updateBusiness(id, updates);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns/business/:businessId", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const campaigns = await storage.getCampaignsByBusinessId(businessId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const campaign = await storage.updateCampaign(id, updates);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCampaign(id);
      if (!deleted) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Metrics routes
  app.get("/api/metrics/business/:businessId/summary", async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const summary = await storage.getBusinessMetricsSummary(businessId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/metrics/campaign/:campaignId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const metrics = await storage.getCampaignMetrics(campaignId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/metrics", async (req, res) => {
    try {
      const validatedData = insertCampaignMetricsSchema.parse(req.body);
      const metrics = await storage.createCampaignMetrics(validatedData);
      res.status(201).json(metrics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Channel recommendations endpoint
  app.post("/api/recommendations/channels", async (req, res) => {
    try {
      const { businessId } = req.body;
      
      if (!businessId) {
        return res.status(400).json({ message: "Business ID is required" });
      }

      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      // Channel recommendation algorithm based on business profile
      const recommendations = generateChannelRecommendations(business);
      
      res.json({
        businessId,
        recommendations,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Channel recommendation algorithm
function generateChannelRecommendations(business: any) {
  const channels = [
    {
      id: 'google-ads',
      name: 'Google Ads',
      type: 'digital',
      description: 'Search and display advertising on Google network',
      costTier: 'medium',
      estimatedReach: '50,000-100,000',
      monthlyBudget: '$500-2000',
      benefits: ['High intent traffic', 'Local targeting', 'Immediate results']
    },
    {
      id: 'facebook-instagram',
      name: 'Facebook & Instagram Ads',
      type: 'digital',
      description: 'Social media advertising with detailed audience targeting',
      costTier: 'low',
      estimatedReach: '25,000-75,000',
      monthlyBudget: '$300-1500',
      benefits: ['Visual storytelling', 'Demographic targeting', 'Cost effective']
    },
    {
      id: 'local-print',
      name: 'Local Print Media',
      type: 'print',
      description: 'Newspapers, magazines, and local publications',
      costTier: 'medium',
      estimatedReach: '10,000-30,000',
      monthlyBudget: '$400-1200',
      benefits: ['Local credibility', 'Older demographics', 'Tangible presence']
    },
    {
      id: 'yelp-ads',
      name: 'Yelp Advertising',
      type: 'digital',
      description: 'Promoted listings and ads on Yelp platform',
      costTier: 'low',
      estimatedReach: '5,000-15,000',
      monthlyBudget: '$200-800',
      benefits: ['Local discovery', 'Review visibility', 'Mobile friendly']
    },
    {
      id: 'radio-sponsorship',
      name: 'Local Radio Sponsorship',
      type: 'traditional',
      description: 'Sponsorships and ads on local radio stations',
      costTier: 'medium',
      estimatedReach: '20,000-50,000',
      monthlyBudget: '$600-2000',
      benefits: ['Drive time exposure', 'Local community', 'Audio branding']
    },
    {
      id: 'community-events',
      name: 'Community Event Sponsorship',
      type: 'offline',
      description: 'Sponsor local events, festivals, and community gatherings',
      costTier: 'low',
      estimatedReach: '1,000-5,000',
      monthlyBudget: '$100-500',
      benefits: ['Community goodwill', 'Direct engagement', 'Brand awareness']
    }
  ];

  // Rule-based recommendation logic
  const recommendations = channels.map(channel => {
    let score = 0;
    let rationale = [];

    // Industry-based scoring
    if (business.industry === 'food-beverage') {
      if (channel.id === 'facebook-instagram') {
        score += 30;
        rationale.push('Visual platform perfect for showcasing food and atmosphere');
      }
      if (channel.id === 'yelp-ads') {
        score += 25;
        rationale.push('Customers actively search for restaurants on Yelp');
      }
      if (channel.id === 'community-events') {
        score += 20;
        rationale.push('Local food businesses benefit from community presence');
      }
    }

    if (business.industry === 'retail') {
      if (channel.id === 'google-ads') {
        score += 30;
        rationale.push('Captures high-intent shoppers searching for products');
      }
      if (channel.id === 'facebook-instagram') {
        score += 25;
        rationale.push('Great for showcasing products and driving store visits');
      }
    }

    if (business.industry === 'services') {
      if (channel.id === 'google-ads') {
        score += 35;
        rationale.push('Service businesses get discovered through search');
      }
      if (channel.id === 'local-print') {
        score += 20;
        rationale.push('Local services benefit from trusted print publications');
      }
    }

    // Budget-based scoring
    const budgetTier = business.budgetTier || 'medium';
    if (budgetTier === 'low' && channel.costTier === 'low') {
      score += 15;
      rationale.push('Fits your budget-conscious approach');
    }
    if (budgetTier === 'medium' && (channel.costTier === 'low' || channel.costTier === 'medium')) {
      score += 10;
      rationale.push('Good value for your budget range');
    }
    if (budgetTier === 'high') {
      score += 5;
      rationale.push('Premium option with maximum reach');
    }

    // Location and service area scoring
    if (business.serviceAtLocation && channel.id === 'yelp-ads') {
      score += 15;
      rationale.push('Perfect for businesses where customers visit your location');
    }

    if (business.serviceAtCustomerLocation && channel.id === 'google-ads') {
      score += 15;
      rationale.push('Ideal for reaching customers who need on-site services');
    }

    // Marketing goal scoring
    if (business.marketingGoal === 'increase-foot-traffic') {
      if (['yelp-ads', 'facebook-instagram', 'community-events'].includes(channel.id)) {
        score += 20;
        rationale.push('Excellent for driving physical store visits');
      }
    }

    if (business.marketingGoal === 'build-brand-awareness') {
      if (['facebook-instagram', 'radio-sponsorship', 'community-events'].includes(channel.id)) {
        score += 20;
        rationale.push('Strong brand building capabilities');
      }
    }

    if (business.marketingGoal === 'generate-leads') {
      if (['google-ads', 'facebook-instagram'].includes(channel.id)) {
        score += 25;
        rationale.push('Proven lead generation platform');
      }
    }

    // Age demographics scoring
    if (business.targetAgeGroups?.includes('18-24') || business.targetAgeGroups?.includes('25-34')) {
      if (channel.id === 'facebook-instagram') {
        score += 20;
        rationale.push('High engagement among younger demographics');
      }
    }

    if (business.targetAgeGroups?.includes('45-54') || business.targetAgeGroups?.includes('55-64')) {
      if (['local-print', 'radio-sponsorship'].includes(channel.id)) {
        score += 15;
        rationale.push('Effective reach for mature demographics');
      }
    }

    return {
      ...channel,
      score,
      rationale: rationale.slice(0, 2), // Limit to top 2 reasons
      recommended: score >= 15
    };
  });

  // Sort by score and return top recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(rec => ({
      id: rec.id,
      name: rec.name,
      type: rec.type,
      description: rec.description,
      costTier: rec.costTier,
      estimatedReach: rec.estimatedReach,
      monthlyBudget: rec.monthlyBudget,
      benefits: rec.benefits,
      rationale: rec.rationale,
      recommended: rec.recommended
    }));
}

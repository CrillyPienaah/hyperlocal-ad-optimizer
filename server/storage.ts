import { businesses, campaigns, campaignMetrics, type Business, type InsertBusiness, type Campaign, type InsertCampaign, type CampaignMetrics, type InsertCampaignMetrics } from "@shared/schema";

export interface IStorage {
  // Business operations
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByEmail(email: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, updates: Partial<InsertBusiness>): Promise<Business | undefined>;
  
  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByBusinessId(businessId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Campaign metrics operations
  getCampaignMetrics(campaignId: number): Promise<CampaignMetrics[]>;
  createCampaignMetrics(metrics: InsertCampaignMetrics): Promise<CampaignMetrics>;
  getBusinessMetricsSummary(businessId: number): Promise<{
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    activeCampaigns: number;
  }>;
}

export class MemStorage implements IStorage {
  private businesses: Map<number, Business>;
  private campaigns: Map<number, Campaign>;
  private campaignMetrics: Map<number, CampaignMetrics>;
  private currentBusinessId: number;
  private currentCampaignId: number;
  private currentMetricsId: number;

  constructor() {
    this.businesses = new Map();
    this.campaigns = new Map();
    this.campaignMetrics = new Map();
    this.currentBusinessId = 1;
    this.currentCampaignId = 1;
    this.currentMetricsId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo business
    const demoBusiness: Business = {
      id: 1,
      name: "Mike's Coffee Shop",
      email: "mike@coffeeshop.com",
      address: "123 Main Street, Downtown",
      phone: "(555) 123-4567",
      industry: "Food & Beverage",
      businessType: "restaurant",
      customBusinessType: null,
      description: "A cozy neighborhood coffee shop serving premium coffee, fresh pastries, and light meals. We focus on creating a welcoming community space for locals to work, meet, and relax.",
      isOnboardingComplete: true,
      createdAt: new Date(),
    };
    this.businesses.set(1, demoBusiness);
    this.currentBusinessId = 2;

    // Create demo campaigns
    const demoCampaigns: Campaign[] = [
      {
        id: 1,
        businessId: 1,
        name: "Holiday Coffee Special",
        type: "local-awareness",
        status: "active",
        targetLocation: "Downtown Area",
        targetRadius: "1.5",
        audienceType: "everyone",
        dailyBudget: "450.00",
        duration: "1-month",
        adContent: "Start your morning right with our fresh-brewed coffee and homemade pastries. Visit us today!",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        businessId: 1,
        name: "Student Discount Promo",
        type: "lead-generation",
        status: "paused",
        targetLocation: "University District",
        targetRadius: "2.0",
        audienceType: "recent-visitors",
        dailyBudget: "280.00",
        duration: "2-weeks",
        adContent: "Students get 20% off all drinks with valid ID!",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        businessId: 1,
        name: "Morning Rush Hour",
        type: "store-visits",
        status: "active",
        targetLocation: "Business District",
        targetRadius: "1.0",
        audienceType: "workers",
        dailyBudget: "320.00",
        duration: "ongoing",
        adContent: "Beat the morning rush with our express coffee service!",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    demoCampaigns.forEach(campaign => {
      this.campaigns.set(campaign.id, campaign);
    });
    this.currentCampaignId = 4;

    // Create demo metrics
    const demoMetrics: CampaignMetrics[] = [
      { id: 1, campaignId: 1, impressions: 12400, clicks: 396, spend: "2847.50", date: new Date() },
      { id: 2, campaignId: 2, impressions: 8700, clicks: 244, spend: "1680.00", date: new Date() },
      { id: 3, campaignId: 3, impressions: 15200, clicks: 623, spend: "3200.00", date: new Date() },
    ];

    demoMetrics.forEach(metrics => {
      this.campaignMetrics.set(metrics.id, metrics);
    });
    this.currentMetricsId = 4;
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinessByEmail(email: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(business => business.email === email);
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.currentBusinessId++;
    const business: Business = {
      ...insertBusiness,
      id,
      phone: insertBusiness.phone || null,
      customBusinessType: insertBusiness.customBusinessType || null,
      description: insertBusiness.description || null,
      isOnboardingComplete: insertBusiness.isOnboardingComplete || false,
      createdAt: new Date(),
    };
    this.businesses.set(id, business);
    return business;
  }

  async updateBusiness(id: number, updates: Partial<InsertBusiness>): Promise<Business | undefined> {
    const business = this.businesses.get(id);
    if (!business) return undefined;

    const updatedBusiness: Business = {
      ...business,
      ...updates,
      phone: updates.phone !== undefined ? updates.phone : business.phone,
      customBusinessType: updates.customBusinessType !== undefined ? updates.customBusinessType : business.customBusinessType,
      description: updates.description !== undefined ? updates.description : business.description,
      isOnboardingComplete: updates.isOnboardingComplete !== undefined ? updates.isOnboardingComplete : business.isOnboardingComplete,
    };
    this.businesses.set(id, updatedBusiness);
    return updatedBusiness;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByBusinessId(businessId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.businessId === businessId);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      status: insertCampaign.status || "active",
      adContent: insertCampaign.adContent || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign: Campaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date(),
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async getCampaignMetrics(campaignId: number): Promise<CampaignMetrics[]> {
    return Array.from(this.campaignMetrics.values()).filter(metrics => metrics.campaignId === campaignId);
  }

  async createCampaignMetrics(insertMetrics: InsertCampaignMetrics): Promise<CampaignMetrics> {
    const id = this.currentMetricsId++;
    const metrics: CampaignMetrics = {
      ...insertMetrics,
      id,
      impressions: insertMetrics.impressions || 0,
      clicks: insertMetrics.clicks || 0,
      spend: insertMetrics.spend || "0.00",
      date: new Date(),
    };
    this.campaignMetrics.set(id, metrics);
    return metrics;
  }

  async getBusinessMetricsSummary(businessId: number): Promise<{
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    activeCampaigns: number;
  }> {
    const businessCampaigns = await this.getCampaignsByBusinessId(businessId);
    const activeCampaigns = businessCampaigns.filter(c => c.status === 'active').length;
    
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    for (const campaign of businessCampaigns) {
      const metrics = await this.getCampaignMetrics(campaign.id);
      for (const metric of metrics) {
        totalSpend += parseFloat(metric.spend);
        totalImpressions += metric.impressions;
        totalClicks += metric.clicks;
      }
    }

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      activeCampaigns,
    };
  }
}

export const storage = new MemStorage();

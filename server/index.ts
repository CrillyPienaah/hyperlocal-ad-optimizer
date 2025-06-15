import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertBusinessSchema, insertCampaignSchema, insertCampaignMetricsSchema, businessProfileSchema, locationProfileSchema, audienceProfileSchema, budgetProfileSchema } from "../shared/schema";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from 'url';
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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

// Business profile location route for step 2 onboarding
app.put("/api/business-profile/:id/location", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = locationProfileSchema.parse(req.body);
    
    const business = await storage.updateBusiness(id, validatedData);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    res.json(business);
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

// Business profile audience route for step 3 onboarding
app.put("/api/business-profile/:id/audience", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = audienceProfileSchema.parse(req.body);
    
    // Convert arrays to JSON strings for storage
    const storageData = {
      ...validatedData,
      targetAgeGroups: JSON.stringify(validatedData.targetAgeGroups),
      customerInterests: JSON.stringify(validatedData.customerInterests),
    };
    
    const business = await storage.updateBusiness(id, storageData);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    res.json(business);
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

// Business profile budget route for step 4 onboarding
app.put("/api/business-profile/:id/budget", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = budgetProfileSchema.parse(req.body);
    
    // Mark onboarding as complete when budget is set
    const storageData = {
      ...validatedData,
      isOnboardingComplete: true,
    };
    
    const business = await storage.updateBusiness(id, storageData);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    res.json(business);
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

// Get complete business profile
app.get("/api/business-profile/:id", async (req, res) => {
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

// Get complete business profile with formatted data and validation
app.get("/api/business-profile/:id/complete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const business = await storage.getBusiness(id);
    
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Parse JSON fields and format data
    const profile = {
      ...business,
      targetAgeGroups: business.targetAgeGroups ? JSON.parse(business.targetAgeGroups) : [],
      customerInterests: business.customerInterests ? JSON.parse(business.customerInterests) : [],
      serviceAreas: business.serviceAreas ? business.serviceAreas.split(', ') : [],
      completeness: {
        business: !!(business.name && business.email && business.address && business.industry && business.businessType),
        location: !!(business.city && business.primaryNeighborhood && business.serviceAreas),
        audience: !!(business.customerDescription && business.targetAgeGroups && business.customerInterests && business.communityInvolvement),
        budget: !!(business.budgetTier && business.budgetTimeframe && business.marketingGoal),
        overall: business.isOnboardingComplete
      }
    };
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Export business profile as JSON
app.get("/api/business-profile/:id/export", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const business = await storage.getBusiness(id);
    
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Create formatted export data
    const exportData = {
      businessProfile: {
        generatedAt: new Date().toISOString(),
        businessInfo: {
          name: business.name,
          email: business.email,
          phone: business.phone,
          address: business.address,
          industry: business.industry,
          businessType: business.businessType,
          customBusinessType: business.customBusinessType,
          description: business.description
        },
        locationDetails: {
          city: business.city,
          primaryNeighborhood: business.primaryNeighborhood,
          serviceAreas: business.serviceAreas ? business.serviceAreas.split(', ') : [],
          serviceRadius: business.serviceRadius,
          serviceAtLocation: business.serviceAtLocation,
          serviceAtCustomerLocation: business.serviceAtCustomerLocation
        },
        targetAudience: {
          customerDescription: business.customerDescription,
          targetAgeGroups: business.targetAgeGroups ? JSON.parse(business.targetAgeGroups) : [],
          customerInterests: business.customerInterests ? JSON.parse(business.customerInterests) : [],
          communityInvolvement: business.communityInvolvement
        },
        budgetAndGoals: {
          budgetTier: business.budgetTier,
          budgetTimeframe: business.budgetTimeframe,
          marketingGoal: business.marketingGoal
        },
        metadata: {
          profileComplete: business.isOnboardingComplete,
          createdAt: business.createdAt,
          lastUpdated: new Date().toISOString()
        }
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_profile.json"`);
    res.json(exportData);
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

// AI-powered ad copy generation endpoint
app.post("/api/content/generate-copy", async (req, res) => {
  try {
    const { businessId, campaignGoal, keyMessage, tone, ctaStyle, selectedChannels } = req.body;
    
    if (!businessId || !campaignGoal || !keyMessage || !tone || !ctaStyle) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get business profile for context
    const business = await storage.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Generate AI-powered ad copy variations
    const copyVariations = await generateAdCopyVariations({
      business,
      campaignGoal,
      keyMessage,
      tone,
      ctaStyle,
      selectedChannels: selectedChannels || []
    });

    res.json({ variations: copyVariations });
  } catch (error) {
    console.error("Error generating ad copy:", error);
    res.status(500).json({ message: "Failed to generate ad copy" });
  }
});

// AI ad copy generation function
async function generateAdCopyVariations(params: {
  business: any;
  campaignGoal: string;
  keyMessage: string;
  tone: string;
  ctaStyle: string;
  selectedChannels: string[];
}) {
  const { business, campaignGoal, keyMessage, tone, ctaStyle, selectedChannels } = params;

  // Build context-aware prompt
  const businessContext = `
Business: ${business.name}
Industry: ${business.industry}
Location: ${business.city}
Description: ${business.description || 'Local business'}
Target Audience: ${business.customerDescription || 'Local customers'}
Service Type: ${business.serviceAtLocation ? 'In-store visits' : business.serviceAtCustomerLocation ? 'On-site service' : 'Mixed service model'}
`;

  const channelContext = selectedChannels.length > 0 
    ? `Selected Marketing Channels: ${selectedChannels.join(', ')}`
    : '';

  const prompt = `Create 3 distinct advertising copy variations for a local business campaign.

${businessContext}

Campaign Details:
- Goal: ${campaignGoal}
- Key Message: ${keyMessage}
- Tone: ${tone}
- Call-to-Action Style: ${ctaStyle}
${channelContext}

Requirements:
- Each variation should be unique and compelling
- Include attention-grabbing headlines
- Body text should be concise but persuasive
- Include strong call-to-action based on the specified style
- Tailor language to the business's local market
- Consider the target audience and industry context
- Keep each variation under 150 words total

Response format (JSON):
{
  "variations": [
    {
      "id": 1,
      "headline": "Compelling headline here",
      "body": "Persuasive body text that connects with local customers...",
      "cta": "Strong call-to-action",
      "style": "Brief description of the approach used"
    },
    {
      "id": 2,
      "headline": "Different headline approach",
      "body": "Alternative body text with different angle...",
      "cta": "Different call-to-action",
      "style": "Brief description of the approach used"
    },
    {
      "id": 3,
      "headline": "Third unique headline",
      "body": "Third variation with unique messaging...",
      "cta": "Third call-to-action variation",
      "style": "Brief description of the approach used"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert copywriter specializing in local business advertising. Create compelling, authentic ad copy that resonates with local audiences and drives action."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.variations || [];
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate ad copy variations");
  }
}

// AI copywriting assistant endpoint with emoji suggestions
app.post("/api/content/copywriting-assistant", async (req, res) => {
  try {
    const { businessId, prompt, assistantType = "playful" } = req.body;
    
    if (!businessId || !prompt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get business profile for context
    const business = await storage.getBusiness(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Generate playful assistant response with emojis
    const assistantResponse = await generateCopywritingAssistance({
      business,
      prompt,
      assistantType
    });

    res.json(assistantResponse);
  } catch (error) {
    console.error("Error generating copywriting assistance:", error);
    res.status(500).json({ message: "Failed to generate copywriting assistance" });
  }
});

// New simplified ad copy generation endpoint for HTML frontend
app.post("/api/generate-ad-copy", async (req, res) => {
  try {
    const { businessDescription, targetAudience, campaignGoal, adPlatform, tone } = req.body;
    
    if (!businessDescription || !targetAudience || !campaignGoal || !adPlatform) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a mock business object for the existing function
    const mockBusiness = {
      name: "Your Business",
      industry: "General",
      city: "Local Area",
      description: businessDescription,
      customerDescription: targetAudience,
      serviceAtLocation: true,
      serviceAtCustomerLocation: false
    };

    // Map frontend goals to backend format
    const goalMapping = {
      'traffic': 'Drive website traffic',
      'awareness': 'Increase brand awareness', 
      'leads': 'Generate leads',
      'sales': 'Boost sales',
      'engagement': 'Increase engagement'
    };

    // Generate AI-powered ad copy variations
    const copyVariations = await generateAdCopyVariations({
      business: mockBusiness,
      campaignGoal: goalMapping[campaignGoal] || campaignGoal,
      keyMessage: businessDescription,
      tone: tone || 'professional',
      ctaStyle: 'action-oriented',
      selectedChannels: [adPlatform]
    });

    res.json({ variations: copyVariations });
  } catch (error) {
    console.error("Error generating ad copy:", error);
    res.status(500).json({ message: "Failed to generate ad copy" });
  }
});

// AI copywriting assistant function
async function generateCopywritingAssistance(params: {
  business: any;
  prompt: string;
  assistantType: string;
}) {
  const { business, prompt, assistantType } = params;

  const systemPrompt = assistantType === "playful" 
    ? `You are a playful, creative copywriting assistant who loves helping small businesses shine! You're enthusiastic, encouraging, and always sprinkle in relevant emojis to make your responses delightful. Your personality is bubbly and supportive, like a creative friend who genuinely cares about making businesses successful.

Key traits:
- Use 2-4 relevant emojis per response (not overwhelming)
- Be encouraging and positive
- Offer specific, actionable advice
- Reference the business context when relevant
- Keep responses conversational and fun
- Suggest creative angles and fresh perspectives`
    : `You are a professional copywriting consultant who provides expert advice with subtle emoji accents for clarity and engagement. You balance professionalism with approachability.`;

  const businessContext = `
Business: ${business.name}
Industry: ${business.industry}
Location: ${business.city}
Description: ${business.description || 'Local business'}
Target Audience: ${business.customerDescription || 'Local customers'}
`;

  const userPrompt = `${businessContext}

User Request: ${prompt}

Please provide helpful copywriting advice, suggestions, or improvements. If they're asking for copy ideas, provide 2-3 specific examples. If they need feedback on existing copy, give constructive suggestions with improvements.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    const assistantReply = response.choices[0].message.content || "";
    
    // Suggest emojis based on business industry and general mood emojis
    const industryEmojis = getIndustryEmojis(business.industry);
    const moodEmojis = ["✨", "🎉", "💡", "🚀", "💪", "👏", "🌟", "🔥", "💯", "🎯"];
    
    const allEmojis: string[] = [];
    industryEmojis.forEach(emoji => allEmojis.push(emoji));
    moodEmojis.forEach(emoji => allEmojis.push(emoji));
    
    const uniqueEmojis = allEmojis.filter((emoji, index) => allEmojis.indexOf(emoji) === index);
    const emojiSuggestions = uniqueEmojis.slice(0, 12);

    return {
      response: assistantReply,
      emojiSuggestions,
      assistantType,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate copywriting assistance");
  }
}

// Get industry-specific emojis
function getIndustryEmojis(industry: string): string[] {
  const industryEmojiMap: Record<string, string[]> = {
    'food-beverage': ['🍕', '☕', '🍰', '🥘', '🍷', '🍔', '🥗', '🍜'],
    'retail': ['🛍️', '👕', '👠', '💎', '🛒', '🏪', '💰', '🎁'],
    'services': ['🔧', '💼', '📞', '🏠', '🚗', '💻', '📋', '⚡'],
    'healthcare': ['🏥', '💊', '🩺', '❤️', '🧘', '🌿', '💚', '🏃'],
    'fitness': ['💪', '🏋️', '🧘', '🏃', '⚡', '🎯', '🔥', '💚'],
    'beauty': ['💄', '💅', '✨', '🌸', '💆', '🧴', '💎', '🌺'],
    'education': ['📚', '🎓', '💡', '🧠', '📝', '🏫', '⭐', '🎯'],
    'technology': ['💻', '📱', '⚡', '🔧', '🚀', '💡', '🌐', '⚙️']
  };
  
  return industryEmojiMap[industry] || ['✨', '💡', '🚀', '💪', '🌟', '🎯'];
}

// Enhanced channel recommendation with detailed analytics
function generateChannelRecommendations(business: any) {
  const channels = [
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: 'Search and display advertising on Google\'s network',
      costTier: 'medium',
      estimatedCost: '$300-800/month',
      expectedReach: '10,000-25,000 impressions',
      difficulty: 'Medium',
      timeToSee: '1-2 weeks',
      pros: [
        'High-intent customers actively searching',
        'Measurable ROI and detailed analytics',
        'Local targeting with location extensions',
        'Control over budget and bidding'
      ],
      cons: [
        'Requires keyword research and optimization',
        'Can be competitive in popular industries',
        'Learning curve for campaign management'
      ],
      recommendedFor: ['services', 'retail', 'high-intent purchases'],
      icon: 'google-ads'
    },
    {
      id: 'facebook-ads',
      name: 'Facebook & Instagram Ads',
      description: 'Social media advertising across Meta\'s platforms',
      costTier: 'low',
      estimatedCost: '$200-600/month',
      expectedReach: '15,000-40,000 impressions',
      difficulty: 'Easy',
      timeToSee: '3-7 days',
      pros: [
        'Detailed demographic and interest targeting',
        'Visual storytelling with photos and videos',
        'Strong local community engagement',
        'Cost-effective for brand awareness'
      ],
      cons: [
        'Lower purchase intent than search ads',
        'Requires engaging visual content',
        'Algorithm changes can affect reach'
      ],
      recommendedFor: ['food-beverage', 'retail', 'community-focused'],
      icon: 'facebook-ads'
    },
    {
      id: 'instagram-ads',
      name: 'Instagram Advertising',
      description: 'Visual advertising on Instagram platform',
      costTier: 'low',
      estimatedCost: '$150-500/month',
      expectedReach: '12,000-30,000 impressions',
      difficulty: 'Easy',
      timeToSee: '2-5 days',
      pros: [
        'Highly visual platform perfect for products',
        'Strong engagement with younger demographics',
        'Stories and Reels for creative content',
        'Influencer collaboration opportunities'
      ],
      cons: [
        'Requires high-quality visual content',
        'Younger audience may not fit all businesses',
        'Limited text in ad creatives'
      ],
      recommendedFor: ['beauty', 'food-beverage', 'lifestyle'],
      icon: 'instagram-ads'
    },
    {
      id: 'linkedin-ads',
      name: 'LinkedIn Advertising',
      description: 'Professional network advertising for B2B targeting',
      costTier: 'high',
      estimatedCost: '$500-1500/month',
      expectedReach: '5,000-15,000 impressions',
      difficulty: 'Hard',
      timeToSee: '2-4 weeks',
      pros: [
        'Professional audience with higher income',
        'Precise job title and industry targeting',
        'B2B lead generation capabilities',
        'Decision-maker reach'
      ],
      cons: [
        'Higher cost per click than other platforms',
        'Limited effectiveness for B2C businesses',
        'Professional content requirements'
      ],
      recommendedFor: ['services', 'B2B', 'professional-services'],
      icon: 'linkedin-ads'
    },
    {
      id: 'local-radio',
      name: 'Local Radio Advertising',
      description: 'Traditional radio spots on local stations',
      costTier: 'medium',
      estimatedCost: '$400-1200/month',
      expectedReach: '20,000-60,000 listeners',
      difficulty: 'Medium',
      timeToSee: '2-6 weeks',
      pros: [
        'Broad local market coverage',
        'Trusted medium with loyal listeners',
        'Drive-time audience engagement',
        'Audio branding opportunities'
      ],
      cons: [
        'Difficult to track direct ROI',
        'Less precise targeting than digital',
        'Production costs for quality ads'
      ],
      recommendedFor: ['automotive', 'healthcare', 'home-services'],
      icon: 'local-radio'
    },
    {
      id: 'email-marketing',
      name: 'Email Marketing',
      description: 'Direct email campaigns to customer lists',
      costTier: 'low',
      estimatedCost: '$50-200/month',
      expectedReach: '500-5,000 emails',
      difficulty: 'Easy',
      timeToSee: '1-3 days',
      pros: [
        'Direct communication with customers',
        'High ROI when done correctly',
        'Personalization and automation options',
        'Builds long-term customer relationships'
      ],
      cons: [
        'Requires building an email list',
        'Spam filters can limit delivery',
        'Need compelling content to avoid unsubscribes'
      ],
      recommendedFor: ['retail', 'services', 'repeat-customers'],
      icon: 'email-marketing'
    },
    {
      id: 'social-media',
      name: 'Organic Social Media',
      description: 'Building community through regular social posts',
      costTier: 'low',
      estimatedCost: '$100-400/month',
      expectedReach: '1,000-10,000 followers',
      difficulty: 'Medium',
      timeToSee: '4-12 weeks',
      pros: [
        'Cost-effective brand building',
        'Direct customer engagement',
        'User-generated content opportunities',
        'Community building and loyalty'
      ],
      cons: [
        'Requires consistent content creation',
        'Organic reach is declining',
        'Time-intensive to build following'
      ],
      recommendedFor: ['all-businesses', 'community-focused', 'brand-building'],
      icon: 'social-media'
    },
    {
      id: 'seo',
      name: 'Search Engine Optimization',
      description: 'Improving organic search visibility and rankings',
      costTier: 'medium',
      estimatedCost: '$300-800/month',
      expectedReach: '2,000-15,000 monthly visits',
      difficulty: 'Hard',
      timeToSee: '3-6 months',
      pros: [
        'Long-term sustainable traffic',
        'High-quality, intent-driven visitors',
        'Builds authority and credibility',
        'Cost-effective once established'
      ],
      cons: [
        'Takes months to see significant results',
        'Requires technical knowledge',
        'Algorithm changes can affect rankings'
      ],
      recommendedFor: ['services', 'content-rich', 'long-term-strategy'],
      icon: 'seo'
    }
  ];

  // Enhanced scoring algorithm
  const recommendations = channels.map(channel => {
    let score = 0;
    let rationale = [];

    // Industry-specific scoring with detailed logic
    const industryScoring = {
      'food-beverage': {
        'facebook-ads': { score: 35, reason: 'Visual platform perfect for showcasing food, atmosphere, and customer experiences' },
        'instagram-ads': { score: 30, reason: 'Highly visual content drives appetite appeal and location visits' },
        'social-media': { score: 25, reason: 'Build community around food culture and customer loyalty' },
        'email-marketing': { score: 20, reason: 'Effective for promotions, events, and repeat customer engagement' }
      },
      'retail': {
        'google-ads': { score: 35, reason: 'Captures high-intent shoppers actively searching for products' },
        'facebook-ads': { score: 30, reason: 'Excellent for product showcasing and driving store visits' },
        'instagram-ads': { score: 28, reason: 'Visual platform ideal for product discovery and lifestyle marketing' },
        'email-marketing': { score: 25, reason: 'Drive repeat purchases and announce new inventory' }
      },
      'services': {
        'google-ads': { score: 40, reason: 'Service businesses are discovered primarily through search queries' },
        'seo': { score: 30, reason: 'Long-term strategy for establishing service authority and expertise' },
        'linkedin-ads': { score: 25, reason: 'Professional services benefit from B2B networking platform' },
        'local-radio': { score: 20, reason: 'Builds trust and credibility for local service providers' }
      },
      'healthcare': {
        'google-ads': { score: 35, reason: 'Patients search for healthcare providers and services online' },
        'seo': { score: 30, reason: 'Establish medical authority and attract organic patient traffic' },
        'local-radio': { score: 25, reason: 'Trusted medium for healthcare advertising in local markets' },
        'social-media': { score: 20, reason: 'Build patient education and community health awareness' }
      }
    };

    const industryRecs = (industryScoring as any)[business.industry] || {};
    const channelRec = industryRecs[channel.id];
    if (channelRec) {
      score += (channelRec as any).score;
      rationale.push((channelRec as any).reason);
    }

    // Budget alignment scoring
    const budgetMap = {
      '50-200': 'low',
      '201-500': 'low-medium', 
      '501-1000': 'medium',
      '1000+': 'high'
    };
    
    const userBudgetTier = budgetMap[business.budgetTier as keyof typeof budgetMap] || 'medium';
    
    if (userBudgetTier === 'low' && channel.costTier === 'low') {
      score += 20;
      rationale.push('Fits perfectly within your budget constraints while delivering strong ROI');
    } else if (userBudgetTier === 'medium' && (channel.costTier === 'low' || channel.costTier === 'medium')) {
      score += 15;
      rationale.push('Good value proposition for your budget range with scalable options');
    } else if (userBudgetTier === 'high') {
      score += 10;
      rationale.push('Premium channel option with maximum reach and targeting capabilities');
    }

    // Service model scoring
    if (business.serviceAtLocation && ['facebook-ads', 'instagram-ads', 'google-ads'].includes(channel.id)) {
      score += 15;
      rationale.push('Excellent for driving foot traffic to your physical location');
    }

    if (business.serviceAtCustomerLocation && ['google-ads', 'seo', 'local-radio'].includes(channel.id)) {
      score += 15;
      rationale.push('Ideal for reaching customers who need on-site or mobile services');
    }

    // Target audience alignment
    const ageGroups = business.targetAgeGroups ? JSON.parse(business.targetAgeGroups) : [];
    if (ageGroups.includes('18-24') || ageGroups.includes('25-34')) {
      if (['instagram-ads', 'social-media'].includes(channel.id)) {
        score += 15;
        rationale.push('Strong alignment with younger demographic preferences and platform usage');
      }
    }

    if (ageGroups.includes('35-44') || ageGroups.includes('45-54')) {
      if (['facebook-ads', 'email-marketing', 'google-ads'].includes(channel.id)) {
        score += 12;
        rationale.push('Excellent reach among established professionals and decision-makers');
      }
    }

    // Community involvement bonus
    if (business.communityInvolvement === 'high' && ['social-media', 'local-radio', 'email-marketing'].includes(channel.id)) {
      score += 10;
      rationale.push('Leverages your strong community presence and local relationships');
    }

    return {
      ...channel,
      suitabilityScore: Math.min(100, Math.max(0, score)),
      rationale: rationale.slice(0, 3)
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const primaryChannels = recommendations.filter(ch => ch.suitabilityScore >= 70).slice(0, 3);
  const secondaryChannels = recommendations.filter(ch => ch.suitabilityScore >= 40 && ch.suitabilityScore < 70);
  const budgetOptimized = recommendations
    .filter(ch => ch.costTier === 'low' || ch.costTier === 'medium')
    .sort((a, b) => (b.suitabilityScore / getCostScore(b.costTier)) - (a.suitabilityScore / getCostScore(a.costTier)))
    .slice(0, 3);

  return {
    primaryChannels,
    secondaryChannels,
    budgetOptimized,
    totalRecommendations: recommendations.length
  };
}

function getCostScore(costTier: string): number {
  const scores = { 'low': 1, 'medium': 2, 'high': 3 };
  return scores[costTier as keyof typeof scores] || 2;
}

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
    console.error("Channel recommendations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Serve static files based on environment
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.resolve(__dirname, '../dist/public');
  app.use(express.static(staticPath));
  
  // Catch-all handler for SPA in production
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.resolve(staticPath, 'index.html'));
  });
} else {
  // Development mode - use built client files
  const clientDistPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));
  
  // Catch-all handler for development
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

const server = createServer(app);
const PORT = parseInt(process.env.PORT || '5000');

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

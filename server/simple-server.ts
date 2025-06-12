import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertBusinessSchema, insertCampaignSchema, insertCampaignMetricsSchema, businessProfileSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

// Serve static files
const staticPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(staticPath));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return;
  res.sendFile(path.resolve(staticPath, 'index.html'));
});

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
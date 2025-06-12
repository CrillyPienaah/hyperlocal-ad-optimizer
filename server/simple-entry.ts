import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API routes
await registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  // Development mode - serve the client HTML directly
  const clientPath = path.resolve(__dirname, "..", "client");
  app.use(express.static(clientPath));
  
  app.get("*", (req, res) => {
    const indexPath = path.resolve(clientPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Development server not properly configured");
    }
  });
}

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 5000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
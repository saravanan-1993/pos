const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB, disconnectDB } = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;


// Import routes
const routes = require("./routes");

// Allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  "http://localhost:3000",
  "http://localhost:5000",
  "https://pos-fawn-beta.vercel.app",
  "https://pos-zk34.vercel.app"
  
].filter(Boolean).map(origin => origin.replace(/\/$/, "")); // Normalize by removing trailing slashes

console.log("🔒 CORS Configuration:");
console.log("   Allowed Origins:", allowedOrigins);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // Normalize origin for comparison
      const normalizedOrigin = origin.replace(/\/$/, "");
      
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS: Blocked request from origin: ${origin}`);
        // Instead of erroring, we allow the request but won't set CORS headers
        // This helps in debugging and prevents the middleware from crashing the request
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(express.json());
app.use(cookieParser());

// Ensure initialization completes before handling requests (for Vercel)
app.use(async (req, res, next) => {
  
  next();
});



// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Monolith] ${req.method} ${req.path}`);
  next();
});

// Root route - Backend status
app.get('/', (req, res) => {
  res.json({
    message: 'Monolith E-Commerce Backend is running',
    version: '1.0.0',
    architecture: 'monolith',
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints: {
      api: '/api',
     
      docs: 'All API routes are prefixed with /api'
    }
  });
});

// Mount routes with /api prefix
app.use('/api', routes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    message: "API endpoint not found. Please check the route and try again.",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[Monolith Error]", err);
  
  // Ensure CORS headers are present even on errors
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.name || "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, async () => {
  try {
    // Connect to database and initialize admin
    await connectDB();
   
    console.log("═══════════════════════════════════════════════════");
    console.log("✅ Monolith E-Commerce Backend Started Successfully");
    console.log("═══════════════════════════════════════════════════");
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
    console.log(`🗄️  Database: ${process.env.MONGO_URL?.split('/').pop()?.split('?')[0] || "monolith-ecommerce"}`);
    console.log("═══════════════════════════════════════════════════");
    console.log("📡 API Routes:");
    console.log("   /api/admin/auth/* - Admin authentication endpoints");
    console.log("   /health - Health check");
    console.log("═══════════════════════════════════════════════════");
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    console.error("   Error details:", error.message);
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await disconnectDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  await disconnectDB();
  process.exit(0);
});

// Export app for Vercel
module.exports = app;

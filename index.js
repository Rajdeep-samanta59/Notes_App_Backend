import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Try to load dotenv at runtime when available (local development).
// Use dynamic import so missing dotenv doesn't cause module resolution to fail in production.
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (err) {
  // dotenv not available (likely running in production environment where env vars are provided by the host)
}

// Import DB and routes after dotenv has loaded so process.env values are present
const { connectDB } = await import("./db.js");
const { default: router } = await import("./routes/route.js");

const app = express();
app.use(express.json());

// Configure CORS to accept requests from multiple origins.
// Supports comma-separated ALLOWED_ORIGIN env var and allows vercel preview domains.
const rawAllowed = process.env.ALLOWED_ORIGIN || process.env.ALLOWED_ORIGINS || '';
let allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);
// Ensure localhost dev URLs are allowed
allowedOrigins = Array.from(new Set([...allowedOrigins, 'http://localhost:5173', 'http://localhost:5174']));
const allowAll = allowedOrigins.includes('*');

app.use(cors({
  origin: function(origin, callback) {
    // Debug logging to Render logs for troubleshooting
    try { console.log('CORS check - origin:', origin, 'allowedOrigins:', allowedOrigins); } catch(e){}

    // Allow server-side requests (no origin) and Postman
    if (!origin) return callback(null, true);
    if (allowAll) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow Vercel preview domains and vercel.app/.vercel.sh patterns
    try {
      const low = origin.toLowerCase();
      if (low.endsWith('.vercel.app') || low.endsWith('.vercel.sh')) return callback(null, true);
    } catch (e) {}

    return callback(new Error('CORS policy violation: origin not allowed ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);  

app.get("/", (req, res) => {
  res.send(" Server is running Smooth!");
});


const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 8000, () =>
      console.log(`Server is running successfully on PORT ${process.env.PORT || 8000}`)
    );
  } catch (err) {
    console.error('DB connection failed', err);
    process.exit(1);
  }
};

startServer();

export default app;
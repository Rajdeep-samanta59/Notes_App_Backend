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

// small, tolerant CORS (supports comma-separated ALLOWED_ORIGIN, allows vercel previews)
const rawAllowed = process.env.ALLOWED_ORIGIN || process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawAllowed.split(',').map(s => s.trim()).filter(Boolean);
const allowAll = allowedOrigins.includes('*');

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server/Postman
    if (allowAll) return cb(null, true); // wildcard allowed
    if (allowedOrigins.includes(origin)) return cb(null, true); // exact match
    const low = (origin || '').toLowerCase();
    if (low.endsWith('.vercel.app') || low.endsWith('.vercel.sh')) return cb(null, true); // allow previews
    return cb(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
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
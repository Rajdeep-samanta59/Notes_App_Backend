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

// Configure CORS to accept requests from multiple origins
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5173',
  'https://notes-app-omega-ruby.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'));
    }
    return callback(null, true);
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
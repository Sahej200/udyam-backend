const express = require("express");
const { PrismaClient } = require("@prisma/client");
const z = require("zod");
const cors = require("cors");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);

    // Match exact origin or wildcard subdomains for Vercel
    const isAllowed =
      allowedOrigins.includes(origin) ||
      allowedOrigins.some((ao) => ao.includes("*") && origin.endsWith(ao.replace("*", "")));

    if (isAllowed) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight

app.use(express.json());

// ✅ Zod validation schema
const submissionSchema = z.object({
  hasAadhaar: z.string().optional(),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Invalid Aadhaar")
    .max(12)
    .optional(),
  name: z.string().min(1, "Required").optional(),
  otp: z.string().max(6).optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN")
    .max(10)
    .optional(),
});

// ✅ POST route
app.post("/api/submit", async (req, res) => {
  try {
    const data = submissionSchema.parse(req.body);
    const submission = await prisma.submission.create({ data });
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

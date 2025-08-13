const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// ✅ Read allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Handle preflight everywhere

app.use(express.json());

// ✅ Zod validation schema
const submissionSchema = z.object({
  hasAadhaar: z.string().optional(),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Invalid Aadhaar').max(12).optional(),
  name: z.string().min(1, 'Required').optional(),
  otp: z.string().max(6).optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN').max(10).optional(),
});

// ✅ POST route
app.post('/api/submit', async (req, res) => {
  try {
    const data = submissionSchema.parse(req.body);
    const submission = await prisma.submission.create({ data });
    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

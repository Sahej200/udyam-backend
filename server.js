const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// CORS configuration for the specific Vercel frontend origin
const corsOptions = {
  origin: 'https://udyam-frontend-fuzhd40f0-sahej-prakashs-projects.vercel.app', // Your exact Vercel URL
  methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  optionsSuccessStatus: 200 // Respond 200 to OPTIONS
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests
app.options('/api/submit', cors(corsOptions));

const submissionSchema = z.object({
  hasAadhaar: z.string().optional(),
  aadhaarNumber: z.string().regex(/\d{12}/, 'Invalid Aadhaar').max(12).optional(),
  name: z.string().min(1, 'Required').optional(),
  otp: z.string().max(6).optional(),
  panNumber: z.string().regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Invalid PAN').max(10).optional(),
});

app.post('/api/submit', async (req, res) => {
  try {
    const data = submissionSchema.parse(req.body);
    const submission = await prisma.submission.create({ data });
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
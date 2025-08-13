const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// Enable CORS for the specific Vercel frontend origin
app.use(cors({
  origin: 'https://udyam-frontend-fuzhd40f0-sahej-prakashs-projects.vercel.app', // Your Vercel URL
  methods: ['GET', 'POST', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type'] // Allow necessary headers
}));

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
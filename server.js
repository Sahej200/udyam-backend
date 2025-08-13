const express = require('express');
const { PrismaClient } = require('@prisma/client');
const z = require('zod');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

// ✅ Fixed allowed production domains (add your final one here)
const allowedOrigins = [
  'https://udyam-frontend.vercel.app', // your final production domain
];

// ✅ Dynamic CORS: allow all Vercel previews + fixed domains
const corsOptions = {
  origin: function (origin, callback) {
    try {
      // Allow requests with no origin (e.g., curl, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      const hostname = new URL(origin).hostname;

      if (
        allowedOrigins.includes(origin) || // explicitly allowed domains
        hostname.endsWith('.vercel.app') // allow any vercel.app subdomain
      ) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    } catch (err) {
      callback(new Error('Invalid Origin'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// ✅ Handle preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// ✅ Zod validation schema
const submissionSchema = z.object({
  hasAadhaar: z.string().optional(),
  aadhaarNumber: z.string()
    .regex(/^\d{12}$/, 'Invalid Aadhaar')
    .max(12)
    .optional(),
  name: z.string().min(1, 'Required').optional(),
  otp: z.string().max(6).optional(),
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN')
    .max(10)
    .optional(),
});

// ✅ POST route
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
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

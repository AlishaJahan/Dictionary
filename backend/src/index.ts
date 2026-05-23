import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dictionaryRoutes from './routes/dictionaryRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for frontend address
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());

// Main Root Endpoint for status checks
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to the Bilingual English-Hindi Dictionary API Server',
    endpoints: {
      search: '/api/dictionary/search?q=<word>&mode=en-hi|hi-en',
      suggest: '/api/dictionary/suggest?q=<prefix>&mode=en-hi|hi-en'
    }
  });
});

// Register API Routes
app.use('/api/dictionary', dictionaryRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Bilingual Dictionary API Server listening on:      `);
  console.log(`  👉 http://localhost:${PORT}                       `);
  console.log(`====================================================`);
});

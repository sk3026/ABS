import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/database.js';
import { EmailService } from './services/EmailService.js';
import { authMiddleware, errorHandler } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware
app.use(express.json());

// Initialize services
EmailService.initialize();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

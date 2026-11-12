import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

// ── Route imports ─────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import budgetRoutes from './routes/budgets.routes.js';
import savingsGoalRoutes from './routes/savingsGoals.routes.js';
import recurringTransactionRoutes from './routes/recurringTransactions.routes.js';
import nutritionRoutes from './routes/nutrition.routes.js';
import dietPlanRoutes from './routes/dietPlans.routes.js';
import fitnessRoutes from './routes/fitness.routes.js';
import groceryRoutes from './routes/grocery.routes.js';
import aiRoutes from './routes/ai.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_PREFIX = `/api/${env.API_VERSION}`;

// Trust reverse proxies (Render, Vercel, Railway, Heroku, AWS, Cloudflare, Nginx)
app.set('trust proxy', 1);

// ── Security middleware ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow Swagger UI & inline styles
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const configuredOrigins = (env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8081', // Expo dev server
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(normalized) ||
        allowedOrigins.includes('*') ||
        (process.env.NODE_ENV !== 'production' && normalized.startsWith('http://localhost:'))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// ── HTTP logging ──────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      skip: (req) => req.url === '/health',
    })
  );
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use(API_PREFIX, apiLimiter);

// ── Health check (unauthenticated) ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LifeTrack API is running',
    version: env.API_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/transactions`, transactionRoutes);
app.use(`${API_PREFIX}/finance/transactions`, transactionRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/finance/categories`, categoryRoutes);
app.use(`${API_PREFIX}/budgets`, budgetRoutes);
app.use(`${API_PREFIX}/finance/budgets`, budgetRoutes);
app.use(`${API_PREFIX}/savings-goals`, savingsGoalRoutes);
app.use(`${API_PREFIX}/finance/savings-goals`, savingsGoalRoutes);
app.use(`${API_PREFIX}/recurring-transactions`, recurringTransactionRoutes);
app.use(`${API_PREFIX}/finance/recurring-transactions`, recurringTransactionRoutes);
app.use(`${API_PREFIX}/nutrition`, nutritionRoutes);
app.use(`${API_PREFIX}/diet-plans`, dietPlanRoutes);
app.use(`${API_PREFIX}/fitness`, fitnessRoutes);
app.use(`${API_PREFIX}/grocery`, groceryRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/reports`, reportsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationsRoutes);

// ── Swagger API docs ──────────────────────────────────────────────────────────
if (env.SWAGGER_ENABLED) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'LifeTrack API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
      },
    })
  );
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// ── Optional Frontend Static Files (Unified Monolithic Deployment) ─────────────
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), 'public'),
];

const staticDistPath = possibleDistPaths.find(
  (p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))
);

if (staticDistPath) {
  app.use(express.static(staticDistPath));

  // SPA fallback for HTML5 client-side navigation
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/api-docs')
    ) {
      return next();
    }
    res.sendFile(path.join(staticDistPath, 'index.html'));
  });
}

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
});

// ── Global error handler (must be last, 4 args) ───────────────────────────────
app.use(errorMiddleware);

export default app;


import 'dotenv/config';

// ─── Environment variable loader & validator ────────────────────────────────
// All environment access should happen through this module so missing values
// are caught at startup rather than at runtime.

const required = (key) => {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

const optional = (key, defaultValue = '') => process.env[key] ?? defaultValue;

export const env = {
  // Server
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '5000'), 10),
  API_VERSION: optional('API_VERSION', 'v1'),
  IS_PRODUCTION: optional('NODE_ENV', 'development') === 'production',

  // MongoDB
  MONGODB_URI: optional('MONGODB_URI', 'mongodb://127.0.0.1:27017/lifetrack'),

  // JWT
  JWT_ACCESS_SECRET: optional('JWT_ACCESS_SECRET', 'dev_access_secret_change_in_production'),
  JWT_REFRESH_SECRET: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production'),
  JWT_ACCESS_EXPIRES_IN: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  // Email
  SMTP_HOST: optional('SMTP_HOST', 'smtp.gmail.com'),
  SMTP_PORT: parseInt(optional('SMTP_PORT', '587'), 10),
  SMTP_SECURE: optional('SMTP_SECURE', 'false') === 'true',
  SMTP_USER: optional('SMTP_USER'),
  SMTP_PASS: optional('SMTP_PASS'),
  EMAIL_FROM: optional('EMAIL_FROM', 'LifeTrack <noreply@lifetrack.app>'),

  // Frontend
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:5173'),
  MOBILE_DEEP_LINK_SCHEME: optional('MOBILE_DEEP_LINK_SCHEME', 'lifetrack'),

  // AI
  AI_PROVIDER: optional('AI_PROVIDER', 'gemini'),
  AI_API_KEY: optional('AI_API_KEY'),
  AI_MODEL: optional('AI_MODEL', 'gemini-1.5-flash'),
  AI_MAX_TOKENS: parseInt(optional('AI_MAX_TOKENS', '2048'), 10),
  AI_TEMPERATURE: parseFloat(optional('AI_TEMPERATURE', '0.7')),

  // Open Food Facts
  OPEN_FOOD_FACTS_BASE_URL: optional('OPEN_FOOD_FACTS_BASE_URL', 'https://world.openfoodfacts.org'),
  OPEN_FOOD_FACTS_USER_AGENT: optional('OPEN_FOOD_FACTS_USER_AGENT', 'LifeTrack/1.0'),

  // Storage
  STORAGE_PROVIDER: optional('STORAGE_PROVIDER', 'local'),
  LOCAL_UPLOAD_DIR: optional('LOCAL_UPLOAD_DIR', 'uploads'),
  AWS_ACCESS_KEY_ID: optional('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: optional('AWS_SECRET_ACCESS_KEY'),
  AWS_REGION: optional('AWS_REGION', 'ap-south-1'),
  AWS_S3_BUCKET: optional('AWS_S3_BUCKET'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  AUTH_RATE_LIMIT_MAX: parseInt(optional('AUTH_RATE_LIMIT_MAX', '10'), 10),

  // Cookie
  COOKIE_SECRET: optional('COOKIE_SECRET', 'dev_cookie_secret_change_in_production'),
  COOKIE_SAME_SITE: optional('COOKIE_SAME_SITE', ''),

  // Static serving
  SERVE_STATIC: optional('SERVE_STATIC', 'false') === 'true',

  // Swagger
  SWAGGER_ENABLED: optional('SWAGGER_ENABLED', 'true') === 'true',

  // Logging
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
};

export default env;


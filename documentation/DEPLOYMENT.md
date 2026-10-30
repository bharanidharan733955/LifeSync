# LifeTrack Deployment Guide

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas cluster with Replica Set enabled (to support multi-document transactions)
- **Package Manager**: npm v9+

---

## 2. Production Environment Variables

### Backend Configuration (`backend/.env`)
```bash
NODE_ENV=production
PORT=5000
API_VERSION=v1

# MongoDB Atlas URI (Replica Set required for transactions)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lifetrack?retryWrites=true&w=majority

# JWT Secrets (Minimum 256-bit entropy)
JWT_ACCESS_SECRET=<generated_high_entropy_secret>
JWT_REFRESH_SECRET=<generated_high_entropy_secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Email SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<sendgrid_api_key>
EMAIL_FROM=noreply@lifetrack.app

# Cross-Origin
FRONTEND_URL=https://app.lifetrack.app
MOBILE_DEEP_LINK_SCHEME=lifetrack

# AI Provider API
AI_PROVIDER=gemini
AI_API_KEY=<google_gemini_api_key>
AI_MODEL=gemini-1.5-flash

# Open Food Facts API
OPEN_FOOD_FACTS_BASE_URL=https://world.openfoodfacts.org
OPEN_FOOD_FACTS_USER_AGENT=LifeTrack/1.0 (admin@lifetrack.app)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

---

## 3. Build & Deployment Execution

### 3.1 Backend Deployment (PM2 / Docker / Container)
```bash
cd backend
npm install --omit=dev
node server.js
```

### 3.2 Frontend Deployment (Vercel / Netlify / Cloudflare Pages / NGINX)
```bash
cd frontend
npm install
npm run build
# Deploy 'dist/' folder to CDN / Static host
```

### 3.3 Mobile Build (Expo Application Services - EAS)
```bash
cd mobile
npx eas-cli build --platform all
```

---

## 4. Production Health Checks
- API Status: `GET https://api.lifetrack.app/health`
- Swagger Interactive Documentation: `GET https://api.lifetrack.app/api-docs`


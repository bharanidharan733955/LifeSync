# LifeTrack — Production Deployment Guide

This guide walks you through deploying the **LifeTrack** personal finance platform to production.

---

## Architecture Overview

LifeTrack supports two deployment models out of the box:

1. **Decoupled Architecture (Recommended for Serverless/Free Tier)**:
   - **Frontend**: Deployed to **Vercel**, **Netlify**, or **Cloudflare Pages**
   - **Backend**: Deployed to **Render**, **Railway**, or **Fly.io**
   - **Database**: **MongoDB Atlas** (Free Tier M0 cluster)

2. **Unified Monolithic Architecture (Simplest Zero-CORS Setup)**:
   - The Node.js Express server automatically serves the compiled React production bundle (`frontend/dist`) and handles API requests on the same origin/port.
   - Deployed to **Render Web Service**, **Railway**, **Heroku**, or via **Docker**.

---

## Prerequisites

1. **MongoDB Atlas Database**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
   - In **Database Access**, create a user with Read and Write permissions.
   - Obtain your connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lifetrack?retryWrites=true&w=majority
     ```

2. **JWT & Cookie Secrets**:
   - Generate secure 64-byte random strings for your secrets using Node.js:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

---

## Option 1: Decoupled Deployment (Vercel + Render)

### Part A: Deploy Backend to Render

1. Sign in to [Render](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub/GitLab repository.
4. Configure the service:
   - **Name**: `lifetrack-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, set:
   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `API_VERSION` | `v1` |
   | `MONGODB_URI` | *Your MongoDB Atlas connection string* |
   | `JWT_ACCESS_SECRET` | *Your generated 64-char random string* |
   | `JWT_REFRESH_SECRET` | *Your generated 64-char random string* |
   | `COOKIE_SECRET` | *Your generated 32-char random string* |
   | `COOKIE_SAME_SITE` | `none` |
   | `FRONTEND_URL` | `https://your-lifetrack-frontend.vercel.app` *(update after Part B)* |
   | `RATE_LIMIT_MAX` | `500` |
   | `AUTH_RATE_LIMIT_MAX` | `50` |
   | `SWAGGER_ENABLED` | `true` |
6. Click **Create Web Service**.
7. Note down your backend URL once live: e.g. `https://lifetrack-api.onrender.com`.

---

### Part B: Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your LifeTrack repository.
4. In **Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (Click *Edit* and select `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://lifetrack-api.onrender.com/api/v1` |
6. Click **Deploy**.
7. Once deployed, copy your Vercel URL (e.g. `https://lifetrack.vercel.app`) and update the `FRONTEND_URL` environment variable in your Render backend settings.

---

## Option 2: Render Blueprint (1-Click Monorepo Setup)

The repository includes a pre-configured [`render.yaml`](../render.yaml) file:

1. Sign in to [Render](https://render.com).
2. Click **New +** → **Blueprint**.
3. Connect your repository.
4. Render will automatically detect `render.yaml` and provision both:
   - `lifetrack-backend` Web Service
   - `lifetrack-frontend` Static Site
5. Fill in your `MONGODB_URI` and `FRONTEND_URL` when prompted.
6. Click **Apply**.

---

## Option 3: Docker & Docker Compose (Self-Hosted / VPS)

The project includes a multi-stage production [`Dockerfile`](../Dockerfile) and [`docker-compose.yml`](../docker-compose.yml).

### Quickstart with Docker Compose

1. Clone repository on your VPS or local machine:
   ```bash
   git clone https://github.com/your-username/LifeSync.git
   cd LifeSync
   ```

2. Create `.env` file in root or pass environment variables:
   ```bash
   JWT_ACCESS_SECRET=your_super_secret_access_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   COOKIE_SECRET=your_super_secret_cookie_key
   ```

3. Start services:
   ```bash
   docker compose up -d --build
   ```

4. Verify status:
   ```bash
   docker compose ps
   curl http://localhost:5000/health
   ```
   Both the React frontend and Node.js backend are served on port `5000`.

---

## Option 4: Unified Deployment on Railway or Heroku

If deploying as a single service on Railway, Heroku, or Render:

1. Set **Build Command**:
   ```bash
   npm run install:all && npm run build
   ```
2. Set **Start Command**:
   ```bash
   npm start
   ```
3. Set Environment Variables:
   - `NODE_ENV=production`
   - `SERVE_STATIC=true`
   - `MONGODB_URI=...`
   - `JWT_ACCESS_SECRET=...`
   - `JWT_REFRESH_SECRET=...`
   - `COOKIE_SECRET=...`

---

## Production Health Checks

After deployment, test your endpoints:

| Check | URL | Expected Response |
|---|---|---|
| Health Check | `GET /health` | `{"success": true, "message": "LifeTrack API is running", ...}` |
| API Docs | `GET /api-docs` | Swagger interactive UI |
| Auth Register | `POST /api/v1/auth/register` | `201 Created` with JWT access token |

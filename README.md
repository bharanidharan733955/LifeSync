# LifeTrack
### Personal Finance, Diet & Nutrition Management Platform

LifeTrack is a full-stack, production-grade application engineered for personal finance oversight, nutritional tracking, sugar monitoring, AI-driven wellness advice, and lifestyle fitness management.

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js (JavaScript ES Modules exclusively)
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose ODM
- **Authentication**: JWT (Access Token + Refresh Token Rotation with device tracking), bcrypt
- **Validation**: Zod schema validation
- **Documentation**: Swagger / OpenAPI (`/api-docs`)
- **Security**: Helmet, CORS, Express Rate Limit, Cookie-Parser
- **Testing**: Vitest with unit and precision calculation suites

### Web Frontend
- **Framework**: React + Vite (JavaScript only)
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Redux Toolkit & TanStack Query
- **Navigation**: React Router DOM
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Mobile App
- **Framework**: React Native + Expo (Expo Router)
- **Hardware Integration**: Camera Barcode Scanning (Open Food Facts integration)
- **Notifications**: Expo Notifications

---

## 🚀 Getting Started

### 1. Clone & Setup Monorepo
```bash
git clone <repository-url>
cd LifeSync
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string
npm run test      # Run Vitest test suite
npm start         # Start Express server on http://localhost:5000
```
- Interactive Swagger API docs: `http://localhost:5000/api-docs`
- Health check: `http://localhost:5000/health`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev       # Start Vite dev server on http://localhost:5173
npm run build     # Verify clean production build
```

### 4. Mobile App Setup
```bash
cd ../mobile
npm install
npm start         # Launch Expo development server
```

---

## 📚 Documentation
- [System Requirements Specification (SRS)](./documentation/SRS.md)
- [Database Schema & ERD](./documentation/DATABASE.md)
- [REST API Reference](./documentation/API_DOCUMENTATION.md)
- [System Architecture](./documentation/ARCHITECTURE.md)
- [Production Deployment Guide](./documentation/DEPLOYMENT.md)

---

## ⚖️ Licensing
MIT License. LifeTrack Team.


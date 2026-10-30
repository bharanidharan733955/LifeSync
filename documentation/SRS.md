# Software Requirements Specification (SRS)
## Project: LifeTrack — Personal Finance, Diet & Nutrition Management Platform

### 1. Introduction
#### 1.1 Purpose
LifeTrack is an unified, production-oriented digital ecosystem combining personal expense management, nutritional tracking, sugar consumption oversight, AI-powered meal and financial recommendations, and lifestyle fitness logging across web and mobile surfaces.

#### 1.2 System Scope
- **Web Portal**: Responsive React + Vite application (Tailwind CSS, Redux Toolkit, TanStack Query, Recharts).
- **Mobile Application**: React Native (Expo, Expo Router, Barcode Scanner).
- **Shared Backend API**: Node.js, Express.js (ES Modules), MongoDB Atlas, Mongoose, JWT authentication with refresh token rotation.

---

### 2. Functional Requirements

#### 2.1 Authentication & Profile Management
- **FR-AUTH-1**: User registration with email, password, and first/last name. Passwords must be hashed via bcrypt with minimum cost factor 12.
- **FR-AUTH-2**: Double-token authentication: Short-lived Access Tokens (15m) and persistent, rotatable Refresh Tokens (30d) stored with device metadata and SHA-256 hashed in MongoDB.
- **FR-AUTH-3**: Role-based access control (`user` and `admin`).
- **FR-AUTH-4**: Verification email tokens and secure password reset tokens.

#### 2.2 Finance Module
- **FR-FIN-1**: Record income, expenses, and account transfers.
- **FR-FIN-2**: **Precision Arithmetic**: All monetary quantities must be handled using MongoDB `Decimal128` or integer minor units to eliminate floating-point rounding errors.
- **FR-FIN-3**: Dynamic category budgets with configurable percentage alert thresholds (e.g. alert at 80% utilization).
- **FR-FIN-4**: Savings goals with target completion dates and milestone progress tracking.
- **FR-FIN-5**: Recurring transaction scheduler rules.
- **FR-FIN-6**: Financial report exports in PDF and CSV format.

#### 2.3 Nutrition, Diet & Sugar Management
- **FR-NUT-1**: Complete meal diary (Breakfast, Lunch, Dinner, Snack).
- **FR-NUT-2**: **Historical Nutrition Snapshot**: Every logged meal captures a frozen snapshot of macro/micronutrients at log time.
- **FR-NUT-3**: Indian food database support: Idli, Dosa, Sambar, Pongal, Rice, Chapati, Curd Rice, Biryani, Dal, Paneer, etc.
- **FR-NUT-4**: **Sugar Tracking Formula**:
  $$\text{Sugar Consumed} = \frac{\text{Sugar per 100g} \times \text{Consumed Quantity (g)}}{100}$$
  Strictly separate naturally occurring sugars from declared added sugars. Unknown added sugar is never fabricated or coerced into natural sugar.
- **FR-NUT-5**: Barcode scanner integration with Open Food Facts API with fallback error handling.

#### 2.4 AI Assistant & Insights
- **FR-AI-1**: Context-aware diet assistant suggesting meal alternatives and generating weekly plans.
- **FR-AI-2**: **Explicit Consent Architecture**: Financial data is never transmitted to AI endpoints unless the user grants explicit permission via `userConsents`.
- **FR-AI-3**: Zero direct write access: AI recommendations cannot modify financial ledgers or meal logs directly.

---

### 3. Non-Functional Requirements
- **NFR-SEC-1**: Insecure Direct Object References (IDOR) protection: User ID is always extracted from verified JWT context and never trusted from request payloads.
- **NFR-SEC-2**: Helmet security headers, CORS restrictions, rate limiting per IP and per auth endpoint.
- **NFR-PERF-1**: Database queries indexed on `{ user: 1, date: -1 }` for sub-50ms retrieval under pagination.
- **NFR-TECH-1**: Strict JavaScript ES Modules exclusively. No TypeScript, Java, Spring Boot, or SQL databases.


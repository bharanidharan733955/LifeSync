# LifeTrack REST API Documentation

## Base URL
- Development: `http://localhost:5000/api/v1`
- Swagger UI Interactive Docs: `http://localhost:5000/api-docs`

---

## Authentication Header
All protected endpoints require a Bearer token:
```http
Authorization: Bearer <jwt_access_token>
```

---

## Standard Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Endpoints Summary

### 1. Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new user account (returns JWT access token & sets HTTP-only refresh cookie) | No |
| POST | `/auth/login` | Login with email & password (rate-limited) | No |
| POST | `/auth/refresh` | Refresh access token with rotation & reuse detection | No |
| POST | `/auth/logout` | Revoke current refresh token and clear cookie | No |
| POST | `/auth/logout-all` | Invalidate all active sessions for authenticated user | Yes |
| GET | `/auth/me` | Fetch authenticated user profile | Yes |

### 2. User Profile (`/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/users/me` | Fetch authenticated user profile | Yes |
| PUT | `/users/me` | Update authenticated user profile (`fullName`, `profileImage`) | Yes |

### 2. Finance Endpoints (`/transactions`, `/finance/transactions`, `/categories`, `/finance/categories`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/transactions` | List user transactions with pagination, multi-criteria filters, search & financial summary | Yes |
| POST | `/transactions` | Create income/expense transaction with category validation | Yes |
| GET | `/transactions/:id` | Get single transaction by ID (IDOR protected) | Yes |
| PUT | `/transactions/:id` | Update transaction (IDOR protected) | Yes |
| DELETE | `/transactions/:id` | Delete transaction (IDOR protected) | Yes |
| GET | `/categories` | List system & user custom categories | Yes |
| POST | `/categories` | Create custom category (name unique per user) | Yes |
| PUT | `/categories/:id` | Update custom category (system categories protected) | Yes |
| DELETE | `/categories/:id` | Delete custom category (prevents deletion if transactions exist) | Yes |
| GET | `/budgets` | List user budgets with live spending progress & filtering | Yes |
| POST | `/budgets` | Create category or overall budget with date calculation | Yes |
| GET | `/budgets/summary` | Aggregated budget metrics (spending, remaining, alerts) | Yes |
| GET | `/budgets/:id` | Get single budget with progress (IDOR protected) | Yes |
| GET | `/budgets/:id/progress`| Get detailed budget progress & qualifying transactions | Yes |
| PUT | `/budgets/:id` | Update budget amount, threshold, dates, or category | Yes |
| DELETE | `/budgets/:id` | Delete budget (does NOT delete transactions) | Yes |
| GET | `/savings-goals` | List user savings goals with dynamic progress & filtering | Yes |
| POST | `/savings-goals` | Create new savings goal with target amount & optional target date | Yes |
| GET | `/savings-goals/summary` | Aggregate savings summary (total saved, total target, progress) | Yes |
| GET | `/savings-goals/:id` | Get single savings goal with live calculated progress | Yes |
| PUT | `/savings-goals/:id` | Update savings goal details | Yes |
| PATCH | `/savings-goals/:id/status` | Update goal status (`ACTIVE`, `PAUSED`, `CANCELLED`, `COMPLETED`) | Yes |
| DELETE | `/savings-goals/:id` | Delete savings goal and cascade delete all its contributions | Yes |
| POST | `/savings-goals/:id/contributions` | Record a deposit/contribution toward a goal | Yes |
| GET | `/savings-goals/:id/contributions` | List deposit contributions for a goal | Yes |
| DELETE | `/savings-goals/:goalId/contributions/:contributionId` | Delete a contribution & dynamically recalculate progress | Yes |
| GET | `/recurring-transactions` | List all user recurring transaction schedules | Yes |
| POST | `/recurring-transactions` | Create recurring schedule (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`) | Yes |
| GET | `/recurring-transactions/:id` | Get recurring schedule details | Yes |
| PUT | `/recurring-transactions/:id` | Update recurring schedule, interval, or dates | Yes |
| PATCH | `/recurring-transactions/:id/status` | Pause (`isActive: false`) or resume (`isActive: true`) schedule | Yes |
| DELETE | `/recurring-transactions/:id` | Delete recurring schedule (preserves previously generated transactions) | Yes |
| GET | `/recurring-transactions/:id/history` | List transactions generated from this recurring rule | Yes |
| POST | `/recurring-transactions/process-due` | Manually trigger processing of due recurring transactions | Yes |

#### Savings Goal Calculation Formulas:
- `currentSavedAmount = sum(contributions.amount)` (computed via MongoDB aggregation)
- `remainingAmount = max(0, targetAmount - currentSavedAmount)`
- `percentageCompleted = (currentSavedAmount / targetAmount) * 100` (uncapped, allows >100%)
- `isTargetReached = currentSavedAmount >= targetAmount`
- `isExceeded = currentSavedAmount > targetAmount`
- `daysRemaining = ceil((targetDate - now) / 86400000)` (null if no targetDate)

#### Recurring Schedule Rules:
- Frequencies: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` with customizable integer `interval`.
- Calendar Month-End Handling: Clamps 29th/30th/31st to the last valid day of shorter months (e.g. Feb 28/29) without shifting future anchors.
- Automated Generator Cron: Runs hourly to generate due `Transaction` records with zero duplication guarantees.
- Idempotency: Duplicate occurrences on the same date for the same rule are strictly prevented.

#### Budget Calculation Formulas:
- `remainingAmount = budgetAmount - spentAmount` (allows negative if exceeded)
- `percentageUsed = (spentAmount / budgetAmount) * 100` (uncapped, precision rounded)
- `percentageRemaining = max(0, 100 - percentageUsed)`
- `thresholdReached = percentageUsed >= alertThreshold`
- `exceededBudget = spentAmount > budgetAmount`
- `status`:
  - `EXCEEDED` if `spentAmount > budgetAmount`
  - `WARNING` if `percentageUsed >= alertThreshold` (and not exceeded)
  - `EXPIRED` if `endDate < now` (and not exceeded/warning)
  - `NORMAL` otherwise

#### Budget Query Parameters:
- `budgetType`: `CATEGORY` or `OVERALL`
- `period`: `WEEKLY`, `MONTHLY`, or `CUSTOM`
- `isActive`: `true` or `false`
- `category`: Category ObjectId
- `search`: Case-insensitive regex match on budget name
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

#### Transaction Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `type`: `INCOME` or `EXPENSE`
- `category`: Category ObjectId
- `paymentMethod`: `CASH`, `UPI`, `DEBIT_CARD`, `CREDIT_CARD`, `BANK_TRANSFER`, `WALLET`, `OTHER`
- `startDate`: ISO 8601 Date (lower bound)
- `endDate`: ISO 8601 Date (upper bound)
- `minAmount`: Minimum amount filter
- `maxAmount`: Maximum amount filter
- `search`: Case-insensitive regex match on title, merchant, and description
- `sortBy`: `transactionDate` or `amount` (default: `transactionDate`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

### 3. Nutrition & Diet (`/nutrition`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/nutrition/profile` | Get user dietary & macro profile | Yes |
| PUT | `/nutrition/profile` | Update dietary targets & goals | Yes |
| GET | `/nutrition/foods` | Search food database (Indian dishes + OFF) | Yes |
| POST | `/nutrition/foods` | Add custom food item | Yes |
| GET | `/nutrition/foods/barcode/:code`| Open Food Facts barcode lookup | Yes |
| GET | `/nutrition/meals` | Get logged meals by date | Yes |
| POST | `/nutrition/meals` | Log meal with snapshot calculations | Yes |
| DELETE | `/nutrition/meals/:id` | Remove meal log entry | Yes |
| GET | `/nutrition/daily-summary` | Aggregated daily macro breakdown | Yes |
| GET | `/nutrition/sugar-summary` | Dedicated natural vs. added sugar summary | Yes |
| GET | `/nutrition/calorie-summary` | Calorie trend analytics | Yes |
| GET | `/nutrition/water` | List water intake logs | Yes |
| POST | `/nutrition/water` | Log hydration entry | Yes |

### 4. Diet Plans (`/diet-plans`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/diet-plans` | List user diet plans | Yes |
| POST | `/diet-plans` | Create new daily or weekly meal plan | Yes |
| GET | `/diet-plans/:id` | Get plan breakdown | Yes |
| POST | `/diet-plans/:id/generate-grocery-list` | Convert plan to shopping checklist | Yes |

### 5. Fitness & Grocery (`/fitness`, `/grocery`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/fitness/weight` | Fetch weight & BMI history | Yes |
| POST | `/fitness/weight` | Log weight entry | Yes |
| GET | `/fitness/activities` | List exercise and workout logs | Yes |
| POST | `/fitness/activities` | Log workout session | Yes |
| GET | `/grocery/lists` | Fetch grocery checklists | Yes |
| POST | `/grocery/lists` | Create grocery list | Yes |
| POST | `/grocery/lists/:id/items` | Add item to list | Yes |
| PATCH | `/grocery/lists/:listId/items/:itemId/toggle` | Mark item as purchased | Yes |

### 6. AI Assistant (`/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/ai/chat` | Send conversational prompt to AI assistant | Yes |
| POST | `/ai/diet/recommend` | Generate alternative meal recommendations | Yes |
| POST | `/ai/diet/weekly-plan` | Generate customized 7-day meal plan | Yes |
| POST | `/ai/finance/insights` | Run spending analytics (Consent required) | Yes |


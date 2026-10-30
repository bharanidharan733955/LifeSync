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
| POST | `/auth/register` | Register new account | No |
| POST | `/auth/login` | Login and receive access + refresh token | No |
| POST | `/auth/refresh-token` | Issue new access token via refresh token | No |
| POST | `/auth/logout` | Revoke active refresh token | Yes |
| GET | `/auth/verify-email/:token` | Verify email address | No |
| POST | `/auth/forgot-password` | Request password reset token | No |
| POST | `/auth/reset-password` | Reset password using verified token | No |
| PATCH | `/auth/change-password` | Change user password | Yes |
| GET | `/auth/me` | Fetch authenticated user profile | Yes |

### 2. Finance (`/finance`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/finance/transactions` | Paginated transaction list with filters | Yes |
| POST | `/finance/transactions` | Create income/expense entry | Yes |
| GET | `/finance/transactions/:id` | Get single transaction | Yes |
| PATCH | `/finance/transactions/:id` | Update transaction | Yes |
| DELETE | `/finance/transactions/:id` | Delete transaction | Yes |
| GET | `/finance/categories` | List system & user custom categories | Yes |
| POST | `/finance/categories` | Create custom category | Yes |
| GET | `/finance/budgets` | Fetch active budgets | Yes |
| POST | `/finance/budgets` | Create category-specific budget | Yes |
| GET | `/finance/savings-goals` | List savings goals & milestones | Yes |
| POST | `/finance/savings-goals` | Create savings goal | Yes |
| POST | `/finance/savings-goals/:id/contribute` | Add savings milestone contribution | Yes |

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


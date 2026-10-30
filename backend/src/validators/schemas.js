import { z } from 'zod';

// ─── Shared Zod validation schemas ───────────────────────────────────────────
// Reusable schema building blocks used across all feature validators.

// ─── Primitives ───────────────────────────────────────────────────────────────
export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const emailSchema = z
  .string()
  .email('Please provide a valid email address')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number')
  .optional()
  .nullable();

export const dateSchema = z.coerce.date();

export const positiveNumberSchema = z
  .number()
  .positive('Value must be greater than 0')
  .finite('Value must be a finite number');

export const nonNegativeNumberSchema = z
  .number()
  .min(0, 'Value cannot be negative')
  .finite('Value must be a finite number');

// ─── Pagination ───────────────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─── Date range query ─────────────────────────────────────────────────────────
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'startDate must be before or equal to endDate' }
);

// ─── Auth validators ──────────────────────────────────────────────────────────
export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(50).optional(),
  lastName: z.string().trim().min(2).max(50).optional(),
  phone: phoneSchema,
}).strict();

// ─── Finance validators ───────────────────────────────────────────────────────
export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer'], {
    errorMap: () => ({ message: 'Type must be income, expense, or transfer' }),
  }),
  amount: positiveNumberSchema,
  currency: z.string().length(3).toUpperCase().default('INR'),
  category: mongoIdSchema,
  description: z.string().trim().max(500).default(''),
  notes: z.string().trim().max(1000).optional().nullable(),
  date: z.coerce.date(),
  paymentMethod: z
    .enum(['cash', 'card', 'upi', 'netbanking', 'cheque', 'wallet', 'other'])
    .default('other'),
  tags: z.array(z.string().trim().max(30)).max(10).default([]),
  isFoodExpense: z.boolean().default(false),
  merchantName: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
});

export const transactionQuerySchema = paginationSchema.merge(dateRangeSchema).extend({
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  category: mongoIdSchema.optional(),
  paymentMethod: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export const createBudgetSchema = z.object({
  name: z.string().trim().min(1).max(100),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  periodStartDate: z.coerce.date(),
  periodEndDate: z.coerce.date(),
  totalBudget: positiveNumberSchema,
  currency: z.string().length(3).toUpperCase().default('INR'),
  categoryLimits: z.array(z.object({
    category: mongoIdSchema,
    limit: positiveNumberSchema,
    alertThreshold: z.number().int().min(1).max(100).default(80),
  })).default([]),
  alertsEnabled: z.boolean().default(true),
  notes: z.string().trim().max(500).optional().nullable(),
}).refine((d) => d.periodStartDate <= d.periodEndDate, {
  message: 'Start date must be before end date',
  path: ['periodEndDate'],
});

export const createSavingsGoalSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().nullable(),
  targetAmount: positiveNumberSchema,
  currency: z.string().length(3).toUpperCase().default('INR'),
  targetDate: z.coerce.date().optional().nullable(),
  category: z.enum(['emergency_fund', 'travel', 'education', 'home', 'vehicle', 'investment', 'other']).default('other'),
  icon: z.string().max(50).default('piggy-bank'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#10b981'),
  monthlyContribution: positiveNumberSchema.optional().nullable(),
});

// ─── Nutrition validators ─────────────────────────────────────────────────────
export const nutritionPer100Schema = z.object({
  calories: nonNegativeNumberSchema,
  protein: nonNegativeNumberSchema,
  carbohydrates: nonNegativeNumberSchema,
  fat: nonNegativeNumberSchema,
  fiber: nonNegativeNumberSchema.nullable().optional(),
  sugar: nonNegativeNumberSchema.nullable().optional(),
  addedSugar: nonNegativeNumberSchema.nullable().optional(),
  saturatedFat: nonNegativeNumberSchema.nullable().optional(),
  transFat: nonNegativeNumberSchema.nullable().optional(),
  sodium: nonNegativeNumberSchema.nullable().optional(),
  calcium: nonNegativeNumberSchema.nullable().optional(),
  iron: nonNegativeNumberSchema.nullable().optional(),
  potassium: nonNegativeNumberSchema.nullable().optional(),
  vitaminA: nonNegativeNumberSchema.nullable().optional(),
  vitaminC: nonNegativeNumberSchema.nullable().optional(),
  vitaminD: nonNegativeNumberSchema.nullable().optional(),
  vitaminB12: nonNegativeNumberSchema.nullable().optional(),
  cholesterol: nonNegativeNumberSchema.nullable().optional(),
});

export const createFoodItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  nameLocal: z.string().trim().max(200).optional().nullable(),
  brand: z.string().trim().max(100).optional().nullable(),
  barcode: z.string().trim().optional().nullable(),
  nutritionPer100: nutritionPer100Schema,
  servingSizes: z.array(z.object({
    description: z.string().trim().min(1),
    grams: positiveNumberSchema,
  })).min(1).default([{ description: '100g', grams: 100 }]),
  category: z.enum([
    'grains_cereals', 'legumes_pulses', 'vegetables', 'fruits',
    'dairy', 'meat_poultry', 'seafood', 'eggs', 'nuts_seeds',
    'oils_fats', 'sweets_desserts', 'snacks', 'beverages',
    'spices_condiments', 'packaged_foods', 'fast_food', 'indian_dishes',
    'soups_stews', 'other',
  ]).default('other'),
  cuisine: z.enum(['south_indian', 'north_indian', 'east_indian', 'west_indian', 'pan_indian', 'international']).optional().nullable(),
  isPublic: z.boolean().default(true),
  imageUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().trim().max(30)).max(10).default([]),
});

export const logMealSchema = z.object({
  foodItemId: mongoIdSchema,
  logDate: z.coerce.date(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
  servingSizeDescription: z.string().trim().min(1),
  servingQuantity: z.number().min(0.1).max(100),
  consumedGrams: positiveNumberSchema,
  notes: z.string().trim().max(300).optional().nullable(),
});

export const logWaterSchema = z.object({
  logDate: z.coerce.date(),
  amountMl: z.number().int().min(1).max(5000),
  source: z.enum(['water', 'tea', 'coffee', 'juice', 'milk', 'other']).default('water'),
  notes: z.string().trim().max(200).optional().nullable(),
});

export const logWeightSchema = z.object({
  weightKg: z.number().min(10).max(500),
  logDate: z.coerce.date(),
  notes: z.string().trim().max(300).optional().nullable(),
  measurements: z.object({
    waistCm: z.number().min(0).optional().nullable(),
    hipCm: z.number().min(0).optional().nullable(),
    chestCm: z.number().min(0).optional().nullable(),
    bodyFatPercent: z.number().min(0).max(70).optional().nullable(),
  }).optional(),
});


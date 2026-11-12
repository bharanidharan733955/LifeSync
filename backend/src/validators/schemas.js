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
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .optional(),
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .transform((data) => {
    if (!data.fullName && (data.firstName || data.lastName)) {
      data.fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    return data;
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => !!data.fullName, {
    message: 'Full name is required',
    path: ['fullName'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateUserMeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  profileImage: z.string().nullable().optional(),
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
export const createTransactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'INCOME', 'EXPENSE'], {
      errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
    }),
    amount: positiveNumberSchema,
    currency: z.string().length(3).toUpperCase().default('INR'),
    category: mongoIdSchema,
    title: z.string().trim().max(150).optional(),
    description: z.string().trim().max(500).default(''),
    merchant: z.string().trim().max(100).optional().nullable(),
    merchantName: z.string().trim().max(100).optional().nullable(),
    source: z.string().trim().max(100).optional().nullable(),
    paymentMethod: z
      .string()
      .default('OTHER'),
    transactionDate: z.coerce.date().optional(),
    date: z.coerce.date().optional(),
    recurringTransactionId: mongoIdSchema.optional().nullable(),
    receiptUrl: z.string().trim().optional().nullable(),
    tags: z.array(z.string().trim().max(30)).max(10).default([]),
    notes: z.string().trim().max(1000).optional().nullable(),
    isFoodExpense: z.boolean().default(false),
    location: z.string().trim().max(200).optional().nullable(),
  })
  .transform((data) => {
    data.type = data.type.toUpperCase();
    if (!data.title) {
      data.title = data.description || 'Transaction';
    }
    if (!data.merchant) {
      data.merchant = data.merchantName || data.source || null;
    }
    if (!data.transactionDate) {
      data.transactionDate = data.date || new Date();
    }
    return data;
  });

export const updateTransactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'INCOME', 'EXPENSE']).optional(),
    amount: positiveNumberSchema.optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    category: mongoIdSchema.optional(),
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(500).optional(),
    merchant: z.string().trim().max(100).optional().nullable(),
    merchantName: z.string().trim().max(100).optional().nullable(),
    source: z.string().trim().max(100).optional().nullable(),
    paymentMethod: z.string().optional(),
    transactionDate: z.coerce.date().optional(),
    date: z.coerce.date().optional(),
    recurringTransactionId: mongoIdSchema.optional().nullable(),
    receiptUrl: z.string().trim().optional().nullable(),
    tags: z.array(z.string().trim().max(30)).max(10).optional(),
    notes: z.string().trim().max(1000).optional().nullable(),
    isFoodExpense: z.boolean().optional(),
    location: z.string().trim().max(200).optional().nullable(),
  })
  .transform((data) => {
    if (data.type) data.type = data.type.toUpperCase();
    if (!data.merchant && (data.merchantName || data.source)) {
      data.merchant = data.merchantName || data.source || null;
    }
    if (!data.transactionDate && data.date) {
      data.transactionDate = data.date;
    }
    return data;
  });

export const transactionQuerySchema = paginationSchema.merge(dateRangeSchema).extend({
  type: z.enum(['income', 'expense', 'INCOME', 'EXPENSE']).optional(),
  category: mongoIdSchema.optional(),
  paymentMethod: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['transactionDate', 'date', 'amount', 'createdAt', 'title']).default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
}).transform((data) => {
  if (data.type) data.type = data.type.toUpperCase();
  if (data.sortBy === 'date') data.sortBy = 'transactionDate';
  return data;
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50),
  type: z.enum(['INCOME', 'EXPENSE', 'BOTH', 'income', 'expense', 'both'], {
    errorMap: () => ({ message: 'Type must be INCOME, EXPENSE, or BOTH' }),
  }).transform((v) => v.toUpperCase()),
  icon: z.string().trim().max(50).default('tag'),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .default('#6366f1'),
  description: z.string().trim().max(200).optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'BOTH', 'income', 'expense', 'both']).transform((v) => v.toUpperCase()).optional(),
  icon: z.string().trim().max(50).optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
  description: z.string().trim().max(200).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const createBudgetSchema = z
  .object({
    name: z.string().trim().min(1, 'Budget name is required').max(100, 'Budget name cannot exceed 100 characters'),
    budgetType: z
      .enum(['CATEGORY', 'OVERALL', 'category', 'overall'], {
        errorMap: () => ({ message: 'Budget type must be CATEGORY or OVERALL' }),
      })
      .default('CATEGORY')
      .transform((v) => v.toUpperCase()),
    category: mongoIdSchema.optional().nullable(),
    amount: positiveNumberSchema.optional(),
    totalBudget: positiveNumberSchema.optional(),
    currency: z.string().length(3).toUpperCase().default('INR'),
    period: z
      .enum(['WEEKLY', 'MONTHLY', 'CUSTOM', 'weekly', 'monthly', 'custom'], {
        errorMap: () => ({ message: 'Period must be WEEKLY, MONTHLY, or CUSTOM' }),
      })
      .default('MONTHLY')
      .transform((v) => v.toUpperCase()),
    startDate: z.coerce.date().optional(),
    periodStartDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    periodEndDate: z.coerce.date().optional(),
    alertThreshold: z.coerce
      .number()
      .min(1, 'Alert threshold must be at least 1%')
      .max(100, 'Alert threshold cannot exceed 100%')
      .default(80),
    isActive: z.boolean().default(true),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .transform((data) => {
    if (!data.amount && data.totalBudget) data.amount = data.totalBudget;
    if (!data.startDate && data.periodStartDate) data.startDate = data.periodStartDate;
    if (!data.endDate && data.periodEndDate) data.endDate = data.periodEndDate;
    return data;
  })
  .refine((data) => data.amount !== undefined && data.amount > 0, {
    message: 'Budget amount is required and must be greater than 0',
    path: ['amount'],
  })
  .refine(
    (data) => {
      if (data.budgetType === 'CATEGORY' && !data.category) return false;
      return true;
    },
    {
      message: 'Category is required for CATEGORY budget type',
      path: ['category'],
    }
  )
  .refine(
    (data) => {
      if (data.period === 'CUSTOM' && (!data.startDate || !data.endDate)) return false;
      return true;
    },
    {
      message: 'Start date and end date are required for CUSTOM period',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate >= data.endDate) return false;
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

export const updateBudgetSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    budgetType: z.enum(['CATEGORY', 'OVERALL', 'category', 'overall']).transform((v) => v.toUpperCase()).optional(),
    category: mongoIdSchema.optional().nullable(),
    amount: positiveNumberSchema.optional(),
    totalBudget: positiveNumberSchema.optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    period: z.enum(['WEEKLY', 'MONTHLY', 'CUSTOM', 'weekly', 'monthly', 'custom']).transform((v) => v.toUpperCase()).optional(),
    startDate: z.coerce.date().optional(),
    periodStartDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    periodEndDate: z.coerce.date().optional(),
    alertThreshold: z.coerce.number().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .transform((data) => {
    if (!data.amount && data.totalBudget) data.amount = data.totalBudget;
    if (!data.startDate && data.periodStartDate) data.startDate = data.periodStartDate;
    if (!data.endDate && data.periodEndDate) data.endDate = data.periodEndDate;
    return data;
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.startDate >= data.endDate) return false;
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

export const budgetQuerySchema = z.object({
  budgetType: z.enum(['CATEGORY', 'OVERALL', 'category', 'overall']).transform((v) => v.toUpperCase()).optional(),
  period: z.enum(['WEEKLY', 'MONTHLY', 'CUSTOM', 'weekly', 'monthly', 'custom']).transform((v) => v.toUpperCase()).optional(),
  category: mongoIdSchema.optional(),
  isActive: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return val;
  }, z.boolean().optional()),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createSavingsGoalSchema = z.object({
  name: z.string().trim().min(1, 'Goal name is required').max(100, 'Goal name cannot exceed 100 characters'),
  description: z.string().trim().max(500).optional().nullable(),
  targetAmount: positiveNumberSchema,
  currency: z.string().length(3).toUpperCase().default('INR'),
  targetDate: z.coerce.date().optional().nullable(),
  status: z
    .enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'active', 'completed', 'paused', 'cancelled'])
    .transform((v) => v.toUpperCase())
    .default('ACTIVE'),
  category: z.string().trim().max(50).default('General'),
  icon: z.string().max(50).default('piggy-bank'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#10b981'),
});

export const updateSavingsGoalSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  targetAmount: positiveNumberSchema.optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  targetDate: z.coerce.date().optional().nullable(),
  status: z
    .enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'active', 'completed', 'paused', 'cancelled'])
    .transform((v) => v.toUpperCase())
    .optional(),
  category: z.string().trim().max(50).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const savingsGoalStatusSchema = z.object({
  status: z
    .enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'active', 'completed', 'paused', 'cancelled'])
    .transform((v) => v.toUpperCase()),
});

export const savingsGoalQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'active', 'completed', 'paused', 'cancelled']).transform((v) => v.toUpperCase()).optional(),
  category: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createContributionSchema = z.object({
  amount: positiveNumberSchema,
  contributionDate: z.coerce.date().default(() => new Date()),
  source: z.enum(['MANUAL', 'TRANSACTION', 'manual', 'transaction']).transform((v) => v.toUpperCase()).default('MANUAL'),
  transactionId: mongoIdSchema.optional().nullable(),
  description: z.string().trim().max(200).default(''),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const addContributionSchema = createContributionSchema;

export const updateContributionSchema = z.object({
  amount: positiveNumberSchema.optional(),
  contributionDate: z.coerce.date().optional(),
  description: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional().nullable(),
});

// ─── Recurring Transactions Validators ────────────────────────────────────────
export const createRecurringTransactionSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'income', 'expense']).transform((v) => v.toUpperCase()),
    title: z.string().trim().min(1, 'Title is required').max(150),
    description: z.string().trim().max(500).default(''),
    amount: positiveNumberSchema,
    currency: z.string().length(3).toUpperCase().default('INR'),
    category: mongoIdSchema,
    paymentMethod: z.string().default('OTHER'),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'daily', 'weekly', 'monthly', 'yearly']).transform((v) => v.toUpperCase()),
    interval: z.coerce.number().int().positive().default(1),
    startDate: z.coerce.date().default(() => new Date()),
    nextOccurrence: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    isActive: z.boolean().default(true),
    timezone: z.string().default('UTC'),
  })
  .transform((data) => {
    if (!data.nextOccurrence) {
      data.nextOccurrence = data.startDate;
    }
    return data;
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.startDate > data.endDate) return false;
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

export const recurringStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive is required' }),
});

export const updateRecurringTransactionSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE', 'income', 'expense']).transform((v) => v.toUpperCase()).optional(),
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(500).optional(),
    amount: positiveNumberSchema.optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    category: mongoIdSchema.optional(),
    paymentMethod: z.string().optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'daily', 'weekly', 'monthly', 'yearly']).transform((v) => v.toUpperCase()).optional(),
    interval: z.coerce.number().int().positive().optional(),
    startDate: z.coerce.date().optional(),
    nextOccurrence: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    isActive: z.boolean().optional(),
    timezone: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.startDate > data.endDate) return false;
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

export const recurringTransactionQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'income', 'expense']).transform((v) => v.toUpperCase()).optional(),
  category: mongoIdSchema.optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'daily', 'weekly', 'monthly', 'yearly']).transform((v) => v.toUpperCase()).optional(),
  isActive: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return val;
  }, z.boolean().optional()),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
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


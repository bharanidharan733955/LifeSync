import mongoose from 'mongoose';

// ─── DietPlan model ───────────────────────────────────────────────────────────

const mealPlanEntrySchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      default: null,
    },
    customFoodName: { type: String, trim: true, maxlength: 200, default: null },
    servingSizeDescription: { type: String, required: true },
    servingQuantity: { type: Number, required: true, min: 0.1 },
    consumedGrams: { type: Number, required: true, min: 0.1 },
    nutritionSnapshot: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      sugar: { type: Number, default: null },
    },
    notes: { type: String, trim: true, maxlength: 200, default: null },
  },
  { _id: true }
);

const dayPlanSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Sunday
    },
    dayLabel: { type: String, default: null }, // e.g. "Day 1"
    meals: [mealPlanEntrySchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    notes: { type: String, trim: true, maxlength: 500, default: null },
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 500, default: null },
    planType: {
      type: String,
      enum: ['daily', 'weekly'],
      required: true,
    },
    goalType: {
      type: String,
      enum: ['lose_weight', 'gain_weight', 'maintain', 'build_muscle', 'general_health'],
      default: 'general_health',
    },
    dietType: {
      type: String,
      enum: ['omnivore', 'vegetarian', 'vegan', 'eggetarian', 'pescatarian', 'keto', 'paleo', 'other'],
      default: 'omnivore',
    },
    cuisineType: {
      type: String,
      enum: ['south_indian', 'north_indian', 'pan_indian', 'international', 'mixed'],
      default: 'mixed',
    },
    targetCalories: { type: Number, min: 500, max: 10000, default: 2000 },
    targetProtein: { type: Number, min: 0, default: null },
    targetCarbs: { type: Number, min: 0, default: null },
    targetFat: { type: Number, min: 0, default: null },
    days: [dayPlanSchema],
    isActive: { type: Boolean, default: true },
    isAIGenerated: { type: Boolean, default: false },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

dietPlanSchema.index({ user: 1, isActive: 1 });
dietPlanSchema.index({ user: 1, planType: 1 });
dietPlanSchema.index({ user: 1, createdAt: -1 });

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;


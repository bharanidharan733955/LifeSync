import mongoose from 'mongoose';

// ─── MealLog model ────────────────────────────────────────────────────────────
// A daily meal diary entry. Each document represents a single food item logged
// for a meal. Nutrition snapshot is stored at log time so historical accuracy
// is preserved even if the food database entry changes later.

const mealLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    // Log date (date-only – time in loggedAt)
    logDate: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: { values: ['breakfast', 'lunch', 'dinner', 'snack', 'other'], message: 'Invalid meal type' },
      required: true,
    },
    // Serving
    servingSizeDescription: {
      type: String,
      required: true, // e.g. "1 cup", "200g"
    },
    servingQuantity: {
      type: Number,
      required: true,
      min: [0.1, 'Serving quantity must be at least 0.1'],
      max: [100, 'Serving quantity cannot exceed 100'],
    },
    consumedGrams: {
      type: Number,
      required: true,
      min: [0.1, 'Consumed amount must be positive'],
    },
    // ── Nutrition snapshot (calculated at log time from per100 values) ─────
    // Formula: nutrient = nutritionPer100.nutrient * consumedGrams / 100
    nutritionSnapshot: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbohydrates: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: null },
      sugar: { type: Number, default: null },       // total sugar
      addedSugar: { type: Number, default: null },  // null = unknown
      saturatedFat: { type: Number, default: null },
      transFat: { type: Number, default: null },
      sodium: { type: Number, default: null },
      calcium: { type: Number, default: null },
      iron: { type: Number, default: null },
      potassium: { type: Number, default: null },
    },
    // ── Food name snapshot (for display even if food is later deleted) ───
    foodNameSnapshot: {
      type: String,
      required: true,
    },
    isFavorite: { type: Boolean, default: false },
    notes: { type: String, trim: true, maxlength: 300, default: null },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
mealLogSchema.index({ user: 1, logDate: -1 });
mealLogSchema.index({ user: 1, logDate: 1, mealType: 1 });
mealLogSchema.index({ user: 1, foodItem: 1 });
mealLogSchema.index({ user: 1, isFavorite: 1 });
// Compound for daily summary aggregation
mealLogSchema.index({ user: 1, logDate: 1 });

const MealLog = mongoose.model('MealLog', mealLogSchema);
export default MealLog;


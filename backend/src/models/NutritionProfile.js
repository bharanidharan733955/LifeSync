import mongoose from 'mongoose';

// ─── NutritionProfile model ───────────────────────────────────────────────────
// Per-user nutrition profile: physical stats, dietary preferences, health goals.
// Used to personalise diet plans, calorie targets, and AI recommendations.

const nutritionProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Physical stats
    dateOfBirth: { type: Date, default: null },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: null,
    },
    heightCm: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height cannot exceed 300 cm'],
      default: null,
    },
    weightKg: {
      type: Number,
      min: [10, 'Weight must be at least 10 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
      default: null,
    },
    // Goals
    goalWeight: {
      type: Number,
      min: 10,
      max: 500,
      default: null,
    },
    weightGoal: {
      type: String,
      enum: ['lose_weight', 'gain_weight', 'maintain', 'build_muscle', null],
      default: null,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      default: 'sedentary',
    },
    // Daily targets (computed from TDEE by service, or manually set)
    dailyCalorieTarget: {
      type: Number,
      min: 500,
      max: 10000,
      default: 2000,
    },
    // Macro targets in grams
    dailyProteinTargetG: { type: Number, min: 0, default: 50 },
    dailyCarbTargetG: { type: Number, min: 0, default: 250 },
    dailyFatTargetG: { type: Number, min: 0, default: 65 },
    dailyFiberTargetG: { type: Number, min: 0, default: 25 },
    dailySugarTargetG: { type: Number, min: 0, default: 50 }, // Total sugar
    dailyAddedSugarTargetG: { type: Number, min: 0, default: 25 }, // Added sugar
    dailySodiumTargetMg: { type: Number, min: 0, default: 2300 },
    dailyWaterTargetMl: { type: Number, min: 0, default: 2000 },
    // Dietary preferences
    dietType: {
      type: String,
      enum: ['omnivore', 'vegetarian', 'vegan', 'eggetarian', 'pescatarian', 'keto', 'paleo', 'other'],
      default: 'omnivore',
    },
    cuisinePreferences: {
      type: [String],
      default: [],
      // e.g. ['south_indian', 'north_indian', 'continental']
    },
    mealFrequency: {
      type: Number,
      min: 1,
      max: 10,
      default: 3,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

nutritionProfileSchema.index({ user: 1 }, { unique: true });

// Compute derived age from dateOfBirth
nutritionProfileSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  let age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const m = today.getMonth() - this.dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) age--;
  return age;
});

nutritionProfileSchema.virtual('bmi').get(function () {
  if (!this.weightKg || !this.heightCm) return null;
  const h = this.heightCm / 100;
  return Math.round((this.weightKg / (h * h)) * 10) / 10;
});

nutritionProfileSchema.set('toJSON', { virtuals: true });

const NutritionProfile = mongoose.model('NutritionProfile', nutritionProfileSchema);
export default NutritionProfile;


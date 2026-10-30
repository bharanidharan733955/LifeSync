import mongoose from 'mongoose';

// ─── UserPreferences model ────────────────────────────────────────────────────
// One document per user – stores UI and notification preferences.

const userPreferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // UI
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      default: 'en',
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      maxlength: 3,
    },
    // Notifications
    notifications: {
      emailDigest: { type: Boolean, default: true },
      pushEnabled: { type: Boolean, default: true },
      mealReminders: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      waterReminders: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
    },
    // Nutrition display
    nutritionDisplay: {
      calorieUnit: { type: String, enum: ['kcal', 'kJ'], default: 'kcal' },
      weightUnit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      heightUnit: { type: String, enum: ['cm', 'ft'], default: 'cm' },
    },
    // Finance display
    financeDisplay: {
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      numberFormat: { type: String, enum: ['en-IN', 'en-US', 'en-GB'], default: 'en-IN' },
    },
    // Meal reminder times
    mealReminderTimes: {
      breakfast: { type: String, default: '08:00' },
      lunch: { type: String, default: '13:00' },
      dinner: { type: String, default: '19:30' },
    },
  },
  { timestamps: true }
);

userPreferencesSchema.index({ user: 1 }, { unique: true });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
export default UserPreferences;


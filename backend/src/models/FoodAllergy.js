import mongoose from 'mongoose';

// ─── FoodAllergy model ────────────────────────────────────────────────────────

const foodAllergySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allergen: {
      type: String,
      required: [true, 'Allergen name is required'],
      trim: true,
      maxlength: 100,
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life_threatening'],
      required: true,
    },
    symptoms: { type: [String], default: [] },
    diagnosedBy: {
      type: String,
      enum: ['self_reported', 'doctor_diagnosed', 'test_confirmed'],
      default: 'self_reported',
    },
    notes: { type: String, trim: true, maxlength: 500, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

foodAllergySchema.index({ user: 1, isActive: 1 });
foodAllergySchema.index({ user: 1, allergen: 1 }, { unique: true });

const FoodAllergy = mongoose.model('FoodAllergy', foodAllergySchema);
export default FoodAllergy;


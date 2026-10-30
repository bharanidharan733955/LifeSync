import mongoose from 'mongoose';

// ─── DietaryRestriction model ─────────────────────────────────────────────────

const dietaryRestrictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restrictionType: {
      type: String,
      enum: [
        'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free',
        'halal', 'kosher', 'low_sodium', 'low_sugar', 'diabetic_friendly',
        'low_carb', 'keto', 'paleo', 'custom',
      ],
      required: true,
    },
    customName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    reason: {
      type: String,
      enum: ['religious', 'medical', 'ethical', 'personal', 'allergy', 'other'],
      default: 'personal',
    },
    notes: { type: String, trim: true, maxlength: 300, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dietaryRestrictionSchema.index({ user: 1, isActive: 1 });
dietaryRestrictionSchema.index({ user: 1, restrictionType: 1 });

const DietaryRestriction = mongoose.model('DietaryRestriction', dietaryRestrictionSchema);
export default DietaryRestriction;


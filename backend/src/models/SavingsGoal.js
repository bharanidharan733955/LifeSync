import mongoose from 'mongoose';

// ─── SavingsGoal model ────────────────────────────────────────────────────────
// Dynamic progress calculated from associated SavingsContribution records.
// Supports status: ACTIVE, COMPLETED, PAUSED, CANCELLED.

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null,
    },
    targetAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Target amount is required'],
      validate: {
        validator(v) {
          if (v == null) return false;
          const val = parseFloat(v.toString());
          return !isNaN(val) && val > 0;
        },
        message: 'Target amount must be greater than 0',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      maxlength: 3,
    },
    targetDate: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'],
        message: 'Status must be ACTIVE, COMPLETED, PAUSED, or CANCELLED',
      },
      set: (v) => (v ? v.toUpperCase() : v),
      default: 'ACTIVE',
      index: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'General',
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'piggy-bank',
    },
    color: {
      type: String,
      trim: true,
      default: '#10b981',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

savingsGoalSchema.index({ user: 1, status: 1 });
savingsGoalSchema.index({ user: 1, targetDate: 1 });

savingsGoalSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    if (ret.targetAmount != null) {
      ret.targetAmount = parseFloat(ret.targetAmount.toString());
    }
    delete ret.__v;
    return ret;
  },
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
export default SavingsGoal;

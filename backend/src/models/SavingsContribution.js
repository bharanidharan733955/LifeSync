import mongoose from 'mongoose';

// ─── SavingsContribution model ────────────────────────────────────────────────
// Records individual contributions toward a SavingsGoal.
// Enforces positive amounts, goal ownership, and prevents duplicate submissions.

const savingsContributionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    savingsGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: [true, 'Savings goal is required'],
      index: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Contribution amount is required'],
      validate: {
        validator(v) {
          if (v == null) return false;
          const val = parseFloat(v.toString());
          return !isNaN(val) && val > 0;
        },
        message: 'Contribution amount must be greater than 0',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      maxlength: 3,
    },
    contributionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: {
        values: ['MANUAL', 'TRANSACTION'],
        message: 'Source must be MANUAL or TRANSACTION',
      },
      set: (v) => (v ? v.toUpperCase() : v),
      default: 'MANUAL',
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

savingsContributionSchema.index({ savingsGoal: 1, contributionDate: -1 });
savingsContributionSchema.index({ user: 1, savingsGoal: 1 });

savingsContributionSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    if (ret.amount != null) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    delete ret.__v;
    return ret;
  },
});

const SavingsContribution = mongoose.model('SavingsContribution', savingsContributionSchema);
export default SavingsContribution;


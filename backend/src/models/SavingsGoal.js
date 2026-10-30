import mongoose from 'mongoose';

// ─── SavingsGoal model ────────────────────────────────────────────────────────

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    targetAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Target amount is required'],
      validate: {
        validator(v) { return parseFloat(v.toString()) > 0; },
        message: 'Target amount must be greater than 0',
      },
    },
    currentAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0.00'),
    },
    currency: { type: String, default: 'INR', uppercase: true, maxlength: 3 },
    targetDate: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      enum: ['emergency_fund', 'travel', 'education', 'home', 'vehicle', 'investment', 'other'],
      default: 'other',
    },
    icon: { type: String, default: 'piggy-bank' },
    color: { type: String, default: '#10b981' },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    // Monthly auto-save contribution
    monthlyContribution: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
    },
    contributions: [
      {
        amount: { type: mongoose.Schema.Types.Decimal128, required: true },
        note: { type: String, trim: true, maxlength: 200 },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

savingsGoalSchema.index({ user: 1, isActive: 1 });
savingsGoalSchema.index({ user: 1, isCompleted: 1 });
savingsGoalSchema.index({ user: 1, targetDate: 1 });

savingsGoalSchema.virtual('progressPercent').get(function () {
  const current = parseFloat(this.currentAmount?.toString() ?? '0');
  const target = parseFloat(this.targetAmount?.toString() ?? '1');
  return Math.min(100, Math.round((current / target) * 100 * 10) / 10);
});

savingsGoalSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    for (const key of ['targetAmount', 'currentAmount', 'monthlyContribution']) {
      if (ret[key] instanceof mongoose.Types.Decimal128) {
        ret[key] = parseFloat(ret[key].toString());
      }
    }
    if (Array.isArray(ret.contributions)) {
      ret.contributions = ret.contributions.map((c) => ({
        ...c,
        amount: c.amount instanceof mongoose.Types.Decimal128 ? parseFloat(c.amount.toString()) : c.amount,
      }));
    }
    delete ret.__v;
    return ret;
  },
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
export default SavingsGoal;


import mongoose from 'mongoose';

// ─── Budget model ─────────────────────────────────────────────────────────────

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
      maxlength: 100,
    },
    period: {
      type: String,
      enum: { values: ['weekly', 'monthly', 'yearly'], message: 'Period must be weekly, monthly, or yearly' },
      required: true,
    },
    periodStartDate: {
      type: Date,
      required: true,
    },
    periodEndDate: {
      type: Date,
      required: true,
    },
    totalBudget: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      validate: {
        validator(v) { return parseFloat(v.toString()) > 0; },
        message: 'Total budget must be greater than 0',
      },
    },
    currency: { type: String, default: 'INR', uppercase: true, maxlength: 3 },
    // Category-specific limits within this budget
    categoryLimits: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'FinanceCategory' },
        limit: { type: mongoose.Schema.Types.Decimal128, required: true },
        alertThreshold: {
          type: Number,
          min: 1,
          max: 100,
          default: 80,
          // Percentage of limit at which to send alert
        },
      },
    ],
    isActive: { type: Boolean, default: true },
    alertsEnabled: { type: Boolean, default: true },
    notes: { type: String, trim: true, maxlength: 500, default: null },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, period: 1, periodStartDate: -1 });
budgetSchema.index({ user: 1, isActive: 1 });
budgetSchema.index({ user: 1, periodStartDate: 1, periodEndDate: 1 });

budgetSchema.set('toJSON', {
  transform(doc, ret) {
    if (ret.totalBudget instanceof mongoose.Types.Decimal128) {
      ret.totalBudget = parseFloat(ret.totalBudget.toString());
    }
    if (Array.isArray(ret.categoryLimits)) {
      ret.categoryLimits = ret.categoryLimits.map((cl) => ({
        ...cl,
        limit: cl.limit instanceof mongoose.Types.Decimal128
          ? parseFloat(cl.limit.toString())
          : cl.limit,
      }));
    }
    delete ret.__v;
    return ret;
  },
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;


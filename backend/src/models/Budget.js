import mongoose from 'mongoose';

// ─── Budget model ─────────────────────────────────────────────────────────────
// Supports both CATEGORY and OVERALL budgets with WEEKLY, MONTHLY, or CUSTOM periods.
// All amounts stored as Decimal128 for financial precision.
// Strict user ownership enforced – all queries filter by req.userId.

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
      maxlength: [100, 'Budget name cannot exceed 100 characters'],
    },
    budgetType: {
      type: String,
      enum: {
        values: ['CATEGORY', 'OVERALL'],
        message: 'Budget type must be CATEGORY or OVERALL',
      },
      set: (v) => (v ? v.toUpperCase() : v),
      required: [true, 'Budget type is required'],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinanceCategory',
      default: null,
      index: true,
      validate: {
        validator(v) {
          // If budgetType is CATEGORY, category must be provided
          if (this.budgetType === 'CATEGORY' && !v) {
            return false;
          }
          return true;
        },
        message: 'Category is required for CATEGORY budget type',
      },
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Budget amount is required'],
      validate: {
        validator(v) {
          if (v == null) return false;
          const val = parseFloat(v.toString());
          return !isNaN(val) && val > 0;
        },
        message: 'Budget amount must be greater than 0',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      maxlength: 3,
    },
    period: {
      type: String,
      enum: {
        values: ['WEEKLY', 'MONTHLY', 'CUSTOM'],
        message: 'Period must be WEEKLY, MONTHLY, or CUSTOM',
      },
      set: (v) => (v ? v.toUpperCase() : v),
      required: [true, 'Period is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true,
      validate: {
        validator(v) {
          if (!this.startDate || !v) return true;
          return this.startDate < v;
        },
        message: 'Start date must be before end date',
      },
    },
    alertThreshold: {
      type: Number,
      min: [1, 'Alert threshold must be at least 1%'],
      max: [100, 'Alert threshold cannot exceed 100%'],
      default: 80,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// ─── Indexes ──────────────────────────────────────────────────────────────────
budgetSchema.index({ user: 1, isActive: 1 });
budgetSchema.index({ user: 1, budgetType: 1 });
budgetSchema.index({ user: 1, category: 1, startDate: 1, endDate: 1 });
budgetSchema.index({ user: 1, period: 1, startDate: -1 });

// ─── Aliases for compatibility ───────────────────────────────────────────────
budgetSchema.virtual('totalBudget')
  .get(function () {
    return this.amount != null ? parseFloat(this.amount.toString()) : 0;
  })
  .set(function (val) {
    this.amount = val;
  });

budgetSchema.virtual('periodStartDate')
  .get(function () {
    return this.startDate;
  })
  .set(function (val) {
    this.startDate = val;
  });

budgetSchema.virtual('periodEndDate')
  .get(function () {
    return this.endDate;
  })
  .set(function (val) {
    this.endDate = val;
  });

// ─── toJSON transform ─────────────────────────────────────────────────────────
budgetSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    if (ret.amount != null) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    ret.totalBudget = ret.amount;
    ret.periodStartDate = ret.startDate;
    ret.periodEndDate = ret.endDate;
    delete ret.__v;
    return ret;
  },
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;

import mongoose from 'mongoose';

// ─── RecurringTransaction model ───────────────────────────────────────────────
// Defines recurring transaction rules (income or expense) that generate real Transaction records.
// Supports daily, weekly, monthly, and yearly frequencies with customizable intervals.

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['INCOME', 'EXPENSE', 'income', 'expense'],
        message: 'Type must be INCOME or EXPENSE',
      },
      set: (v) => (v ? v.toUpperCase() : v),
      required: [true, 'Transaction type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Amount is required'],
      validate: {
        validator(v) {
          if (v == null) return false;
          const val = parseFloat(v.toString());
          return !isNaN(val) && val > 0;
        },
        message: 'Amount must be greater than 0',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      maxlength: 3,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinanceCategory',
      required: [true, 'Category is required'],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET', 'OTHER'],
        message: 'Invalid payment method',
      },
      set: (v) => {
        if (!v) return 'OTHER';
        const norm = v.toString().toUpperCase().trim().replace(/[\s-]+/g, '_');
        if (norm === 'CARD') return 'DEBIT_CARD';
        if (norm === 'NETBANKING' || norm === 'NET_BANKING') return 'BANK_TRANSFER';
        return norm;
      },
      default: 'OTHER',
    },
    frequency: {
      type: String,
      enum: {
        values: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'daily', 'weekly', 'monthly', 'yearly'],
        message: 'Frequency must be DAILY, WEEKLY, MONTHLY, or YEARLY',
      },
      set: (v) => (v ? v.toUpperCase() : v),
      required: [true, 'Frequency is required'],
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Interval must be at least 1'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    nextOccurrence: {
      type: Date,
      required: [true, 'Next occurrence date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    lastGeneratedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recurringTransactionSchema.index({ user: 1, isActive: 1 });
recurringTransactionSchema.index({ nextOccurrence: 1, isActive: 1 });

// Compatibility aliases
recurringTransactionSchema.virtual('nextDueDate')
  .get(function () { return this.nextOccurrence; })
  .set(function (val) { this.nextOccurrence = val; });

recurringTransactionSchema.virtual('lastProcessedDate')
  .get(function () { return this.lastGeneratedAt; })
  .set(function (val) { this.lastGeneratedAt = val; });

recurringTransactionSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    if (ret.amount != null) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    ret.nextDueDate = ret.nextOccurrence;
    ret.lastProcessedDate = ret.lastGeneratedAt;
    delete ret.__v;
    return ret;
  },
});

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);
export default RecurringTransaction;

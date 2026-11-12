import mongoose from 'mongoose';

// ─── Transaction model ────────────────────────────────────────────────────────
// Stores all income and expense transactions.
// Amounts stored as Decimal128 to preserve financial precision.
// Strict user ownership – queries must always filter by req.userId.

const transactionSchema = new mongoose.Schema(
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
    merchant: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
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
        if (norm === 'CHEQUE') return 'OTHER';
        return norm;
      },
      default: 'OTHER',
    },
    transactionDate: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
      index: true,
    },
    recurringTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTransaction',
      default: null,
    },
    receiptUrl: {
      type: String,
      default: null,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(v) {
          return !v || v.length <= 10;
        },
        message: 'Cannot have more than 10 tags per transaction',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: null,
    },
    isFoodExpense: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
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
transactionSchema.index({ user: 1, transactionDate: -1 });
transactionSchema.index({ user: 1, type: 1, transactionDate: -1 });
transactionSchema.index({ user: 1, category: 1, transactionDate: -1 });
transactionSchema.index({ user: 1, paymentMethod: 1 });
transactionSchema.index({ title: 'text', merchant: 'text', description: 'text' });

// ─── Virtual: amountNumber ───────────────────────────────────────────────────
transactionSchema.virtual('amountNumber').get(function () {
  return parseFloat(this.amount?.toString() ?? '0');
});

// ─── Aliases for compatibility ───────────────────────────────────────────────
transactionSchema.virtual('date')
  .get(function () {
    return this.transactionDate;
  })
  .set(function (val) {
    this.transactionDate = val;
  });

transactionSchema.virtual('merchantName')
  .get(function () {
    return this.merchant;
  })
  .set(function (val) {
    this.merchant = val;
  });

transactionSchema.virtual('source')
  .get(function () {
    return this.merchant;
  })
  .set(function (val) {
    this.merchant = val;
  });

// ─── toJSON transform ─────────────────────────────────────────────────────────
transactionSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    if (ret.amount != null) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    ret.date = ret.transactionDate;
    ret.merchantName = ret.merchant;
    delete ret.__v;
    return ret;
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

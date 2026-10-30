import mongoose from 'mongoose';

// ─── Transaction model ────────────────────────────────────────────────────────
// Stores all income and expense transactions.
// Amounts stored as Decimal128 to preserve precision.
// user field is required and enforced – no IDOR possible if queries filter by req.userId.

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: { values: ['income', 'expense', 'transfer'], message: 'Type must be income, expense, or transfer' },
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Amount is required'],
      validate: {
        validator(v) {
          return parseFloat(v.toString()) > 0;
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
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      validate: {
        validator(v) {
          // Allow dates up to 1 day in the future (for timezone edge cases)
          return v <= new Date(Date.now() + 86400000);
        },
        message: 'Transaction date cannot be in the future',
      },
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'cheque', 'wallet', 'other'],
      default: 'other',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(v) {
          return v.length <= 10;
        },
        message: 'Cannot have more than 10 tags per transaction',
      },
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, default: 'attachment' },
        size: { type: Number, default: 0 },
      },
    ],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTransaction',
      default: null,
    },
    // For food/grocery expense tracking
    isFoodExpense: {
      type: Boolean,
      default: false,
    },
    merchantName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1, date: -1 });
transactionSchema.index({ user: 1, isRecurring: 1 });
transactionSchema.index({ user: 1, isFoodExpense: 1, date: -1 });
// Text search index
transactionSchema.index({ description: 'text', merchantName: 'text', notes: 'text' });
// Compound for monthly summaries
transactionSchema.index({ user: 1, type: 1, date: 1 });

// ─── Virtual: amount as number ────────────────────────────────────────────────
transactionSchema.virtual('amountNumber').get(function () {
  return parseFloat(this.amount?.toString() ?? '0');
});

// ─── toJSON transform ─────────────────────────────────────────────────────────
transactionSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    if (ret.amount instanceof mongoose.Types.Decimal128) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    delete ret.__v;
    return ret;
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;


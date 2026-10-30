import mongoose from 'mongoose';

// ─── RecurringTransaction model ───────────────────────────────────────────────
// Defines a recurring income/expense rule. A job processes these to create
// actual Transaction documents.

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      validate: {
        validator(v) { return parseFloat(v.toString()) > 0; },
        message: 'Amount must be greater than 0',
      },
    },
    currency: { type: String, default: 'INR', uppercase: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinanceCategory',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 500,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'netbanking', 'cheque', 'wallet', 'other'],
      default: 'other',
    },
    frequency: {
      type: String,
      enum: { values: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'], message: 'Invalid frequency' },
      required: true,
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: null,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6, // 0 = Sunday
      default: null,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    nextDueDate: { type: Date, required: true },
    lastProcessedDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    totalOccurrences: { type: Number, default: 0 },
    notes: { type: String, trim: true, maxlength: 500, default: null },
  },
  { timestamps: true }
);

recurringTransactionSchema.index({ user: 1, isActive: 1 });
recurringTransactionSchema.index({ nextDueDate: 1, isActive: 1 }); // For cron job
recurringTransactionSchema.index({ user: 1, type: 1 });

recurringTransactionSchema.set('toJSON', {
  transform(doc, ret) {
    if (ret.amount instanceof mongoose.Types.Decimal128) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    delete ret.__v;
    return ret;
  },
});

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);
export default RecurringTransaction;


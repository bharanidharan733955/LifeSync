import mongoose from 'mongoose';

// ─── FinanceCategory model ────────────────────────────────────────────────────
// Categories for transactions. System categories are shared (user: null, isSystem: true);
// user categories are private (user: ObjectId, isSystem: false).
// Protected: users cannot edit or delete system categories.

const financeCategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system/global category
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['INCOME', 'EXPENSE', 'BOTH', 'income', 'expense', 'both'],
        message: 'Type must be INCOME, EXPENSE, or BOTH',
      },
      set: (v) => (v ? v.toUpperCase() : v),
      required: [true, 'Category type is required'],
    },
    icon: {
      type: String,
      default: 'tag',
      maxlength: 50,
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'],
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes
financeCategorySchema.index({ user: 1, type: 1, isActive: 1 });
financeCategorySchema.index({ isSystem: 1, type: 1, isActive: 1 });
financeCategorySchema.index(
  { user: 1, name: 1, type: 1 },
  { unique: true, partialFilterExpression: { user: { $ne: null } } }
);

const FinanceCategory = mongoose.model('FinanceCategory', financeCategorySchema);
export default FinanceCategory;

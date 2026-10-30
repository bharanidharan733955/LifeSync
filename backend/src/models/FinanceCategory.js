import mongoose from 'mongoose';

// ─── FinanceCategory model ────────────────────────────────────────────────────
// Categories for transactions. System categories are shared; user categories
// are private (user field set). IDOR protected – queries always filter by userId.

const financeCategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system/global category
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      enum: { values: ['income', 'expense', 'both'], message: 'Type must be income, expense, or both' },
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
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinanceCategory',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
financeCategorySchema.index({ user: 1, type: 1 });
financeCategorySchema.index({ isSystem: 1, type: 1 });
financeCategorySchema.index({ user: 1, isActive: 1 });
// Unique name per user (or per system for system categories)
financeCategorySchema.index(
  { user: 1, name: 1, type: 1 },
  { unique: true, partialFilterExpression: { user: { $ne: null } } }
);

const FinanceCategory = mongoose.model('FinanceCategory', financeCategorySchema);
export default FinanceCategory;


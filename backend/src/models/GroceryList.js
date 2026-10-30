import mongoose from 'mongoose';

// ─── GroceryList model ────────────────────────────────────────────────────────

const groceryListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 300, default: null },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    estimatedTotal: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
    },
    actualTotal: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
    },
    currency: { type: String, default: 'INR', uppercase: true },
    linkedDietPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietPlan',
      default: null,
    },
    shoppingDate: { type: Date, default: null },
    store: { type: String, trim: true, maxlength: 100, default: null },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

groceryListSchema.index({ user: 1, isCompleted: 1 });
groceryListSchema.index({ user: 1, createdAt: -1 });

groceryListSchema.set('toJSON', {
  transform(doc, ret) {
    for (const key of ['estimatedTotal', 'actualTotal']) {
      if (ret[key] instanceof mongoose.Types.Decimal128) {
        ret[key] = parseFloat(ret[key].toString());
      }
    }
    delete ret.__v;
    return ret;
  },
});

const GroceryList = mongoose.model('GroceryList', groceryListSchema);
export default GroceryList;


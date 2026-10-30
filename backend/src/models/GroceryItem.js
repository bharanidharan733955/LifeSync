import mongoose from 'mongoose';

// ─── GroceryItem model ────────────────────────────────────────────────────────

const groceryItemSchema = new mongoose.Schema(
  {
    groceryList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroceryList',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: 200,
    },
    quantity: { type: Number, min: 0.1, default: 1 },
    unit: {
      type: String,
      enum: ['g', 'kg', 'ml', 'L', 'pieces', 'cups', 'tbsp', 'tsp', 'packets', 'other'],
      default: 'pieces',
    },
    category: {
      type: String,
      enum: [
        'vegetables', 'fruits', 'dairy', 'meat_seafood', 'grains_cereals',
        'spices_condiments', 'snacks', 'beverages', 'cleaning', 'personal_care', 'other',
      ],
      default: 'other',
    },
    estimatedPrice: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
    },
    actualPrice: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
    },
    isPurchased: { type: Boolean, default: false },
    purchasedAt: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 200, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

groceryItemSchema.index({ groceryList: 1, user: 1 });
groceryItemSchema.index({ groceryList: 1, isPurchased: 1 });

groceryItemSchema.set('toJSON', {
  transform(doc, ret) {
    for (const key of ['estimatedPrice', 'actualPrice']) {
      if (ret[key] instanceof mongoose.Types.Decimal128) {
        ret[key] = parseFloat(ret[key].toString());
      }
    }
    delete ret.__v;
    return ret;
  },
});

const GroceryItem = mongoose.model('GroceryItem', groceryItemSchema);
export default GroceryItem;


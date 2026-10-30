import mongoose from 'mongoose';

// ─── FoodItem model ───────────────────────────────────────────────────────────
// The food database. Includes curated Indian foods, Open Food Facts products,
// and user-created custom foods.
// Nutrition values are per 100g (or per 100ml for liquids).

const nutritionPer100Schema = new mongoose.Schema(
  {
    calories: { type: Number, min: 0, default: 0 },       // kcal
    protein: { type: Number, min: 0, default: 0 },        // g
    carbohydrates: { type: Number, min: 0, default: 0 },  // g
    fat: { type: Number, min: 0, default: 0 },            // g
    fiber: { type: Number, min: 0, default: null },       // g
    sugar: { type: Number, min: 0, default: null },       // g (total sugar)
    // addedSugar: only known for packaged products that declare it
    addedSugar: { type: Number, min: 0, default: null },  // g – null = unknown
    saturatedFat: { type: Number, min: 0, default: null },// g
    transFat: { type: Number, min: 0, default: null },    // g
    sodium: { type: Number, min: 0, default: null },      // mg
    calcium: { type: Number, min: 0, default: null },     // mg
    iron: { type: Number, min: 0, default: null },        // mg
    potassium: { type: Number, min: 0, default: null },   // mg
    vitaminA: { type: Number, min: 0, default: null },    // mcg
    vitaminC: { type: Number, min: 0, default: null },    // mg
    vitaminD: { type: Number, min: 0, default: null },    // mcg
    vitaminB12: { type: Number, min: 0, default: null },  // mcg
    cholesterol: { type: Number, min: 0, default: null }, // mg
  },
  { _id: false }
);

const servingSizeSchema = new mongoose.Schema(
  {
    description: { type: String, required: true }, // e.g. "1 cup", "1 piece", "100g"
    grams: { type: Number, required: true, min: 0 }, // equivalent grams
  },
  { _id: false }
);

const foodItemSchema = new mongoose.Schema(
  {
    // Identity
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [200, 'Food name cannot exceed 200 characters'],
    },
    nameLocal: {
      // Regional/local name e.g. "இட்லி" for Idli
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
      default: null,
    },
    // Source
    source: {
      type: String,
      enum: ['system', 'open_food_facts', 'user_created', 'curated_indian'],
      default: 'system',
    },
    openFoodFactsId: {
      type: String,
      sparse: true,
      default: null,
    },
    // Owner (null for system/curated foods)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true, // User-created foods can be kept private
    },
    // Nutrition – always per 100g or 100ml
    nutritionPer100: {
      type: nutritionPer100Schema,
      required: true,
    },
    // Serving sizes
    servingSizes: {
      type: [servingSizeSchema],
      default: [{ description: '100g', grams: 100 }],
    },
    defaultServingSize: {
      type: String,
      default: '100g',
    },
    // Classification
    category: {
      type: String,
      enum: [
        'grains_cereals', 'legumes_pulses', 'vegetables', 'fruits',
        'dairy', 'meat_poultry', 'seafood', 'eggs', 'nuts_seeds',
        'oils_fats', 'sweets_desserts', 'snacks', 'beverages',
        'spices_condiments', 'packaged_foods', 'fast_food', 'indian_dishes',
        'soups_stews', 'other',
      ],
      default: 'other',
    },
    subcategory: { type: String, trim: true, maxlength: 50, default: null },
    tags: { type: [String], default: [] },
    cuisine: {
      type: String,
      enum: ['south_indian', 'north_indian', 'east_indian', 'west_indian', 'pan_indian', 'international', null],
      default: null,
    },
    // State
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // Data quality
    dataCompleteness: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    lastVerifiedAt: { type: Date, default: null },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
foodItemSchema.index({ name: 'text', brand: 'text', nameLocal: 'text', tags: 'text' });
foodItemSchema.index({ barcode: 1 }, { sparse: true });
foodItemSchema.index({ openFoodFactsId: 1 }, { sparse: true });
foodItemSchema.index({ source: 1, isActive: 1 });
foodItemSchema.index({ category: 1, isActive: 1 });
foodItemSchema.index({ createdBy: 1, isActive: 1 });
foodItemSchema.index({ isVerified: 1, isActive: 1 });
foodItemSchema.index({ cuisine: 1, isActive: 1 });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;


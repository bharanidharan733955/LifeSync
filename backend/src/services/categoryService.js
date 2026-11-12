import FinanceCategory from '../models/FinanceCategory.js';
import Transaction from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';

export const DEFAULT_SYSTEM_CATEGORIES = [
  // Expense
  { name: 'Food', type: 'EXPENSE', icon: 'utensils', color: '#f59e0b', description: 'Dining out, restaurants, cafes' },
  { name: 'Transport', type: 'EXPENSE', icon: 'car', color: '#3b82f6', description: 'Fuel, cab, public transit, parking' },
  { name: 'Shopping', type: 'EXPENSE', icon: 'shopping-bag', color: '#ec4899', description: 'Clothing, gadgets, electronics' },
  { name: 'Education', type: 'EXPENSE', icon: 'book', color: '#8b5cf6', description: 'Tuition, courses, books, materials' },
  { name: 'Healthcare', type: 'EXPENSE', icon: 'heart-pulse', color: '#ef4444', description: 'Medical, pharmacy, dental, therapy' },
  { name: 'Bills', type: 'EXPENSE', icon: 'receipt', color: '#f97316', description: 'Electricity, water, gas, internet' },
  { name: 'Entertainment', type: 'EXPENSE', icon: 'film', color: '#a855f7', description: 'Movies, concerts, streaming, hobbies' },
  { name: 'Rent', type: 'EXPENSE', icon: 'home', color: '#14b8a6', description: 'Housing rent, maintenance' },
  { name: 'Subscriptions', type: 'EXPENSE', icon: 'repeat', color: '#06b6d4', description: 'SaaS, digital subscriptions' },
  { name: 'Groceries', type: 'EXPENSE', icon: 'shopping-cart', color: '#10b981', description: 'Supermarket, provisions, vegetables' },
  { name: 'Travel', type: 'EXPENSE', icon: 'plane', color: '#6366f1', description: 'Flights, hotels, vacations' },
  { name: 'Others', type: 'EXPENSE', icon: 'more-horizontal', color: '#64748b', description: 'Miscellaneous expenses' },

  // Income
  { name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#10b981', description: 'Full-time or part-time salary' },
  { name: 'Freelance', type: 'INCOME', icon: 'laptop', color: '#3b82f6', description: 'Consulting, freelance contracts' },
  { name: 'Business', type: 'INCOME', icon: 'trending-up', color: '#8b5cf6', description: 'Business profits, revenue' },
  { name: 'Investment Income', type: 'INCOME', icon: 'pie-chart', color: '#06b6d4', description: 'Dividends, capital gains, interest' },
  { name: 'Scholarship', type: 'INCOME', icon: 'award', color: '#f59e0b', description: 'Academic grants, scholarships' },
  { name: 'Gift', type: 'INCOME', icon: 'gift', color: '#ec4899', description: 'Gifts, inheritances, rewards' },
  { name: 'Other Income', type: 'INCOME', icon: 'dollar-sign', color: '#64748b', description: 'Miscellaneous income sources' },
];

/**
 * Ensures system default categories are seeded into MongoDB.
 * Safe and idempotent.
 */
export const seedDefaultCategories = async () => {
  const operations = DEFAULT_SYSTEM_CATEGORIES.map((cat) => ({
    updateOne: {
      filter: { isSystem: true, name: cat.name, type: cat.type },
      update: {
        $setOnInsert: {
          user: null,
          isSystem: true,
          isActive: true,
          ...cat,
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await FinanceCategory.bulkWrite(operations);
  }
};

/**
 * Get all categories available for a user (System + User custom)
 */
export const getCategories = async (userId, typeFilter) => {
  // Ensure default categories exist
  await seedDefaultCategories();

  const query = {
    isActive: true,
    $or: [{ isSystem: true, user: null }, { user: userId }],
  };

  if (typeFilter) {
    const normType = typeFilter.toUpperCase();
    query.type = { $in: [normType, 'BOTH'] };
  }

  const categories = await FinanceCategory.find(query).sort({ isSystem: -1, name: 1 });
  return categories;
};

/**
 * Get single category by ID with ownership verification
 */
export const getCategoryById = async (categoryId, userId) => {
  const category = await FinanceCategory.findById(categoryId);
  if (!category || !category.isActive) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  // Check if system or owned by user
  if (!category.isSystem && category.user?.toString() !== userId.toString()) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  return category;
};

/**
 * Create a new user-defined category
 */
export const createCategory = async (userId, data) => {
  const { name, type, icon, color, description } = data;
  const normalizedType = type.toUpperCase();

  // Check duplicate for this user
  const existing = await FinanceCategory.findOne({
    user: userId,
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    type: normalizedType,
    isActive: true,
  });

  if (existing) {
    throw new AppError(
      `Category '${name}' for type '${normalizedType}' already exists in your account`,
      409,
      'CATEGORY_ALREADY_EXISTS'
    );
  }

  const category = await FinanceCategory.create({
    user: userId,
    name: name.trim(),
    type: normalizedType,
    icon: icon || 'tag',
    color: color || '#6366f1',
    description: description || null,
    isSystem: false,
    isActive: true,
  });

  return category;
};

/**
 * Update user custom category
 */
export const updateCategory = async (categoryId, userId, updateData) => {
  const category = await FinanceCategory.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (category.isSystem) {
    throw new AppError('System categories cannot be modified', 403, 'FORBIDDEN');
  }

  if (category.user?.toString() !== userId.toString()) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (updateData.name) category.name = updateData.name.trim();
  if (updateData.type) category.type = updateData.type.toUpperCase();
  if (updateData.icon) category.icon = updateData.icon;
  if (updateData.color) category.color = updateData.color;
  if (updateData.description !== undefined) category.description = updateData.description;
  if (updateData.isActive !== undefined) category.isActive = updateData.isActive;

  await category.save();
  return category;
};

/**
 * Delete user custom category with transaction safeguard
 */
export const deleteCategory = async (categoryId, userId) => {
  const category = await FinanceCategory.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (category.isSystem) {
    throw new AppError('System categories cannot be deleted', 403, 'FORBIDDEN');
  }

  if (category.user?.toString() !== userId.toString()) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  // Check if any transaction is linked to this category
  const activeTxCount = await Transaction.countDocuments({ category: categoryId });
  if (activeTxCount > 0) {
    throw new AppError(
      `Cannot delete category '${category.name}' because ${activeTxCount} transaction(s) are linked to it. Please reassign or delete those transactions first.`,
      400,
      'CATEGORY_IN_USE'
    );
  }

  await FinanceCategory.findByIdAndDelete(categoryId);
  return { message: 'Category deleted successfully' };
};


import mongoose from 'mongoose';

// ─── Precise decimal arithmetic utilities ────────────────────────────────────
// Financial amounts are stored as Decimal128 in MongoDB to avoid IEEE 754
// floating-point precision issues.  Nutritional values use Number but are
// validated to a fixed number of decimal places at the schema level.

/**
 * Convert a JavaScript number or string to Mongoose Decimal128.
 * Rounds to 2 decimal places (currency precision).
 * @param {number|string} value
 * @returns {mongoose.Types.Decimal128}
 */
export const toDecimal128 = (value) => {
  if (value == null) return mongoose.Types.Decimal128.fromString('0.00');
  const rounded = Number(value).toFixed(2);
  return mongoose.Types.Decimal128.fromString(rounded);
};

/**
 * Convert a Decimal128 value to a plain JavaScript number.
 * @param {mongoose.Types.Decimal128|null|undefined} decimal128
 * @returns {number}
 */
export const fromDecimal128 = (decimal128) => {
  if (decimal128 == null) return 0;
  return parseFloat(decimal128.toString());
};

/**
 * Format a Decimal128 as a currency string.
 * @param {mongoose.Types.Decimal128} decimal128
 * @param {string} [currency='INR']
 * @returns {string} e.g. "₹1,234.56"
 */
export const formatCurrency = (decimal128, currency = 'INR') => {
  const amount = fromDecimal128(decimal128);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Add two Decimal128 values precisely.
 * @param {mongoose.Types.Decimal128} a
 * @param {mongoose.Types.Decimal128} b
 * @returns {mongoose.Types.Decimal128}
 */
export const addDecimal128 = (a, b) => {
  const result = (fromDecimal128(a) * 100 + fromDecimal128(b) * 100) / 100;
  return toDecimal128(result);
};

/**
 * Subtract two Decimal128 values precisely.
 */
export const subtractDecimal128 = (a, b) => {
  const result = (fromDecimal128(a) * 100 - fromDecimal128(b) * 100) / 100;
  return toDecimal128(result);
};

/**
 * Multiply a Decimal128 value by a factor (for quantities/portions).
 */
export const multiplyDecimal128 = (a, factor) => {
  const result = (fromDecimal128(a) * 100 * factor) / 100;
  return toDecimal128(result);
};

// ─── Nutrition calculation helpers ──────────────────────────────────────────

/**
 * Calculate nutrient amount for a given serving.
 * Formula: nutrientPer100g * consumedQuantityG / 100
 * @param {number} per100g  - Nutrient amount per 100g
 * @param {number} quantityG - Consumed quantity in grams
 * @returns {number} nutrient amount, rounded to 2 decimal places
 */
export const calcNutrient = (per100g, quantityG) => {
  if (per100g == null || quantityG == null) return 0;
  return Math.round(((per100g * quantityG) / 100) * 100) / 100;
};

/**
 * Calculate sugar consumed.
 * Sugar consumed = Sugar per 100g × Consumed quantity / 100
 * @param {number} sugarPer100g
 * @param {number} consumedQuantityG
 * @returns {number}
 */
export const calcSugar = (sugarPer100g, consumedQuantityG) => {
  return calcNutrient(sugarPer100g, consumedQuantityG);
};

/**
 * Calculate BMI.
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number} BMI rounded to 1 decimal place
 */
export const calcBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

/**
 * Get BMI category.
 * @param {number} bmi
 * @returns {string}
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25.0) return 'Normal weight';
  if (bmi < 30.0) return 'Overweight';
  return 'Obese';
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor equation.
 * @param {object} params
 * @param {number} params.weightKg
 * @param {number} params.heightCm
 * @param {number} params.age
 * @param {'male'|'female'} params.gender
 * @param {string} params.activityLevel - sedentary|lightly_active|moderately_active|very_active|extra_active
 * @returns {number} TDEE in calories
 */
export const calcTDEE = ({ weightKg, heightCm, age, gender, activityLevel }) => {
  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};


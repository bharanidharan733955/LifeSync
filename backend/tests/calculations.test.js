// ─── Calculation utilities tests ──────────────────────────────────────────────
// Pure unit tests – no MongoDB required.
import { describe, it, expect } from 'vitest';
import {
  calcNutrient,
  calcSugar,
  calcBMI,
  getBMICategory,
  calcTDEE,
  toDecimal128,
  fromDecimal128,
  addDecimal128,
  subtractDecimal128,
} from '../src/utils/calculations.js';

describe('Nutrition Calculations', () => {
  describe('calcNutrient', () => {
    it('should correctly calculate nutrient for given quantity', () => {
      // 5g protein per 100g food, 200g consumed => 10g protein
      expect(calcNutrient(5, 200)).toBe(10);
    });

    it('should use the sugar formula: sugarPer100g * quantityG / 100', () => {
      // Sugar per 100g = 12g, consumed = 150g => 18g
      expect(calcSugar(12, 150)).toBe(18);
    });

    it('should return 0 for null inputs', () => {
      expect(calcNutrient(null, 100)).toBe(0);
      expect(calcNutrient(10, null)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      // (10/3) per100g, 100g consumed = 3.333... => 3.33
      expect(calcNutrient(10 / 3, 100)).toBe(3.33);
    });
  });

  describe('calcBMI', () => {
    it('should calculate BMI correctly (normal weight)', () => {
      // 70kg, 175cm => 70 / (1.75^2) = 22.857... => 22.9
      expect(calcBMI(70, 175)).toBe(22.9);
    });

    it('should return 0 for missing inputs', () => {
      expect(calcBMI(0, 175)).toBe(0);
      expect(calcBMI(70, 0)).toBe(0);
    });
  });

  describe('getBMICategory', () => {
    it('should return Underweight for BMI < 18.5', () => {
      expect(getBMICategory(17.0)).toBe('Underweight');
    });
    it('should return Normal weight for BMI 18.5-24.9', () => {
      expect(getBMICategory(22.0)).toBe('Normal weight');
    });
    it('should return Overweight for BMI 25-29.9', () => {
      expect(getBMICategory(27.5)).toBe('Overweight');
    });
    it('should return Obese for BMI >= 30', () => {
      expect(getBMICategory(32.0)).toBe('Obese');
    });
  });

  describe('calcTDEE', () => {
    it('should calculate TDEE for a sedentary male', () => {
      // 70kg, 175cm, 30 years old, male, sedentary
      // BMR = 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
      // TDEE = round(1648.75 * 1.2) = round(1978.5) = 1979
      const tdee = calcTDEE({
        weightKg: 70,
        heightCm: 175,
        age: 30,
        gender: 'male',
        activityLevel: 'sedentary',
      });
      expect(tdee).toBe(1979);
    });

    it('should give higher TDEE for very active vs sedentary', () => {
      const params = { weightKg: 70, heightCm: 175, age: 30, gender: 'male' };
      const sedentary = calcTDEE({ ...params, activityLevel: 'sedentary' });
      const veryActive = calcTDEE({ ...params, activityLevel: 'very_active' });
      expect(veryActive).toBeGreaterThan(sedentary);
    });
  });
});

describe('Financial Calculations (Decimal128)', () => {
  describe('toDecimal128 / fromDecimal128', () => {
    it('should convert number to Decimal128 and back', () => {
      const d = toDecimal128(1234.56);
      expect(fromDecimal128(d)).toBe(1234.56);
    });

    it('should round to 2 decimal places', () => {
      const d = toDecimal128(1234.567);
      expect(fromDecimal128(d)).toBe(1234.57);
    });

    it('should handle 0', () => {
      const d = toDecimal128(0);
      expect(fromDecimal128(d)).toBe(0);
    });

    it('should handle null gracefully', () => {
      expect(fromDecimal128(null)).toBe(0);
    });
  });

  describe('addDecimal128', () => {
    it('should add two decimal values precisely', () => {
      const a = toDecimal128(0.1);
      const b = toDecimal128(0.2);
      const result = addDecimal128(a, b);
      // 0.1 + 0.2 should be exactly 0.30, not 0.30000000000000004
      expect(fromDecimal128(result)).toBe(0.3);
    });

    it('should correctly add financial amounts', () => {
      const a = toDecimal128(1234.56);
      const b = toDecimal128(5678.90);
      const result = addDecimal128(a, b);
      expect(fromDecimal128(result)).toBe(6913.46);
    });
  });

  describe('subtractDecimal128', () => {
    it('should subtract two decimal values precisely', () => {
      const a = toDecimal128(10.0);
      const b = toDecimal128(3.33);
      const result = subtractDecimal128(a, b);
      expect(fromDecimal128(result)).toBe(6.67);
    });
  });
});

/**
 * Date and period calculation utilities for budgets and analytics.
 * Handles Monday-Sunday weekly boundaries and calendar-month boundaries consistently in UTC.
 */

/**
 * Get start and end of week (Monday 00:00:00.000 UTC to Sunday 23:59:59.999 UTC)
 * @param {Date|string} [referenceDate=new Date()]
 * @returns {{ startDate: Date, endDate: Date }}
 */
export const getWeekRange = (referenceDate = new Date()) => {
  const d = new Date(referenceDate);
  const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // Distance to Monday: if day is 0 (Sunday), diff is -6; otherwise 1 - day
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diffToMonday, 0, 0, 0, 0));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6, 23, 59, 59, 999));

  return { startDate: start, endDate: end };
};

/**
 * Get start and end of calendar month (1st day 00:00:00.000 UTC to last day 23:59:59.999 UTC)
 * Correctly accounts for leap years and month lengths.
 * @param {Date|string} [referenceDate=new Date()]
 * @returns {{ startDate: Date, endDate: Date }}
 */
export const getMonthRange = (referenceDate = new Date()) => {
  const d = new Date(referenceDate);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-indexed

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  // Day 0 of next month is the last day of the current month
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return { startDate: start, endDate: end };
};

/**
 * Normalize and compute date range for a given period
 * @param {'WEEKLY'|'MONTHLY'|'CUSTOM'} period
 * @param {Date|string} [userStart]
 * @param {Date|string} [userEnd]
 * @returns {{ startDate: Date, endDate: Date }}
 */
export const computeBudgetDates = (period, userStart, userEnd) => {
  const normPeriod = (period || 'MONTHLY').toUpperCase();

  if (normPeriod === 'WEEKLY') {
    return getWeekRange(userStart || new Date());
  }

  if (normPeriod === 'MONTHLY') {
    return getMonthRange(userStart || new Date());
  }

  // CUSTOM
  const start = userStart ? new Date(userStart) : new Date();
  let end = userEnd ? new Date(userEnd) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  // If time is 00:00:00 on end date, set to end of that day
  if (end.getUTCHours() === 0 && end.getUTCMinutes() === 0 && end.getUTCSeconds() === 0) {
    end.setUTCHours(23, 59, 59, 999);
  }

  return { startDate: start, endDate: end };
};


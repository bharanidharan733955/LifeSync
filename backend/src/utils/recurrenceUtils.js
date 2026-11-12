/**
 * Recurrence date calculation utility.
 * Handles DAILY, WEEKLY, MONTHLY, and YEARLY schedules with custom intervals.
 * Correctly accounts for month-end dates (29th, 30th, 31st) and leap years.
 */

/**
 * Returns the maximum days in a given year and month (0-indexed month).
 */
export const getDaysInMonth = (year, month) => {
  // Day 0 of month + 1 is the last day of month
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
};

/**
 * Compute the next occurrence date after a given reference date,
 * preserving the anchor day of month and handling calendar boundaries.
 * 
 * @param {Date|string} currentOccurrence - Current occurrence date
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY'} frequency
 * @param {number} [interval=1] - Multiplier (e.g. 2 for bi-weekly)
 * @param {Date|string} [anchorDate] - Original start date preserving target day-of-month
 * @returns {Date}
 */
export const computeNextOccurrence = (currentOccurrence, frequency, interval = 1, anchorDate = null) => {
  const current = new Date(currentOccurrence);
  const step = Math.max(1, parseInt(interval, 10) || 1);
  const normFreq = (frequency || 'MONTHLY').toUpperCase();

  const anchor = anchorDate ? new Date(anchorDate) : current;
  const targetDay = anchor.getUTCDate();

  const next = new Date(current.getTime());

  switch (normFreq) {
    case 'DAILY':
      next.setUTCDate(next.getUTCDate() + step);
      break;

    case 'WEEKLY':
      next.setUTCDate(next.getUTCDate() + 7 * step);
      break;

    case 'MONTHLY': {
      const currentYear = next.getUTCFullYear();
      const currentMonth = next.getUTCMonth();
      const targetMonth = currentMonth + step;

      const newYear = currentYear + Math.floor(targetMonth / 12);
      const newMonth = ((targetMonth % 12) + 12) % 12;

      // Handle shorter months: clamp to maximum days in that month
      const maxDays = getDaysInMonth(newYear, newMonth);
      const dayToSet = Math.min(targetDay, maxDays);

      next.setUTCFullYear(newYear, newMonth, dayToSet);
      break;
    }

    case 'YEARLY': {
      const newYear = next.getUTCFullYear() + step;
      const targetMonth = anchor.getUTCMonth();

      // Handle leap year (Feb 29 on non-leap year becomes Feb 28)
      const maxDays = getDaysInMonth(newYear, targetMonth);
      const dayToSet = Math.min(targetDay, maxDays);

      next.setUTCFullYear(newYear, targetMonth, dayToSet);
      break;
    }

    default:
      next.setUTCDate(next.getUTCDate() + step);
  }

  return next;
};


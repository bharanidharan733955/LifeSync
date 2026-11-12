import cron from 'node-cron';
import { generateDueTransactions } from '../services/recurringTransactionService.js';

let cronTask = null;

/**
 * Start the recurring transaction processor job.
 * Runs every hour by default: 0 * * * *
 */
export const startRecurringJob = (schedule = '0 * * * *') => {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  if (cronTask) {
    cronTask.stop();
  }

  cronTask = cron.schedule(schedule, async () => {
    try {
      console.log(`[RecurringJob] Executing due transactions processing at ${new Date().toISOString()}`);
      const result = await generateDueTransactions();
      console.log(`[RecurringJob] Processed: ${result.processedCount}, Generated: ${result.generatedCount}`);
    } catch (error) {
      console.error('[RecurringJob] Error during transaction generation:', error);
    }
  });

  console.log(`[RecurringJob] Scheduled recurring transactions with pattern: ${schedule}`);
  return cronTask;
};

/**
 * Stop the recurring transaction processor job.
 */
export const stopRecurringJob = () => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[RecurringJob] Stopped recurring transactions job.');
  }
};


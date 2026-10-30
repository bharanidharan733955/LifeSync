// ─── Async handler wrapper ───────────────────────────────────────────────────
// Wraps async route handlers to automatically forward errors to Express's
// next() error middleware, eliminating repetitive try/catch blocks.

/**
 * Wraps an async express route handler and forwards thrown errors to next().
 * @param {Function} fn - Async (req, res, next) handler
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;


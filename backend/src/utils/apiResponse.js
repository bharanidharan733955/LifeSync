// ─── API Response utilities ──────────────────────────────────────────────────
// Standardised JSON response helpers used across all controllers.
// All responses follow the structure:
//   { success, message, data, pagination?, errors? }

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {*}      options.data       - Response payload
 * @param {string} [options.message]  - Human-readable message
 * @param {number} [options.status]   - HTTP status code (default 200)
 * @param {object} [options.pagination] - Pagination metadata
 */
export const sendSuccess = (res, { data = null, message = 'Success', status = 200, pagination = null } = {}) => {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
};

/**
 * Send a created response (201).
 */
export const sendCreated = (res, { data = null, message = 'Created successfully' } = {}) => {
  return sendSuccess(res, { data, message, status: 201 });
};

/**
 * Send a no-content response (204).
 */
export const sendNoContent = (res) => {
  return res.status(204).end();
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} [options.message]  - Human-readable error message
 * @param {number} [options.status]   - HTTP status code (default 500)
 * @param {Array}  [options.errors]   - Validation errors array
 */
export const sendError = (res, { message = 'An error occurred', status = 500, errors = null } = {}) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

/**
 * Build a pagination metadata object for list responses.
 * @param {number} total    - Total number of documents
 * @param {number} page     - Current page (1-indexed)
 * @param {number} limit    - Items per page
 * @returns {object} pagination metadata
 */
export const buildPagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Parse and sanitize pagination query params.
 * @param {object} query - Express req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};


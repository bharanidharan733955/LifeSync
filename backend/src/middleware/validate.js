import { z } from 'zod';

// ─── Request validation middleware factory ───────────────────────────────────
// Uses Zod for schema validation. Returns Express middleware.

/**
 * Create a validation middleware for a given Zod schema.
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} [source='body'] - Which part of req to validate
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      // Zod v4 uses `result.error.issues`; v3 used `.errors`
      const issues = result.error.issues || result.error.errors || [];
      const errors = issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors,
      });
    }

    // Express 5 makes req.query a read-only getter, so we cannot assign it directly.
    // Instead, merge parsed properties into the existing object for 'query',
    // or replace body/params normally.
    if (source === 'query') {
      // Clear existing query keys and merge in the parsed result
      const parsed = result.data;
      for (const key of Object.keys(parsed)) {
        req.query[key] = parsed[key];
      }
    } else {
      req[source] = result.data;
    }
    next();
  };
};

/**
 * Validate multiple parts of the request.
 * @param {{ body?: z.ZodSchema, query?: z.ZodSchema, params?: z.ZodSchema }} schemas
 */
export const validateRequest = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    for (const [source, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        const issues = result.error.issues || result.error.errors || [];
        const errors = issues.map((e) => ({
          field: `${source}.${e.path.join('.')}`,
          message: e.message,
          code: e.code,
        }));
        allErrors.push(...errors);
      } else {
        if (source === 'query') {
          const parsed = result.data;
          for (const key of Object.keys(parsed)) {
            req.query[key] = parsed[key];
          }
        } else {
          req[source] = result.data;
        }
      }
    }

    if (allErrors.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: allErrors,
      });
    }

    next();
  };
};

export default validate;

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
      const errors = result.error.errors.map((e) => ({
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
    // Replace req[source] with the parsed (and potentially transformed) data
    req[source] = result.data;
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
        const errors = result.error.errors.map((e) => ({
          field: `${source}.${e.path.join('.')}`,
          message: e.message,
          code: e.code,
        }));
        allErrors.push(...errors);
      } else {
        req[source] = result.data;
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


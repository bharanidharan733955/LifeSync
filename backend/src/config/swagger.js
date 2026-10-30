import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

// ─── Swagger / OpenAPI configuration ────────────────────────────────────────
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'LifeTrack API',
      version: '1.0.0',
      description: `
# LifeTrack API

A comprehensive personal finance, diet and nutrition management platform API.

## Authentication
Most endpoints require a Bearer JWT token in the Authorization header.
Use the /auth/login endpoint to obtain tokens.

## Base URL
All endpoints are prefixed with \`/api/v1\`

## Response Format
All responses follow a consistent JSON structure:
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }  // when applicable
}
\`\`\`
      `,
      contact: {
        name: 'LifeTrack Team',
        email: 'api@lifetrack.app',
        url: 'https://lifetrack.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Development Server',
      },
      {
        url: `https://api.lifetrack.app/api/${env.API_VERSION}`,
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token. Obtain from /auth/login.',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and authorization' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Finance - Transactions', description: 'Income and expense transactions' },
      { name: 'Finance - Categories', description: 'Transaction categories' },
      { name: 'Finance - Budgets', description: 'Budget management' },
      { name: 'Finance - Savings', description: 'Savings goals' },
      { name: 'Nutrition - Profile', description: 'Nutrition and diet profile' },
      { name: 'Nutrition - Foods', description: 'Food database and search' },
      { name: 'Nutrition - Meals', description: 'Meal diary and logging' },
      { name: 'Nutrition - Water', description: 'Water intake tracking' },
      { name: 'Diet Plans', description: 'Meal planning' },
      { name: 'Fitness', description: 'Weight and activity tracking' },
      { name: 'Grocery', description: 'Grocery list management' },
      { name: 'AI', description: 'AI assistant endpoints' },
      { name: 'Analytics', description: 'Analytics and insights' },
      { name: 'Reports', description: 'PDF and CSV report generation' },
      { name: 'Notifications', description: 'Push notifications management' },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;


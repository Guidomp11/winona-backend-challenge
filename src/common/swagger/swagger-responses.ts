import { ApiResponseOptions } from '@nestjs/swagger';

export const SWAGGER_RESPONSES = {
  badRequest: (message = 'Validation failed'): ApiResponseOptions => ({
    status: 400,
    description: message,
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        statusCode: { type: 'number', example: 400 },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        path: { type: 'string', example: '/patients' },
        error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Validation failed' },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      },
    },
  }),

  notFound: (resource = 'Resource'): ApiResponseOptions => ({
    status: 404,
    description: `${resource} not found`,
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        statusCode: { type: 'number', example: 404 },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        path: { type: 'string', example: '/patients/999' },
        error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Patient not found' },
            error: { type: 'string', example: 'Not Found' },
          },
        },
      },
    },
  }),

  internalError: (): ApiResponseOptions => ({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        statusCode: { type: 'number', example: 500 },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        path: { type: 'string', example: '/patients' },
        error: { type: 'string', example: 'Internal server error' },
      },
    },
  }),
};

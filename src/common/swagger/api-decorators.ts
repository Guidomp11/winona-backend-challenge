import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SWAGGER_RESPONSES } from './swagger-responses';

type SchemaName = 'Patient' | 'Medication' | 'Prescription';

const schemaRef = (name: SchemaName) => `#/components/schemas/${name}`;

const successSchema = (dataRef: string) => ({
  type: 'object',
  properties: {
    status: { type: 'string', example: 'success' },
    data: { $ref: dataRef },
  },
});

const paginatedSchema = (schema: SchemaName) => ({
  type: 'object',
  properties: {
    status: { type: 'string', example: 'success' },
    data: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: schemaRef(schema) } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 1, description: 'Total records' },
            page: { type: 'number', example: 1, description: 'Current page' },
            lastPage: { type: 'number', example: 1, description: 'Last page' },
          },
        },
      },
    },
  },
});

export const ApiPaginationQuery = () =>
  applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
  );

export const ApiIdParam = (param = 'id', description = 'Resource ID') =>
  ApiParam({ name: param, type: Number, description, example: 1 });

export const ApiCreate = (
  schema: SchemaName,
  bodyType: Type,
  options: { summary: string; description: string; badRequest?: string },
) =>
  applyDecorators(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiBody({ type: bodyType }),
    ApiResponse({
      status: 201,
      description: `${schema} created successfully`,
      schema: successSchema(schemaRef(schema)),
    }),
    ApiResponse(
      SWAGGER_RESPONSES.badRequest(options.badRequest ?? 'Invalid data'),
    ),
    ApiResponse(SWAGGER_RESPONSES.internalError()),
  );

export const ApiPaginatedList = (
  schema: SchemaName,
  options: { summary: string; description: string },
) =>
  applyDecorators(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiPaginationQuery(),
    ApiResponse({
      status: 200,
      description: `Paginated list of ${schema.toLowerCase()}s`,
      schema: paginatedSchema(schema),
    }),
    ApiResponse(SWAGGER_RESPONSES.internalError()),
  );

export const ApiGetOne = (
  schema: SchemaName,
  options: { summary: string; description: string; notFound?: string },
) =>
  applyDecorators(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiIdParam(),
    ApiResponse({
      status: 200,
      description: `${schema} found`,
      schema: successSchema(schemaRef(schema)),
    }),
    ApiResponse(
      SWAGGER_RESPONSES.notFound(options.notFound ?? `${schema} not found`),
    ),
    ApiResponse(SWAGGER_RESPONSES.badRequest('Invalid ID')),
    ApiResponse(SWAGGER_RESPONSES.internalError()),
  );

export const ApiUpdate = (
  schema: SchemaName,
  bodyType: Type,
  options: { summary: string; description: string; notFound?: string },
) =>
  applyDecorators(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiIdParam(),
    ApiBody({ type: bodyType }),
    ApiResponse({
      status: 200,
      description: `${schema} updated successfully`,
      schema: successSchema(schemaRef(schema)),
    }),
    ApiResponse(
      SWAGGER_RESPONSES.notFound(options.notFound ?? `${schema} not found`),
    ),
    ApiResponse(SWAGGER_RESPONSES.badRequest('Invalid data')),
    ApiResponse(SWAGGER_RESPONSES.internalError()),
  );

export const ApiDelete = (options: {
  summary: string;
  description: string;
  notFound?: string;
  badRequest?: string;
}) =>
  applyDecorators(
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    ApiIdParam(),
    ApiResponse({ status: 200, description: 'Deleted successfully' }),
    ApiResponse(
      SWAGGER_RESPONSES.notFound(options.notFound ?? 'Resource not found'),
    ),
    ApiResponse(
      SWAGGER_RESPONSES.badRequest(options.badRequest ?? 'Invalid ID'),
    ),
    ApiResponse(SWAGGER_RESPONSES.internalError()),
  );

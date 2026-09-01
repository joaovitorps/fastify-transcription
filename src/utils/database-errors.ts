import { DrizzleQueryError } from "drizzle-orm/errors";
import { ERROR_CODES } from "../schemas/error-schemas.ts";

export const POSTGRES_ERROR_CODES = {
  uniqueViolation: "23505",
  foreignKeyViolation: "23503",
  notNullViolation: "23502",
  checkViolation: "23514",
} as const;

export type PgError = DrizzleQueryError & {
  code?: string;
  constraint?: string;
};

function resolveError(error: PgError): PgError | null {
  const cause = error.cause;

  if (cause instanceof Error && typeof (cause as PgError).code === "string") {
    return cause as PgError;
  }

  if (cause instanceof Error && isConnectionError(cause as PgError)) {
    return cause as PgError;
  }

  return null;
}

export function isDatabaseError(error: unknown): error is PgError {
  return error instanceof DrizzleQueryError;
}

function isConnectionError(error: PgError): boolean {
  return error.code === "ECONNREFUSED" || error.code === "ECONNRESET";
}

export type MappedDatabaseError = {
  statusCode: number;
  message: string;
  code: string;
  details?: string;
};

export function mapDatabaseError(pgError: PgError): MappedDatabaseError {
  const resolved = resolveError(pgError) ?? pgError;

  if (isConnectionError(resolved)) {
    return withDetails(
      {
        statusCode: 503,
        message: "Service unavailable - database connection failed",
        code: ERROR_CODES.databaseUnavailable,
      },
      resolved.message,
    );
  }

  switch (resolved.code) {
    case POSTGRES_ERROR_CODES.foreignKeyViolation:
      return withDetails(
        {
          statusCode: 400,
          message: "Referenced record does not exist",
          code: ERROR_CODES.foreignKeyViolation,
        },
        resolved.message,
      );
    case POSTGRES_ERROR_CODES.notNullViolation:
      return withDetails(
        {
          statusCode: 400,
          message: "Missing required field",
          code: ERROR_CODES.notNullViolation,
        },
        resolved.message,
      );
    case POSTGRES_ERROR_CODES.checkViolation:
      return withDetails(
        {
          statusCode: 400,
          message: "Data validation failed",
          code: ERROR_CODES.checkViolation,
        },
        resolved.message,
      );
    default:
      return withDetails(
        {
          statusCode: 500,
          message: "Internal Server Error",
          code: ERROR_CODES.databaseError,
        },
        resolved.message,
      );
  }
}

function withDetails(
  base: MappedDatabaseError,
  details: string,
): MappedDatabaseError {
  if (process.env.NODE_ENV === "production") {
    return base;
  }

  return { ...base, details };
}

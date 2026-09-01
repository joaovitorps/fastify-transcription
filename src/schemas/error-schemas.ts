import { z } from "zod";

export const ERROR_CODES = {
  validation: "VALIDATION_ERROR",
  uniqueViolation: "UNIQUE_VIOLATION",
  foreignKeyViolation: "FOREIGN_KEY_VIOLATION",
  notNullViolation: "NOT_NULL_VIOLATION",
  checkViolation: "CHECK_VIOLATION",
  databaseUnavailable: "DATABASE_UNAVAILABLE",
  databaseError: "DATABASE_ERROR",
  notFound: "NOT_FOUND",
  rootApplication: "ROOT_APPLICATION",
} as const;

export const errorSchema = z.object({
  statusCode: z.number().int().positive().min(300).max(599),
  message: z.string(),
  code: z.enum([
    ERROR_CODES.validation,
    ERROR_CODES.uniqueViolation,
    ERROR_CODES.foreignKeyViolation,
    ERROR_CODES.notNullViolation,
    ERROR_CODES.checkViolation,
    ERROR_CODES.databaseUnavailable,
    ERROR_CODES.databaseError,
    ERROR_CODES.notFound,
    ERROR_CODES.rootApplication,
  ]),
  issues: z.array(z.unknown()).optional(),
  details: z.string().optional(),
});

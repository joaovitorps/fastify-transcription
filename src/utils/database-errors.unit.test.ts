import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { ERROR_CODES } from "../schemas/error-schemas.ts";
import {
  POSTGRES_ERROR_CODES,
  isDatabaseError,
  mapDatabaseError,
} from "./database-errors.ts";

function createPgError(code: string): DrizzleQueryError {
  const cause = Object.assign(new Error("PostgreSQL error"), { code });
  return new DrizzleQueryError("SELECT 1", [], cause);
}

describe("isDatabaseError", () => {
  it("returns true for a DrizzleQueryError", () => {
    assert.equal(isDatabaseError(createPgError("23505")), true);
  });

  it("returns false for a plain Error", () => {
    assert.equal(isDatabaseError(new Error("boom")), false);
  });

  it("returns false for non-error values", () => {
    assert.equal(isDatabaseError(undefined), false);
  });
});

describe("mapDatabaseError", () => {
  it("maps a connection error to 503 database unavailable", () => {
    const error = createPgError("ECONNREFUSED");

    const mapped = mapDatabaseError(error);

    assert.equal(mapped.statusCode, 503);
    assert.equal(mapped.code, ERROR_CODES.databaseUnavailable);
    assert.equal(
      mapped.message,
      "Service unavailable - database connection failed",
    );
    assert.equal(mapped.details, "PostgreSQL error");
  });

  it("maps a foreign key violation to 400", () => {
    const mapped = mapDatabaseError(
      createPgError(POSTGRES_ERROR_CODES.foreignKeyViolation),
    );

    assert.equal(mapped.statusCode, 400);
    assert.equal(mapped.code, ERROR_CODES.foreignKeyViolation);
    assert.equal(mapped.message, "Referenced record does not exist");
  });

  it("maps a not null violation to 400", () => {
    const mapped = mapDatabaseError(
      createPgError(POSTGRES_ERROR_CODES.notNullViolation),
    );

    assert.equal(mapped.statusCode, 400);
    assert.equal(mapped.code, ERROR_CODES.notNullViolation);
    assert.equal(mapped.message, "Missing required field");
  });

  it("maps a check violation to 400", () => {
    const mapped = mapDatabaseError(
      createPgError(POSTGRES_ERROR_CODES.checkViolation),
    );

    assert.equal(mapped.statusCode, 400);
    assert.equal(mapped.code, ERROR_CODES.checkViolation);
    assert.equal(mapped.message, "Data validation failed");
  });

  it("maps an unmapped PostgreSQL error to 500 database error", () => {
    const mapped = mapDatabaseError(
      createPgError(POSTGRES_ERROR_CODES.uniqueViolation),
    );

    assert.equal(mapped.statusCode, 500);
    assert.equal(mapped.code, ERROR_CODES.databaseError);
    assert.equal(mapped.message, "Internal Server Error");
  });

  it("omits the details field in production", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const mapped = mapDatabaseError(createPgError("23505"));

      assert.equal("details" in mapped, false);
      assert.equal(mapped.statusCode, 500);
    } finally {
      if (previousNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousNodeEnv;
      }
    }
  });
});
/**
 * Assertion helpers for testing SDK error handling.
 */

import { ManifestPayError } from '../errors/base.js';
import { ManifestPayApiError } from '../errors/generated.js';

/**
 * Assert that an error is an ManifestPayError with an expected HTTP status.
 *
 * @example
 *   try { await sdk.payments.get('bad'); }
 *   catch (err) { expectApiError(err, 404); }
 */
export function expectApiError(error: unknown, expectedStatus?: number): ManifestPayError {
  if (!(error instanceof ManifestPayError)) {
    throw new Error(`Expected ManifestPayError, got ${typeof error}: ${String(error)}`);
  }
  if (expectedStatus !== undefined && error.status !== expectedStatus) {
    throw new Error(
      `Expected error with status ${expectedStatus}, got ${error.status} (code: ${error.code})`,
    );
  }
  return error;
}

/**
 * Assert that an error is an ManifestPayApiError with a specific error code.
 *
 * @example
 *   try { await sdk.verification.verifyWork({...}); }
 *   catch (err) { expectApiErrorWithCode(err, 'ERR_VALIDATION_FAILED'); }
 */
export function expectApiErrorWithCode(error: unknown, expectedCode: string): ManifestPayApiError {
  if (!(error instanceof ManifestPayApiError)) {
    throw new Error(
      `Expected ManifestPayApiError, got ${typeof error}: ${String(error)}`,
    );
  }
  if (error.code !== expectedCode) {
    throw new Error(`Expected error code '${expectedCode}', got '${error.code}'`);
  }
  return error;
}

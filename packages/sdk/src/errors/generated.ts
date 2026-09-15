import { ERROR_CODE_REGISTRY, type ErrorCode, type ErrorCodeDefinition } from '@manifestpay/error-codes';
import { ManifestPayError } from './base.js';

export class ManifestPayApiError extends ManifestPayError {
  readonly registryEntry: ErrorCodeDefinition;

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    const entry = ERROR_CODE_REGISTRY[code];
    super(message ?? entry.message, { status: entry.httpStatus, code, details });
    this.name = `${code
      .replace(/^ERR_/, '')
      .toLowerCase()
      .replace(/(^|_)([a-z])/g, (_match: string, _prefix: string, char: string) => char.toUpperCase())}Error`;
    this.registryEntry = entry;
  }
}

export class AuthUnauthenticatedError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_AUTH_UNAUTHENTICATED', message, details);
  }
}

export class AuthForbiddenError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_AUTH_FORBIDDEN', message, details);
  }
}

export class RequestValidationError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_VALIDATION_FAILED', message, details);
  }
}

export class ConfigInvalidValueError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_CONFIG_INVALID_VALUE', message, details);
  }
}

export class ResourceNotFoundError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_RESOURCE_NOT_FOUND', message, details);
  }
}

export class ConfigConflictError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_CONFIG_CONFLICT', message, details);
  }
}

export class PaymentInsufficientFundsError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_PAYMENT_INSUFFICIENT_FUNDS', message, details);
  }
}

export class BlockchainTransactionFailedError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_BLOCKCHAIN_TRANSACTION_FAILED', message, details);
  }
}

export class ApiRateLimitError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_RATE_LIMIT_EXCEEDED', message, details);
  }
}

export class InternalApiError extends ManifestPayApiError {
  constructor(message?: string, details?: unknown) {
    super('ERR_INTERNAL', message, details);
  }
}

const ERROR_CLASS_BY_CODE = {
  ERR_AUTH_UNAUTHENTICATED: AuthUnauthenticatedError,
  ERR_AUTH_FORBIDDEN: AuthForbiddenError,
  ERR_VALIDATION_FAILED: RequestValidationError,
  ERR_RESOURCE_NOT_FOUND: ResourceNotFoundError,
  ERR_CONFIG_INVALID_VALUE: ConfigInvalidValueError,
  ERR_CONFIG_CONFLICT: ConfigConflictError,
  ERR_PAYMENT_INSUFFICIENT_FUNDS: PaymentInsufficientFundsError,
  ERR_BLOCKCHAIN_TRANSACTION_FAILED: BlockchainTransactionFailedError,
  ERR_RATE_LIMIT_EXCEEDED: ApiRateLimitError,
  ERR_INTERNAL: InternalApiError,
} satisfies Record<ErrorCode, new (message?: string, details?: unknown) => ManifestPayApiError>;

export function createTypedApiError(code: string, message?: string, details?: unknown): ManifestPayApiError {
  const ErrorClass = ERROR_CLASS_BY_CODE[code as ErrorCode] ?? InternalApiError;
  return new ErrorClass(message, details);
}

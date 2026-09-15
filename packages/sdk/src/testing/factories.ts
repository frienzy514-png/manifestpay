/**
 * Factory functions for creating test clients and SDK instances.
 */

import { ManifestPaySDK } from '../index.js';
import { ManifestPayClient } from '../client.js';
import type { ManifestPayClientOptions } from '../types.js';

export type TestClientOptions = Partial<ManifestPayClientOptions> & {
  baseUrl?: string;
  apiKey?: string;
};

/**
 * Create a test client pointed at a mock server.
 */
export function createTestClient(options: TestClientOptions = {}): ManifestPayClient {
  return new ManifestPayClient({
    baseUrl: options.baseUrl ?? 'http://127.0.0.1:0/api/v1',
    apiKey: options.apiKey ?? 'test_api_key',
    timeoutMs: options.timeoutMs ?? 5000,
    retry: options.retry ?? { attempts: 0, baseDelayMs: 0 },
  });
}

/**
 * Create a test SDK instance pointed at a mock server.
 */
export function createTestSDK(options: TestClientOptions = {}): ManifestPaySDK {
  return new ManifestPaySDK({
    baseUrl: options.baseUrl ?? 'http://127.0.0.1:0/api/v1',
    apiKey: options.apiKey ?? 'test_api_key',
    timeoutMs: options.timeoutMs ?? 5000,
    retry: options.retry ?? { attempts: 0, baseDelayMs: 0 },
  });
}

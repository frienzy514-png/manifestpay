/**
 * ManifestPay TypeScript SDK (generated)
 * @see http://localhost:3001/api/v1
 */
import createClient from 'openapi-fetch';
import type { paths } from './schema.js';

export function createManifestPayClient(token: string, baseUrl = 'http://localhost:3001/api/v1') {
  return createClient<paths>({
    baseUrl,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default createManifestPayClient;

/**
 * Runnable example: npx tsx examples/getting-started.ts
 * Requires MANIFESTPAY_API_KEY and optional MANIFESTPAY_BASE_URL
 */
import { createManifestPaySDK } from '../src/index.js';

async function main() {
  const sdk = createManifestPaySDK({
    baseUrl: process.env.MANIFESTPAY_BASE_URL ?? 'http://localhost:3001/api/v1',
    apiKey: process.env.MANIFESTPAY_API_KEY ?? 'test_key',
  });

  const health = await fetch(
    (process.env.MANIFESTPAY_BASE_URL ?? 'http://localhost:3001').replace(/\/api\/v1$/, '') + '/health',
  );
  console.log('API health:', health.status);

  console.log('SDK ready:', typeof sdk.payments.createSplitConfig === 'function');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

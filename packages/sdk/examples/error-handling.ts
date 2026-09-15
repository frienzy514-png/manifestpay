/**
 * Runnable example: npx tsx examples/error-handling.ts
 */
import { createManifestPaySDK, RateLimitError, ManifestPayError } from '../src/index.js';

async function main() {
  const sdk = createManifestPaySDK({
    baseUrl: process.env.MANIFESTPAY_BASE_URL ?? 'http://localhost:3001/api/v1',
    apiKey: 'invalid_key_for_demo',
  });

  try {
    await sdk.payments.getSplitConfig('nonexistent');
  } catch (err) {
    if (err instanceof RateLimitError) {
      console.log('Rate limited', err.details);
    } else if (err instanceof ManifestPayError) {
      console.log('API error:', err.code, err.status, err.message);
    } else {
      console.log('Unexpected:', err);
    }
  }
}

main();

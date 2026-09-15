# Webhook Signatures

ManifestPay signs every outbound webhook with HMAC-SHA256 using the merchant webhook secret.

Headers:

- `X-ManifestPay-Signature`: versioned signature, for example `v1=<hex digest>`
- `X-ManifestPay-Timestamp`: Unix timestamp in seconds
- `X-ManifestPay-Signature-Version`: signature version
- `X-ManifestPay-Event-Id`: event id

The signed message is:

```text
timestamp + "." + raw_request_body
```

Reject webhooks when the timestamp is more than 5 minutes from local time.

```ts
import { verifyWebhookSignature } from '@manifestpay/sdk';

const valid = verifyWebhookSignature({
  payload: rawBody,
  signature: req.headers['x-manifestpay-signature'],
  timestamp: req.headers['x-manifestpay-timestamp'],
  secret: process.env.MANIFESTPAY_WEBHOOK_SECRET!,
});
```

Webhook bodies also include `webhook.signature` for systems that cannot inspect headers. Prefer header verification when possible because it binds the raw request body.

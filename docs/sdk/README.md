# ManifestPay SDK Documentation

Official SDKs for integrating with the ManifestPay payment platform.

## Available SDKs

| Language | Package | Version | Status |
|----------|---------|---------|--------|
| TypeScript | `@manifestpay/sdk` | 0.1.0 | ✅ Stable |
| Python | `manifestpay` | 0.1.0 | ✅ Stable |
| Go | `github.com/frienzy514-png/manifestpay/sdks/go` | 0.1.0 | ✅ Stable |

## Quick Start

### TypeScript

```bash
npm install @manifestpay/sdk
```

```typescript
import { createManifestPaySDK } from '@manifestpay/sdk';

const sdk = createManifestPaySDK({
  baseUrl: 'https://api.manifestpay.com/api/v1',
  apiKey: process.env.MANIFESTPAY_API_KEY,
});

// Verify freelancer work
const result = await sdk.verification.verifyWork({
  repositoryUrl: 'https://github.com/user/repo',
  milestoneDescription: 'Implement login page',
  projectId: 'proj_123',
});
```

### Python

```bash
pip install manifestpay
```

```python
from manifestpay import create_manifestpay_sdk
from manifestpay.types import VerificationRequest

sdk = create_manifestpay_sdk(
    base_url="https://api.manifestpay.com/api/v1",
    api_key="your-api-key",
)

result = sdk.verification.verify_work(
    VerificationRequest(
        repository_url="https://github.com/user/repo",
        milestone_description="Implement login page",
        project_id="proj_123",
    )
)
```

### Go

```bash
go get github.com/frienzy514-png/manifestpay/sdks/go
```

```go
package main

import (
    "context"
    "github.com/frienzy514-png/manifestpay/sdks/go/manifestpay"
)

func main() {
    client := manifestpay.New("https://api.manifestpay.com/api/v1", "your-api-key")
    ctx := context.Background()

    result, err := client.Verification.Verify(ctx, manifestpay.VerificationRequest{
        RepositoryURL:        "https://github.com/user/repo",
        MilestoneDescription: "Implement login page",
        ProjectID:            "proj_123",
    })
}
```

## API Coverage

All SDKs cover the following ManifestPay API areas:

| Module | Description |
|--------|-------------|
| **Verification** | AI-powered work verification and invoice generation |
| **Payments** | Split payment configuration and execution |
| **Subscriptions** | Plan creation, enrollment, pause/cancel |
| **Invoices** | Invoice generation and listing |
| **Escrow** | Escrow creation, funding, and milestone management |
| **Disputes** | Dispute filing, responses, and resolution |
| **Stellar** | Blockchain transaction and payment lookups |
| **Sandbox** | Sandbox environment controls |
| **Webhooks** | Webhook signature verification |

## Error Handling

All SDKs provide typed error hierarchies:

| Error | HTTP Status | Description |
|-------|-------------|-------------|
| `AuthenticationError` | 401 | Invalid or missing credentials |
| `AuthorizationError` | 403 | Insufficient permissions |
| `ValidationError` | 400 | Invalid request parameters |
| `NotFoundError` | 404 | Resource not found |
| `RateLimitError` | 429 | Too many requests |
| `NetworkError` | — | Connection or timeout failure |

### TypeScript

```typescript
import { ManifestPayError, ValidationError, RateLimitError } from '@manifestpay/sdk';

try {
  await sdk.verification.verifyWork({...});
} catch (err) {
  if (err instanceof ValidationError) {
    console.log('Bad input:', err.details);
  } else if (err instanceof RateLimitError) {
    // Implement backoff
  } else if (err instanceof ManifestPayError) {
    console.log(`Error ${err.status}: ${err.message}`);
  }
}
```

### Python

```python
from manifestpay import ManifestPayError, ValidationError, RateLimitError

try:
    sdk.verification.verify_work(...)
except ValidationError as e:
    print(f"Bad input: {e.details}")
except RateLimitError:
    # Implement backoff
    pass
except ManifestPayError as e:
    print(f"Error {e.status}: {e.message}")
```

### Go

```go
result, err := client.Verification.Verify(ctx, params)
if err != nil {
    if apiErr, ok := err.(*manifestpay.APIError); ok {
        fmt.Printf("Error %d: %s (code=%s)\n", apiErr.StatusCode, apiErr.Message, apiErr.Code)
    }
}
```

## Testing

### SDK Testing Utilities

All SDKs ship with testing utilities for mocking the API in your test suite.

#### TypeScript

```typescript
import { MockManifestPayServer, createTestSDK, factories } from '@manifestpay/sdk-testing';

const server = await MockManifestPayServer.create({
  routes: [
    { method: 'POST', path: '/verification/verify', body: factories.verification() },
  ],
});

const sdk = createTestSDK({ baseUrl: server.url });
const result = await sdk.verification.verifyWork({...});

// Assert requests
const requests = server.getRequests();
expect(requests).toHaveLength(1);

await server.close();
```

#### Python

```python
from manifestpay.testing import MockManifestPayServer, MockRoute, create_test_sdk

server = MockManifestPayServer()
server.add_route(MockRoute("POST", "/verification/verify", body={"id": "v_1", "status": "verified"}))
server.start()

sdk = create_test_sdk(base_url=server.url)
result = sdk.verification.verify_work(...)

requests = server.get_requests()
assert len(requests) == 1

server.stop()
```

## Authentication

### API Key Authentication

```typescript
// TypeScript
const sdk = createManifestPaySDK({ apiKey: 'sk_live_...' });
```

```python
# Python
sdk = create_manifestpay_sdk(api_key="sk_live_...")
```

```go
// Go
client := manifestpay.New("https://api.manifestpay.com/api/v1", "sk_live_...")
```

### OAuth / Bearer Token

```typescript
// TypeScript
import { createManifestPaySDK } from '@manifestpay/sdk';

const sdk = createManifestPaySDK(
  { baseUrl: 'https://api.manifestpay.com/api/v1' },
  { getAccessToken: async () => myAuthService.getToken() }
);
```

## Retry Configuration

All SDKs automatically retry on transient failures (429, 5xx) with exponential backoff.

```typescript
// TypeScript
const sdk = createManifestPaySDK({
  baseUrl: '...',
  apiKey: '...',
  retry: { attempts: 3, baseDelayMs: 500 },
});
```

```python
# Python
from manifestpay.client import RetryConfig

sdk = create_manifestpay_sdk(
    base_url="...",
    api_key="...",
    retry=RetryConfig(attempts=3, base_delay_ms=500),
)
```

## Documentation Links

- [SDK Error Handling Guide](./ERROR-HANDLING.md)
- [SDK Migration from REST](./MIGRATION-FROM-REST.md)
- [SDK Versioning Policy](./VERSIONING.md)
- [SDK Testing Guide](./TESTING.md)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to the SDKs.

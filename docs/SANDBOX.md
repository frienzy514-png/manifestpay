# Sandbox Environment Guide

The ManifestPay sandbox provides a complete, isolated testing environment — mock payments, mock blockchain, wallet generation, webhook simulation, test-data seeding, and a sandbox-to-production migration wizard — without touching real funds or the actual blockchain.

## Quick Start

### 1. Setup

```bash
bash scripts/setup-sandbox.sh
```

This creates sandbox directories, copies the environment template, installs dependencies, and generates API documentation.

### 2. Configure Environment

```bash
cp .env.sandbox.example .env.sandbox
```

Key settings:

```bash
SANDBOX_MODE=true
FAKE_PAYMENTS_ENABLED=true
TEST_DATA_SEEDING_ENABLED=true
MOCK_WEBHOOKS_ENABLED=true
SANDBOX_LOG_WEBHOOKS=true
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false          # relaxed in sandbox

STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

`NODE_ENV` must also be `sandbox` or `development` for sandbox routes to activate.

### 3. Start Services

```bash
cd backend && npm run dev      # http://localhost:3000/api/v1 (or :3001, see below)
cd frontend && npm run dev     # in another terminal
```

## Features

### Sandbox Accounts

Create merchant accounts with a pre-funded fake balance:

```bash
POST /api/v1/sandbox/accounts
{
  "tenantId": "your-tenant-id",
  "name": "Test Merchant",
  "email": "test@merchant.com",
  "walletAddress": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "fakeBalance": 10000,
  "currency": "XLM",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Mock Payments

Process a payment without a real Stellar transaction:

```bash
curl -X POST http://localhost:3000/api/v1/sandbox/payments/process \
  -H "Content-Type: application/json" \
  -d '{"projectId":"proj-123","clientAddress":"GCLIENT...","freelancerAddress":"GFREELANCER...","amount":100,"currency":"XLM","delay":1000}'
# → { "success": true, "payment": { "transactionId": "mock_...", "status": "success", "timestamp": ... } }
```

Check status: `GET /api/v1/sandbox/payments/:transactionId`

### Mock Blockchain

Simulate Stellar operations without real on-chain cost:

```bash
POST /api/v1/sandbox/blockchain/submit          # submit a mock transaction
GET  /api/v1/sandbox/blockchain/tx/:txHash      # transaction status
POST /api/v1/sandbox/blockchain/account/:address/fund   # fund an account, like Friendbot
GET  /api/v1/sandbox/blockchain/account/:address        # account info
GET  /api/v1/sandbox/blockchain/stats                    # network statistics
```

Mock transactions have a ~2s confirmation delay by default.

### Generate Testnet Wallets

```bash
curl -X POST http://localhost:3000/api/v1/sandbox/wallets/generate
# → { "wallet": { "address": "G...", "seed": "S...", ... }, "environment": "testnet",
#     "fundingUrl": "https://friendbot.stellar.org/?addr=G..." }
```

### Mock Webhooks

```bash
curl -X POST http://localhost:3000/api/v1/sandbox/webhooks/simulate \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.completed","data":{"projectId":"proj-123","amount":100,"status":"success"},"webhookUrl":"https://your-webhook-url.com/hook"}'
```

### Test Data Seeding

```bash
POST /api/v1/sandbox/testdata/seed
{ "users": 10, "projects": 20, "payments": 50, "invoices": 30 }

GET  /api/v1/sandbox/testdata/users
GET  /api/v1/sandbox/testdata/projects
GET  /api/v1/sandbox/testdata/statistics
DELETE /api/v1/sandbox/testdata/clear
```

Sandbox data is in-memory by default and clears on server restart. To persist it, point `DATABASE_URL` at a local sandbox database (e.g. `postgresql://user:password@localhost:5432/manifestpay_sandbox`).

### Sandbox-to-Production Migration Wizard

```bash
POST /api/v1/sandbox/migration/start
{ "tenantId": "your-tenant-id", "sourceAccountId": "sandbox-account-id", "targetUserId": "production-user-id", "migrateTransactions": true, "dryRun": false }

GET  /api/v1/sandbox/migration/:migrationId
GET  /api/v1/sandbox/migration?tenantId=your-tenant-id
POST /api/v1/sandbox/migration/:migrationId/cancel
```

Always try `dryRun: true` first.

### Rate Limit Relaxation

Sandbox mode automatically relaxes rate limits — Free 1000 req/min (vs 60 in production), Pro 5000 (vs 300), Enterprise 20000 (vs 1200). Responses carry `X-Sandbox-Rate-Limit: relaxed` when active.

### Periodic Cleanup

- Expired account cleanup — every 6 hours
- Old data cleanup (>30 days) — daily at 2 AM
- Maintenance statistics — daily at midnight

## API Endpoints Summary

| Area | Endpoints |
|---|---|
| Status | `GET /sandbox/status`, `GET /sandbox/info` |
| Accounts | `POST /sandbox/accounts`, `GET /sandbox/accounts/:id`, `GET /sandbox/accounts`, `PATCH /sandbox/accounts/:id/balance`, `DELETE /sandbox/accounts/:id` |
| Payments | `POST /sandbox/payments/process`, `GET /sandbox/payments/:transactionId` |
| Wallets | `POST /sandbox/wallets/generate` |
| Webhooks | `POST /sandbox/webhooks/simulate` |
| Mock blockchain | `POST /sandbox/blockchain/submit`, `GET /sandbox/blockchain/tx/:txHash`, `GET /sandbox/blockchain/account/:address`, `POST /sandbox/blockchain/account/:address/fund`, `GET /sandbox/blockchain/stats` |
| Test data | `POST /sandbox/testdata/seed`, `GET /sandbox/testdata/{users,projects,statistics}`, `DELETE /sandbox/testdata/clear` |
| Migration | `POST /sandbox/migration/start`, `GET /sandbox/migration/:id`, `GET /sandbox/migration`, `POST /sandbox/migration/:id/cancel` |
| Statistics | `GET /sandbox/stats` |

(all prefixed with `/api/v1`)

## API Playground

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI spec: `http://localhost:3000/docs/openapi.json`

## Database Schema

**SandboxAccount** — `id`, `tenantId`, `userId?`, `name`, `email`, `walletAddress` (unique), `fakeBalance`, `currency`, `isActive`, `expiresAt?`, timestamps, `deletedAt?` (soft delete)

**SandboxTransaction** — `id`, `accountId`, `txHash` (unique), `amount`, `currency`, `fromAddress`, `toAddress`, `status`, `type`, `mockData` (JSON), `confirmedAt`, timestamps, `deletedAt?`

**SandboxMigration** — `id`, `tenantId`, `sourceAccountId`, `targetAccountId?`, `status`, `steps` (JSON), `error?`, `startedAt`, `completedAt`, timestamps

## Common Workflows

**Invoice generation:** seed test data with `{"projects": 5}` → `POST /api/v1/invoice/generate` with `projectId`, `workDescription`, `hoursWorked`, `hourlyRate`.

**End-to-end payment:** generate a testnet wallet → fund it → `POST /sandbox/payments/process` → check status at `GET /sandbox/payments/:transactionId`.

**Batch verification:** seed test data → `POST /api/v1/verification/verify/batch` with a `verifications` array of `{projectId, status}`.

**Account + migration:** create a sandbox account → fund it via `/blockchain/account/:address/fund` → submit a mock transaction → seed test data → check `/sandbox/stats` → optionally `POST /sandbox/migration/start` with `dryRun: true`.

## Best Practices

1. Always use sandbox for development; never point it at production credentials
2. Seed fresh test data between test runs; clear it when done
3. Use descriptive account names and unique wallet addresses to avoid conflicts
4. Set expiration dates on temporary test accounts
5. Enable webhook logging (`SANDBOX_LOG_WEBHOOKS=true`) when debugging
6. Use `dryRun: true` before running a real migration, and verify results before applying to production
7. Monitor rate limits even in sandbox mode — they're relaxed, not disabled

## Troubleshooting

**Sandbox mode not working / 403 responses:** check `GET /api/v1/sandbox/status`; ensure `NODE_ENV` is `sandbox` or `development` and `SANDBOX_MODE=true` in `.env.sandbox`.

**Rate limits still strict:** verify the `X-Sandbox-Rate-Limit: relaxed` response header is present.

**Test data not persisting:** sandbox data is in-memory by default and clears on restart — point `DATABASE_URL` at a local database to persist it.

**Webhook simulation fails:** set `MOCK_WEBHOOKS_ENABLED=true` and `SANDBOX_LOG_WEBHOOKS=true`.

**Transactions not confirming:** mock transactions have a ~2s confirmation delay — check status again after waiting.

**Migration fails:** verify the source account exists and is active, confirm the target user is in the same tenant, review the migration's `steps` for the specific error, and retry with `dryRun: true` first.

## Security Considerations

- Sandbox accounts and mock transactions are fully isolated from production and never touch the real blockchain
- Sandbox data is cleaned up automatically (see Periodic Cleanup above)
- Rate limits are relaxed but still enforced
- Migration to production requires explicit confirmation and is logged
- All sandbox operations are logged

## Next Steps

- Explore endpoints in Swagger UI
- Review auto-generated SDKs in `backend/docs/api/sdks/`
- Check the OpenAPI spec: `backend/docs/api/openapi/openapi.json`

## Support

- Full documentation: https://docs.manifestpay.com
- Issue tracker: https://github.com/frienzy514-png/manifestpay/issues
- Discussions: https://github.com/frienzy514-png/manifestpay/discussions

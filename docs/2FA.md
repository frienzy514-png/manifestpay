# TOTP-Based Two-Factor Authentication

TOTP (Time-based One-Time Password) 2FA using authenticator apps like Google Authenticator, Authy, Microsoft Authenticator, or FreeOTP.

## Quick Start

### 1. Install Dependencies

Dependencies have been added to `backend/package.json`: `speakeasy` (TOTP generation and verification), `qrcode` (QR code generation), `@types/speakeasy`.

```bash
cd backend && npm install
```

### 2. Backend Integration

The backend 2FA router is already integrated into `src/index.ts`:

```typescript
apiV1Router.use('/auth/2fa', twoFactorAuthRouter);
```

All endpoints are available at `/api/v1/auth/2fa/*`.

### 3. Frontend Integration

```tsx
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';
import { TwoFactorSettings } from '@/components/auth/TwoFactorSettings';
import { TwoFactorRecovery } from '@/components/auth/TwoFactorRecovery';

<TwoFactorSetup userId={userId} onSuccess={() => /* redirect */} />
<TwoFactorVerification userId={userId} onSuccess={(deviceHash) => /* complete login */} />
<TwoFactorSettings userId={userId} />
<TwoFactorRecovery userId={userId} onSuccess={() => /* redirect */} />
```

## File Structure

```
backend/src/
├── services/2fa-service.ts       # Core 2FA logic
├── routes/2fa.ts                 # API endpoints
├── schemas/2fa.ts                # Zod validation schemas
└── types/2fa.ts                  # TypeScript types

frontend/
├── components/auth/
│   ├── TwoFactorSetup.tsx
│   ├── TwoFactorVerification.tsx
│   ├── TwoFactorSettings.tsx
│   └── TwoFactorRecovery.tsx
├── lib/hooks/use2fa.ts
└── types/2fa.ts
```

## Configuration

Backend (`backend/src/services/2fa-service.ts`):

```typescript
const TOKEN_WINDOW = 2;                    // ±30s time window for token verification
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;
const RECOVERY_TOKEN_EXPIRY_HOURS = 24;
```

Frontend (`frontend/lib/hooks/use2fa.ts`):

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

## Usage Flow

**Setup:** navigate to settings → enable 2FA → select authenticator app → scan QR code → enter 6-digit code to confirm → save backup codes.

**Login:** enter credentials → if 2FA enabled, enter 6-digit code (or a backup code) → optionally trust the device for 30 days.

**Recovery:** click "Can't access your authenticator app?" → choose recovery method (email or support ticket) → complete verification → set up a new authenticator.

## API Endpoints

### POST /api/v1/auth/2fa/setup
Initialize TOTP setup for a user.
```json
// Request
{ "userId": "550e8400-e29b-41d4-a716-446655440000" }
// Response
{ "secret": "JBSWY3DPEBLW64TMMQ======", "qrCode": "data:image/png;base64,...", "backupCodes": ["ABCD1234", "..."] }
```

### POST /api/v1/auth/2fa/confirm
Confirm 2FA setup by verifying a TOTP token.
```json
// Request
{ "userId": "...", "token": "123456", "backupCodesConfirmed": true }
// Response
{ "success": true, "message": "2FA has been successfully enabled" }
```

### POST /api/v1/auth/2fa/verify
Verify a TOTP token during login.
```json
// Request
{ "userId": "...", "token": "123456", "rememberDevice": true }
// Response
{ "success": true, "backupCodesRemaining": 9, "deviceHash": "abc123..." }
```

### GET /api/v1/auth/2fa/status/:userId
```json
{ "userId": "...", "enabled": true, "verifiedAt": "2024-04-27T10:00:00Z", "lastUsedAt": "2024-04-27T11:30:00Z", "backupCodesRemaining": 8 }
```

### DELETE /api/v1/auth/2fa/:userId
Disable 2FA for a user. Request: `{ "token": "123456", "reason": "Lost device" }`

### POST /api/v1/auth/2fa/backup-codes
Get backup codes (requires verification).

### POST /api/v1/auth/2fa/regenerate-backup-codes
Regenerate backup codes.

### GET /api/v1/auth/2fa/logs/:userId?limit=50&offset=0&action=2fa_verified
2FA activity logs, paginated.

### POST /api/v1/auth/2fa/recovery
Request account recovery. Request: `{ "userId": "...", "method": "email" }`. Response includes a `recoveryToken` expiring in 24h.

### POST /api/v1/auth/2fa/complete-recovery
Complete account recovery with the recovery token.

### POST /api/v1/auth/2fa/check-device
Check if a device is remembered: `{ "userId": "...", "deviceHash": "..." }` → `{ "isRemembered": true }`

## Security Considerations

- **Time-based verification** — TOTP with 60s window, ±30s clock-skew tolerance (adjust `TOKEN_WINDOW`)
- **Backup codes** — 10 codes, hashed before storage
- **Device trust** — optional 30-day device memorization, keyed on IP + user-agent
- **Activity logging** — full audit trail of 2FA actions
- **Recovery flow** — account recovery without the authenticator app; tokens expire after 24h (`RECOVERY_TOKEN_EXPIRY_HOURS`)
- **Rate limiting** — not yet implemented; add to the verification middleware before production use

## Database Integration

The current implementation uses in-memory storage. For production:

1. Create tables for `two_factor_setups`, `two_factor_logs`, `remembered_devices`, `recovery_tokens`
2. Replace Map-based storage with database queries
3. Consider caching frequently accessed data

## Testing

```bash
cd backend && npm test -- 2fa
```

Manual testing checklist: setup + QR scan, confirm with correct token, verify during login, use a backup code, regenerate backup codes, remember device for 30 days, request/complete recovery, view logs, disable 2FA, test incorrect tokens, invalid QR scan, expired token, all backup codes exhausted, concurrent setups, recovery token expiration.

## Known Limitations & TODOs

- In-memory storage — needs database integration
- Recovery emails not yet sent — needs email provider integration
- No admin override to disable a user's 2FA
- No rate limiting on verification attempts yet
- 2FA not yet enforced for high-value transactions
- No grace period for 2FA enablement

## Future Enhancements

- WebAuthn/FIDO2 hardware key support
- SMS-based 2FA fallback
- Push-based verification
- Biometric verification
- Per-organization 2FA policies
- Admin dashboard for 2FA management
- Device fingerprinting improvements / historical trust tracking
- Anomaly detection and alerts on failed attempts
- Integration with identity providers (Auth0, etc.)

## Troubleshooting

**QR code not scanning:** ensure adequate lighting, try a different authenticator app, or enter the secret key manually (shown below the QR code).

**Lost access to authenticator app:** use backup codes if available, use account recovery, or contact support for manual verification.

**Time sync issues:** check device time synchronization; ±30s tolerance is already enabled.

**Backup codes running low:** regenerate from settings and store the new codes securely.

## Contributing

When making changes to 2FA: update both backend and frontend types, keep schemas in sync, add/update tests, and update this doc if endpoints or behavior change.

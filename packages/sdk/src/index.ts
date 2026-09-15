import { ManifestPayClient } from './client.js';
import { buildAuthHeader, AuthProvider } from './auth.js';
import { PaymentsApi } from './payments.js';
import { RefundsApi } from './refunds.js';
import { VerificationApi } from './verification.js';
import { FeatureFlagsApi } from './featureFlags.js';
import { SubscriptionsApi } from './subscriptions.js';
import { EscrowApi, DisputesApi } from './escrow.js';
import { InvoicesApi } from './invoices.js';
import { StellarApi } from './stellar.js';
import { SandboxApi } from './sandbox.js';
import { WalletApi } from './wallet.js';
import { ManifestPayClientOptions } from './types.js';

export * from './types.js';
export * from './errors.js';
export * from './auth.js';
export * from './featureFlags.js';
export * from './subscriptions.js';
export * from './escrow.js';
export * from './invoices.js';
export * from './stellar.js';
export * from './sandbox.js';
export * from './wallet.js';


export class ManifestPaySDK {
  readonly client: ManifestPayClient;
  readonly payments: PaymentsApi;
  readonly refunds: RefundsApi;
  readonly verification: VerificationApi;
  readonly featureFlags: FeatureFlagsApi;
  readonly subscriptions: SubscriptionsApi;
  readonly escrow: EscrowApi;
  readonly disputes: DisputesApi;
  readonly invoices: InvoicesApi;
  readonly stellar: StellarApi;
  readonly sandbox: SandboxApi;
  readonly wallet: WalletApi;

  constructor(options: ManifestPayClientOptions, authProvider?: AuthProvider) {
    this.client = new ManifestPayClient(options);
    if (authProvider) {
      this.client.addRequestInterceptor(async (ctx) => {
        const token = await authProvider.getAccessToken();
        return {
          ...ctx,
          headers: {
            ...ctx.headers,
            ...buildAuthHeader(token),
          },
        };
      });
    }

    this.payments = new PaymentsApi(this.client);
    this.refunds = new RefundsApi(this.client);
    this.verification = new VerificationApi(this.client);
    this.featureFlags = new FeatureFlagsApi(this.client);
    this.subscriptions = new SubscriptionsApi(this.client);
    this.escrow = new EscrowApi(this.client);
    this.disputes = new DisputesApi(this.client);
    this.invoices = new InvoicesApi(this.client);
    this.stellar = new StellarApi(this.client);
    this.sandbox = new SandboxApi(this.client);
    this.wallet = new WalletApi(this.client);
  }

}

export function createManifestPaySDK(options: ManifestPayClientOptions, authProvider?: AuthProvider) {
  return new ManifestPaySDK(options, authProvider);
}

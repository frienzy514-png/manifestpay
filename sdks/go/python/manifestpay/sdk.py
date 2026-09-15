"""Main SDK class for the ManifestPay Python SDK."""

from __future__ import annotations

from typing import Optional

from manifestpay.auth import AuthProvider, build_auth_header
from manifestpay.client import ManifestPayClient, ClientConfig, RetryConfig
from manifestpay.services import (
    DisputesApi,
    EscrowApi,
    InvoicesApi,
    PaymentsApi,
    RefundsApi,
    SandboxApi,
    StellarApi,
    SubscriptionsApi,
    VerificationApi,
)


class ManifestPaySDK:
    """Top-level SDK client providing access to all ManifestPay APIs.

    Example::

        sdk = ManifestPaySDK(
            base_url="https://api.manifestpay.com/api/v1",
            api_key="your-api-key",
        )

        # Verify work
        result = sdk.verification.verify_work(
            VerificationRequest(
                repository_url="https://github.com/user/repo",
                milestone_description="Implement login page",
                project_id="proj_123",
            )
        )

        # Create a subscription plan
        plan = sdk.subscriptions.create_plan(
            CreatePlanInput(
                merchant_id="m_123",
                name="Pro Plan",
                interval=SubscriptionInterval.MONTHLY,
                amount=29.99,
                currency="USD",
            )
        )
    """

    def __init__(
        self,
        base_url: str = "https://api.manifestpay.com/api/v1",
        api_key: Optional[str] = None,
        timeout: int = 15,
        retry: Optional[RetryConfig] = None,
        auth_provider: Optional[AuthProvider] = None,
    ):
        self._client = ManifestPayClient(
            ClientConfig(
                base_url=base_url,
                api_key=api_key,
                timeout=timeout,
                retry=retry,
            )
        )

        if auth_provider:

            def auth_interceptor(context):
                token = auth_provider.get_access_token()
                if token:
                    context["headers"] = {
                        **context["headers"],
                        **build_auth_header(token),
                    }
                return context

            self._client.add_request_interceptor(auth_interceptor)

        # Initialize all API services
        self.payments = PaymentsApi(self._client)
        self.refunds = RefundsApi(self._client)
        self.verification = VerificationApi(self._client)
        self.subscriptions = SubscriptionsApi(self._client)
        self.invoices = InvoicesApi(self._client)
        self.escrow = EscrowApi(self._client)
        self.disputes = DisputesApi(self._client)
        self.stellar = StellarApi(self._client)
        self.sandbox = SandboxApi(self._client)


def create_manifestpay_sdk(
    base_url: str = "https://api.manifestpay.com/api/v1",
    api_key: Optional[str] = None,
    timeout: int = 15,
    retry: Optional[RetryConfig] = None,
    auth_provider: Optional[AuthProvider] = None,
) -> ManifestPaySDK:
    """Factory function to create an ManifestPaySDK instance.

    Args:
        base_url: API base URL.
        api_key: API key for authentication.
        timeout: Request timeout in seconds.
        retry: Optional retry configuration.
        auth_provider: Optional auth provider for bearer token injection.

    Returns:
        A configured ``ManifestPaySDK`` instance.
    """
    return ManifestPaySDK(
        base_url=base_url,
        api_key=api_key,
        timeout=timeout,
        retry=retry,
        auth_provider=auth_provider,
    )

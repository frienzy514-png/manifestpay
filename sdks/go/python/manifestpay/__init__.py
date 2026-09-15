"""Official Python SDK for ManifestPay APIs.

Type-safe client for the ManifestPay payment platform, supporting
escrow, subscriptions, verification, refunds, and Stellar integration.
"""

__version__ = "0.1.0"

from manifestpay.client import ManifestPayClient, ClientConfig
from manifestpay.sdk import ManifestPaySDK, create_manifestpay_sdk
from manifestpay.errors import (
    ManifestPayError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    RateLimitError,
    NetworkError,
    NotFoundError,
)
from manifestpay.auth import AuthProvider, build_auth_header
from manifestpay.webhooks import verify_webhook_signature

__all__ = [
    "ManifestPayClient",
    "ClientConfig",
    "ManifestPaySDK",
    "create_manifestpay_sdk",
    "ManifestPayError",
    "AuthenticationError",
    "AuthorizationError",
    "ValidationError",
    "RateLimitError",
    "NetworkError",
    "NotFoundError",
    "AuthProvider",
    "build_auth_header",
    "verify_webhook_signature",
]

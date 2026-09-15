# ManifestPay Go SDK

Official Go SDK for [ManifestPay](https://manifestpay.com) APIs — type-safe client for escrow, subscriptions, verification, refunds, Stellar integration, and webhook verification.

## Installation

```bash
go get github.com/frienzy514-png/manifestpay/sdks/go
```

## Quick Start

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/frienzy514-png/manifestpay/sdks/go/manifestpay"
)

func main() {
    client := manifestpay.New("https://api.manifestpay.com/api/v1", "your-api-key")
    ctx := context.Background()

    // Create a subscription plan
    plan, err := client.Subscriptions.CreatePlan(ctx, manifestpay.CreatePlanParams{
        MerchantID: "m_123",
        Name:       "Pro Plan",
        Interval:   manifestpay.IntervalMonthly,
        Amount:     29.99,
        Currency:   "USD",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Created plan: %s\n", plan.ID)

    // Create an escrow
    escrow, err := client.Escrow.Create(ctx, manifestpay.CreateEscrowParams{
        ProjectID:   "proj_1",
        PayerID:     "payer_1",
        PayeeID:     "payee_1",
        Currency:    "XLM",
        TotalAmount: 1000,
        Milestones: []manifestpay.EscrowMilestone{
            {Title: "Design", Amount: 500, CompletionCriteria: "Mockups approved"},
            {Title: "Development", Amount: 500, CompletionCriteria: "Prototype delivered"},
        },
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Created escrow: %s\n", escrow.ID)
}
```

## API Services

| Service | Description |
|---------|-------------|
| `client.Payments` | Split payment configuration and execution |
| `client.Verification` | Work verification (AI-powered) |
| `client.Subscriptions` | Subscription plans and enrollment |
| `client.Invoices` | Invoice generation and listing |
| `client.Escrow` | Escrow creation, funding, milestones |
| `client.Disputes` | Dispute filing and resolution |
| `client.Stellar` | Stellar blockchain queries |
| `client.Sandbox` | Sandbox environment controls |
| `client.Webhooks` | Webhook signature verification |

## Error Handling

```go
result, err := client.Subscriptions.Get(ctx, "sub_123")
if err != nil {
    if apiErr, ok := err.(*manifestpay.APIError); ok {
        fmt.Printf("API error: %s (HTTP %d, code=%s)\n",
            apiErr.Message, apiErr.StatusCode, apiErr.Code)
    } else {
        log.Fatal(err)
    }
}
```

## Webhook Verification

```go
body := readRequestBody(r) // raw request body bytes
signature := r.Header.Get("X-Signature")

event, err := client.Webhooks.Verify("whsec_your_secret", signature, body)
if err != nil {
    http.Error(w, "Invalid signature", http.StatusUnauthorized)
    return
}
fmt.Printf("Event type: %s\n", event.Type)
```

## Pagination

```go
page, err := client.Invoices.ListForMerchant(ctx, "m_123", manifestpay.ListParams{
    Limit:  20,
    Offset: 0,
})
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Total invoices: %d\n", page.Total)
for _, inv := range page.Data {
    fmt.Printf("Invoice %s: %.2f %s\n", inv.ID, inv.TotalAmount, inv.Currency)
}
```

## Testing

```bash
cd sdks/go
go test ./manifestpay/...
```

## Requirements

- Go 1.21+

## License

MIT

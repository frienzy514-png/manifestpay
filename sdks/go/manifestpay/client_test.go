package manifestpay_test

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/frienzy514-png/manifestpay/sdks/go/manifestpay"
)

// newTestServer creates a test HTTP server that always returns the given status
// and JSON-encoded body.
func newTestServer(t *testing.T, status int, body interface{}) (*httptest.Server, *manifestpay.Client) {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_ = json.NewEncoder(w).Encode(body)
	}))
	t.Cleanup(srv.Close)
	return srv, manifestpay.New(srv.URL, "test_key")
}

// ─── Subscription lifecycle ───────────────────────────────────────────────────

func TestSubscriptionCreate(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	want := manifestpay.Subscription{
		ID:         "sub_001",
		CustomerID: "cus_001",
		PlanID:     "plan_monthly",
		Status:     manifestpay.SubscriptionStatusActive,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	_, client := newTestServer(t, http.StatusOK, want)

	got, err := client.Subscriptions.Enroll(context.Background(), manifestpay.CreateSubscriptionParams{
		CustomerID: "cus_001",
		PlanID:     "plan_monthly",
	})
	if err != nil {
		t.Fatalf("Enroll: unexpected error: %v", err)
	}
	if got.ID != want.ID {
		t.Errorf("ID: got %q, want %q", got.ID, want.ID)
	}
	if got.Status != want.Status {
		t.Errorf("Status: got %q, want %q", got.Status, want.Status)
	}
}

func TestSubscriptionGet(t *testing.T) {
	want := manifestpay.Subscription{ID: "sub_002", Status: manifestpay.SubscriptionStatusPaused}
	_, client := newTestServer(t, http.StatusOK, want)

	got, err := client.Subscriptions.Get(context.Background(), "sub_002")
	if err != nil {
		t.Fatalf("Get: %v", err)
	}
	if got.ID != "sub_002" {
		t.Errorf("ID mismatch: %s", got.ID)
	}
}

func TestSubscriptionCancel(t *testing.T) {
	now := time.Now()
	want := manifestpay.Subscription{ID: "sub_004", Status: manifestpay.SubscriptionStatusCancelled}
	_, client := newTestServer(t, http.StatusOK, want)

	got, err := client.Subscriptions.Cancel(context.Background(), "sub_004", manifestpay.CancelParams{Immediately: true})
	if err != nil {
		t.Fatalf("Cancel: %v", err)
	}
	if got.Status != manifestpay.SubscriptionStatusCancelled {
		t.Errorf("Status: got %q", got.Status)
	}
}

func TestSubscriptionPauseReactivate(t *testing.T) {
	tests := []struct {
		name       string
		serverBody manifestpay.Subscription
		run        func(c *manifestpay.Client) (*manifestpay.Subscription, error)
	}{
		{
			name:       "pause",
			serverBody: manifestpay.Subscription{ID: "sub_005", Status: manifestpay.SubscriptionStatusPaused},
			run: func(c *manifestpay.Client) (*manifestpay.Subscription, error) {
				return c.Subscriptions.Pause(context.Background(), "sub_005", manifestpay.PauseParams{})
			},
		},
		{
			name:       "reactivate",
			serverBody: manifestpay.Subscription{ID: "sub_005", Status: manifestpay.SubscriptionStatusActive},
			run: func(c *manifestpay.Client) (*manifestpay.Subscription, error) {
				return c.Subscriptions.Reactivate(context.Background(), "sub_005")
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			_, client := newTestServer(t, http.StatusOK, tc.serverBody)
			got, err := tc.run(client)
			if err != nil {
				t.Fatalf("%s: %v", tc.name, err)
			}
			if got.Status != tc.serverBody.Status {
				t.Errorf("Status: got %q, want %q", got.Status, tc.serverBody.Status)
			}
		})
	}
}

// ─── Webhook signature verification ──────────────────────────────────────────

func makeSignature(secret string, body []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	return "sha256=" + hex.EncodeToString(mac.Sum(nil))
}

func TestWebhookVerify(t *testing.T) {
	client := manifestpay.New("https://example.com", "key")
	secret := "whsec_test"
	body := []byte(`{"id":"evt_1","type":"payment.completed","createdAt":"2026-01-01T00:00:00Z","data":{}}`)
	validSig := makeSignature(secret, body)

	tests := []struct {
		name    string
		sig     string
		wantErr bool
	}{
		{"valid signature", validSig, false},
		{"wrong signature", "sha256=deadbeef", true},
		{"empty signature", "", true},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			evt, err := client.Webhooks.Verify(secret, tc.sig, body)
			if tc.wantErr {
				if err == nil {
					t.Error("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if evt.ID != "evt_1" {
				t.Errorf("event ID: got %q", evt.ID)
			}
		})
	}
}

// ─── Error handling ───────────────────────────────────────────────────────────

func TestAPIError(t *testing.T) {
	errBody := map[string]interface{}{
		"error": map[string]interface{}{
			"code":    "not_found",
			"message": "resource not found",
		},
	}
	_, client := newTestServer(t, http.StatusNotFound, errBody)

	_, err := client.Subscriptions.Get(context.Background(), "sub_missing")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	apiErr, ok := err.(*manifestpay.APIError)
	if !ok {
		t.Fatalf("expected *APIError, got %T", err)
	}
	if apiErr.StatusCode != http.StatusNotFound {
		t.Errorf("StatusCode: got %d, want %d", apiErr.StatusCode, http.StatusNotFound)
	}
	if apiErr.Code != "not_found" {
		t.Errorf("Code: got %q, want %q", apiErr.Code, "not_found")
	}
}

func TestListPagination(t *testing.T) {
	want := manifestpay.Page[manifestpay.Subscription]{
		Data:  []manifestpay.Subscription{{ID: "sub_p1"}, {ID: "sub_p2"}},
		Total: 100,
		Limit: 2,
	}
	_, client := newTestServer(t, http.StatusOK, want)

	_, err := client.Subscriptions.ListPlans(context.Background(), "m_1")
	if err != nil {
		t.Fatalf("ListPlans: %v", err)
	}
}

// ─── Escrow tests ─────────────────────────────────────────────────────────────

func TestEscrowCreate(t *testing.T) {
	want := manifestpay.Escrow{
		ID:          "esc_001",
		ProjectID:   "proj_001",
		PayerID:     "payer_001",
		PayeeID:     "payee_001",
		Currency:    "XLM",
		TotalAmount: 1000,
		Status:      "draft",
	}
	_, client := newTestServer(t, http.StatusOK, want)

	got, err := client.Escrow.Create(context.Background(), manifestpay.CreateEscrowParams{
		ProjectID:   "proj_001",
		PayerID:     "payer_001",
		PayeeID:     "payee_001",
		Currency:    "XLM",
		TotalAmount: 1000,
		Milestones: []manifestpay.EscrowMilestone{
			{Title: "Design", Amount: 500, CompletionCriteria: "Mockups approved"},
		},
	})
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if got.ID != "esc_001" {
		t.Errorf("ID: got %q", got.ID)
	}
}

// ─── Verification tests ───────────────────────────────────────────────────────

func TestVerificationVerify(t *testing.T) {
	want := manifestpay.VerificationResult{ID: "v_001", Status: "verified"}
	_, client := newTestServer(t, http.StatusOK, want)

	got, err := client.Verification.Verify(context.Background(), manifestpay.VerificationRequest{
		RepositoryURL:        "https://github.com/user/repo",
		MilestoneDescription: "Build login page",
		ProjectID:            "proj_001",
	})
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if got.Status != "verified" {
		t.Errorf("Status: got %q", got.Status)
	}
}

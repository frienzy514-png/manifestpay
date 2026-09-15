import type {
  DisputeStatus,
  DisputeReason,
  ResolutionOutcome,
  Evidence,
  DisputeMessage,
  Dispute,
} from "@manifestpay/types";

export type {
  DisputeStatus,
  DisputeReason,
  ResolutionOutcome,
  Evidence,
  DisputeMessage,
  Dispute,
};

export interface CreateDisputeForm {
  paymentId: string;
  respondentId: string;
  reason: DisputeReason;
  amount: number;
  currency: string;
  description: string;
  projectId?: string;
  invoiceId?: string;
}

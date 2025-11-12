import { query } from '@/lib/db';
import type { X402PaymentHeaders } from '@/types/x402';

export type PaymentType = 'analysis' | 'subscription' | 'alert' | 'historical';

export interface RecordPaymentInput {
  headers: X402PaymentHeaders;
  paymentType: PaymentType;
  linkedAnalysisId?: string;
  linkedSubscriptionId?: string;
  metadata?: Record<string, any>;
}

export async function recordPayment({
  headers,
  paymentType,
  linkedAnalysisId,
  linkedSubscriptionId,
  metadata,
}: RecordPaymentInput): Promise<void> {
  await query(
    `INSERT INTO payments (tx_hash, payer_pubkey, amount_usdc, payment_type, analysis_id, subscription_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tx_hash) DO NOTHING`,
    [
      headers.transaction ?? headers.signature,
      headers.payer,
      headers.amount,
      paymentType,
      linkedAnalysisId ?? null,
      linkedSubscriptionId ?? null,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
}

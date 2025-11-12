export type X402Tier = 'basic' | 'standard' | 'premium';

export interface X402PaymentHeaders {
  payer: string;
  recipient: string;
  signature: string;
  message: string;
  timestamp: number;
  amount: number;
  tier: X402Tier;
  nonce: string;
  transaction?: string;
  resource?: string;
}

export interface X402ValidationOptions {
  tier: X402Tier;
  resource: string;
  requirePayment?: boolean;
}

export interface X402ValidationResult {
  headers?: X402PaymentHeaders;
  verified: boolean;
  tier: X402Tier;
  paymentRequired: boolean;
}

export interface X402ReceiptHeaders {
  signature: string;
  timestamp: number;
  transaction?: string;
  tier: X402Tier;
  amount: number;
}

export class X402Error extends Error {
  public readonly status: number;
  public readonly paymentRequest?: Record<string, any>;

  constructor(message: string, status = 402, paymentRequest?: Record<string, any>) {
    super(message);
    this.status = status;
    this.paymentRequest = paymentRequest;
  }
}

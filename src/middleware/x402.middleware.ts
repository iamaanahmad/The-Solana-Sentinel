import { NextRequest } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

import { cache } from '@/lib/redis';
import { getTierConfig } from '@/config/tier-pricing';
import type { X402PaymentHeaders, X402Tier, X402ValidationOptions, X402ValidationResult } from '@/types/x402';
import { X402Error } from '@/types/x402';

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

const REQUIRED_HEADERS = [
  'x-402-payer',
  'x-402-recipient',
  'x-402-signature',
  'x-402-message',
  'x-402-timestamp',
  'x-402-amount',
  'x-402-tier',
  'x-402-nonce',
] as const;

type RequiredHeader = (typeof REQUIRED_HEADERS)[number];

function buildPaymentRequest(tier: X402Tier, resource?: string) {
  const tierConfig = getTierConfig(tier);
  return {
    tier,
    amount: tierConfig.priceUsdc,
    recipient: process.env.X402_RECIPIENT_ADDRESS,
    currency: 'USDC',
    memo: `x402://${tier}`,
    expiresAt: new Date(Date.now() + TIMESTAMP_TOLERANCE_MS).toISOString(),
    resource,
  };
}

function parseHeaders(request: NextRequest): Record<RequiredHeader, string> {
  const result = {} as Record<RequiredHeader, string>;

  REQUIRED_HEADERS.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      result[header] = value;
    }
  });

  return result;
}

function ensureRecipient(recipient: string | undefined, tier: X402Tier) {
  const expected = process.env.X402_RECIPIENT_ADDRESS;
  if (!expected) {
    throw new X402Error('Sentinel recipient address is not configured', 500);
  }
  if (!recipient) {
  throw new X402Error('x402 recipient header missing', 402, buildPaymentRequest(tier));
  }
  if (recipient !== expected) {
  throw new X402Error('x402 payment recipient mismatch', 402, buildPaymentRequest(tier));
  }
}

function buildMessagePayload(headers: X402PaymentHeaders, resource: string): string {
  return [
    headers.payer,
    headers.recipient,
    headers.amount.toFixed(6),
    headers.tier,
    headers.nonce,
    headers.timestamp,
    resource,
  ].join('|');
}

export async function validateX402Request(
  request: NextRequest,
  options: X402ValidationOptions
): Promise<X402ValidationResult> {
  const tierConfig = getTierConfig(options.tier);
  const paymentRequired = options.requirePayment ?? tierConfig.priceUsdc > 0;

  if (!paymentRequired) {
    return {
      tier: options.tier,
      verified: false,
      paymentRequired: false,
    };
  }

  const rawHeaders = parseHeaders(request);
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !rawHeaders[h]);

  if (missingHeaders.length > 0) {
    throw new X402Error(
      `Missing x402 headers: ${missingHeaders.join(', ')}`,
      402,
  buildPaymentRequest(options.tier, options.resource)
    );
  }

  ensureRecipient(rawHeaders['x-402-recipient'], options.tier);

  const headers: X402PaymentHeaders = {
    payer: rawHeaders['x-402-payer'],
    recipient: rawHeaders['x-402-recipient'],
    signature: rawHeaders['x-402-signature'],
    message: rawHeaders['x-402-message'],
    timestamp: Number(rawHeaders['x-402-timestamp']),
    amount: Number(rawHeaders['x-402-amount']),
    tier: rawHeaders['x-402-tier'] as X402Tier,
    nonce: rawHeaders['x-402-nonce'],
    transaction: request.headers.get('x-402-transaction') ?? undefined,
    resource: request.headers.get('x-402-resource') ?? options.resource,
  };

  if (Number.isNaN(headers.timestamp)) {
    throw new X402Error('Invalid x402 timestamp header', 402, buildPaymentRequest(options.tier, headers.resource));
  }

  if (Math.abs(Date.now() - headers.timestamp) > TIMESTAMP_TOLERANCE_MS) {
    throw new X402Error('x402 timestamp outside allowed window', 402, buildPaymentRequest(options.tier, headers.resource));
  }

  if (Number.isNaN(headers.amount) || headers.amount <= 0) {
    throw new X402Error('Invalid x402 payment amount', 402, buildPaymentRequest(options.tier, headers.resource));
  }

  if (headers.tier !== options.tier) {
    throw new X402Error('x402 tier mismatch', 402, buildPaymentRequest(options.tier, headers.resource));
  }

  if (headers.amount < tierConfig.priceUsdc) {
    throw new X402Error('Insufficient x402 payment amount', 402, buildPaymentRequest(options.tier, headers.resource));
  }

  if (!headers.resource) {
    throw new X402Error('x402 resource missing', 402, buildPaymentRequest(options.tier));
  }

  const expectedMessage = buildMessagePayload(headers, headers.resource);
  if (expectedMessage !== headers.message) {
    throw new X402Error('x402 message payload mismatch', 402, buildPaymentRequest(options.tier, headers.resource));
  }

  const nonceKey = `x402:nonce:${headers.nonce}`;
  const nonceExists = await cache.exists(nonceKey);
  if (nonceExists) {
    throw new X402Error('x402 payment nonce already used', 409);
  }

  const payerPublicKey = new PublicKey(headers.payer);
  const signature = bs58.decode(headers.signature);
  const messageBytes = Buffer.from(headers.message);

  const verified = nacl.sign.detached.verify(messageBytes, signature, payerPublicKey.toBuffer());
  if (!verified) {
    throw new X402Error('x402 signature verification failed', 401);
  }

  await cache.set(
    nonceKey,
    {
      payer: headers.payer,
      amount: headers.amount,
      tier: headers.tier,
      timestamp: headers.timestamp,
    },
    600
  );

  return {
    headers,
    verified,
    tier: options.tier,
    paymentRequired,
  };
}

export function buildX402ReceiptHeaders({
  tier,
  transaction,
  signature,
  amount,
}: {
  tier: X402Tier;
  transaction?: string;
  signature: string;
  amount: number;
}): Record<string, string> {
  const now = Date.now();
  const entries: Record<string, string> = {
    'x-402-receipt-signature': signature,
    'x-402-receipt-tier': tier,
    'x-402-receipt-timestamp': now.toString(),
    'x-402-receipt-amount': amount.toFixed(6),
  };

  if (transaction) {
    entries['x-402-receipt-transaction'] = transaction;
  }

  return entries;
}

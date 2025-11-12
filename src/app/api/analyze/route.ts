import { NextRequest, NextResponse } from 'next/server';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { z } from 'zod';

import { AnalysisService } from '@/services/analysis.service';
import { AttestationService } from '@/services/attestation.service';
import { recordPayment } from '@/services/payment.service';
import { buildX402ReceiptHeaders, validateX402Request } from '@/middleware/x402.middleware';
import { assertTier } from '@/config/tier-pricing';
import { X402Error } from '@/types/x402';

const analysisService = new AnalysisService();
const attestationService = new AttestationService();

const TokenSchema = z.string().min(32).max(44);

const analyzeTokenRequestSchema = z.object({
  tokenAddress: z.string(),
  tier: z.enum(['basic', 'standard', 'premium']).optional(),
  requesterPubkey: z.string().optional(),
});

const SentinelReceiptSchema = z.object({
  analysisId: z.string(),
  issuedAt: z.string(),
  tier: z.enum(['basic', 'standard', 'premium']),
  transaction: z.string().optional(),
});

function signReceipt(payload: z.infer<typeof SentinelReceiptSchema>): string {
  const secretKeyBase58 = process.env.SENTINEL_RECEIPT_PRIVATE_KEY;
  if (!secretKeyBase58) {
    throw new Error('Sentinel receipt signing key missing');
  }

  let secretKey = bs58.decode(secretKeyBase58);
  
  // If the decoded key is 65 bytes, it may include a prefix byte - take the last 64 bytes
  if (secretKey.length === 65) {
    secretKey = secretKey.slice(1);
  }
  
  if (secretKey.length !== 64) {
    throw new Error(`Sentinel receipt signing key invalid length: expected 64, got ${secretKey.length}`);
  }

  const message = Buffer.from(JSON.stringify(payload));
  const signature = nacl.sign.detached(message, secretKey);
  return bs58.encode(signature);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [/api/analyze] POST request received');
    const rawBody = await request.json();
    console.log('✅ [/api/analyze] Parsed body:', { tokenAddress: rawBody.tokenAddress, tier: rawBody.tier });
    
    const body = analyzeTokenRequestSchema.parse(rawBody);
    const tier = assertTier(body.tier ?? 'basic');
    console.log('✅ [/api/analyze] Validated tier:', tier);

    const tokenValidation = TokenSchema.safeParse(body.tokenAddress);
    if (!tokenValidation.success) {
      return NextResponse.json(
        { error: 'Invalid token address provided' },
        { status: 400 }
      );
    }

    const validation = await validateX402Request(request, {
      tier,
      resource: '/api/analyze',
      requirePayment: tier !== 'basic',
    });

    const requesterPubkey = validation.headers?.payer ?? body.requesterPubkey;

    console.log('🔍 [/api/analyze] Calling analysis service...');
    const { report, analysisId } = await analysisService.analyzeToken({
      tokenAddress: tokenValidation.data,
      tier,
      requesterPubkey,
    });
    console.log('✅ [/api/analyze] Analysis complete:', { analysisId, score: report.sentinelScore });

    if (validation.paymentRequired && validation.headers) {
      await recordPayment({
        headers: validation.headers,
        paymentType: 'analysis',
        linkedAnalysisId: analysisId,
        metadata: {
          tokenAddress: tokenValidation.data,
          tier,
        },
      });
    }

    const receiptPayload = {
      analysisId,
      issuedAt: report.issuedAt,
      tier,
      transaction: validation.headers?.transaction,
    } as const;
    const receiptSignature = signReceipt(receiptPayload);
    const receiptHeaders = buildX402ReceiptHeaders({
      tier,
      transaction: validation.headers?.transaction,
      signature: receiptSignature,
      amount: validation.headers?.amount ?? 0,
    });

    // Sign attestation for Standard and Premium tiers
    let attestation;
    if (tier !== 'basic') {
      attestation = attestationService.signReport(report, analysisId);
    }

    return NextResponse.json(
      {
        analysisId,
        report: {
          ...report,
          ...(attestation && { attestation }),
        },
        receipt: {
          ...receiptPayload,
          signature: receiptSignature,
        },
      },
      {
        status: 200,
        headers: receiptHeaders,
      }
    );
  } catch (error: any) {
    if (error instanceof X402Error) {
      return NextResponse.json(
        {
          error: error.message,
          paymentRequest: error.paymentRequest,
        },
        { status: error.status }
      );
    }

    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('❌ [/api/analyze] Analyze route error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message,
        name: error?.name,
      }, 
      { status: 500 }
    );
  }
}

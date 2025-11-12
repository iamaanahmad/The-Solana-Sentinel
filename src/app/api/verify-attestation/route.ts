import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { AttestationService } from '@/services/attestation.service';
import { SentinelReportData } from '@/types/index';

const attestationService = new AttestationService();

// Flexible schema to accept various payload formats
const VerifyAttestationSchema = z.object({
  report: z.record(z.any()).optional(),
  attestation: z.object({
    signature: z.string(),
    publicKey: z.string(),
    reportHash: z.string(),
    issuedAt: z.string(),
    network: z.enum(['devnet', 'mainnet-beta', 'testnet']).optional(),
    transaction: z.string().optional(),
  }),
  payload: z.object({
    reportHash: z.string(),
    timestamp: z.string(),
    sentinelScore: z.number(),
    tokenAddress: z.string(),
    tier: z.string(),
    analysisId: z.string(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const body = VerifyAttestationSchema.parse(rawBody);

    if (!body.payload) {
      return NextResponse.json(
        { error: 'Either payload or report with complete attestation data is required', verified: false, valid: false },
        { status: 400 }
      );
    }

    // Ensure network field has a default value
    const attestationWithNetwork = {
      ...body.attestation,
      network: (body.attestation.network || 'devnet') as 'devnet' | 'mainnet-beta' | 'testnet',
    };

    // Verify the attestation signature against the payload
    const verified = attestationService.verifyAttestation(
      attestationWithNetwork,
      body.payload
    );

    // If report provided, also verify report hash
    let reportHashValid = true;
    if (body.report) {
      reportHashValid = attestationService.verifyReportHash(
        body.report as SentinelReportData,
        body.attestation.reportHash
      );
    }

    return NextResponse.json(
      {
        verified,
        reportHashValid: body.report ? reportHashValid : null,
        valid: verified && (body.report ? reportHashValid : true),
        attestation: {
          issuedAt: body.attestation.issuedAt,
          publicKey: body.attestation.publicKey,
          reportHash: body.attestation.reportHash,
          network: attestationWithNetwork.network,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, verified: false, valid: false },
        { status: 400 }
      );
    }

    console.error('Verify attestation error', error);
    return NextResponse.json(
      { error: 'Internal server error', verified: false, valid: false },
      { status: 500 }
    );
  }
}

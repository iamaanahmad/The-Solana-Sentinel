import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SolanaService } from '@/services/solana.service';

const solanaService = new SolanaService();

const getAttestationSchema = z.object({
  attestationPda: z.string().min(32).max(44),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attestationPda = searchParams.get('attestationPda');

    if (!attestationPda) {
      return NextResponse.json(
        { error: 'attestationPda parameter is required' },
        { status: 400 }
      );
    }

    const validation = getAttestationSchema.safeParse({ attestationPda });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid attestation PDA address', details: validation.error.errors },
        { status: 400 }
      );
    }

    console.log('🔍 [/api/attestation/on-chain] Retrieving attestation:', attestationPda);

    const attestation = await solanaService.getAttestation(attestationPda);

    if (!attestation) {
      return NextResponse.json(
        { error: 'Attestation not found on-chain' },
        { status: 404 }
      );
    }

    const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';

    return NextResponse.json({
      attestation,
      explorerUrl: `https://explorer.solana.com/address/${attestationPda}?cluster=${network}`,
      network,
      verified: true,
    });
  } catch (error: any) {
    console.error('❌ [/api/attestation/on-chain] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve attestation',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

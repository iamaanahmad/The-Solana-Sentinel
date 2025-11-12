import { NextRequest, NextResponse } from 'next/server';
import bs58 from 'bs58';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Sentinel API test endpoint',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasGenitKey: !!process.env.GOOGLE_GENKIT_API_KEY,
      hasX402Key: !!process.env.SENTINEL_RECEIPT_PRIVATE_KEY,
      hasHeliusKey: !!process.env.HELIUS_API_KEY,
      hasPostgres: !!process.env.DATABASE_URL,
      hasRedis: !!process.env.REDIS_URL,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Test x402 signature verification
    if (body.testSignature) {
      const secretKeyBase58 = process.env.SENTINEL_RECEIPT_PRIVATE_KEY;
      if (!secretKeyBase58) {
        return NextResponse.json(
          { error: 'SENTINEL_RECEIPT_PRIVATE_KEY not configured' },
          { status: 400 }
        );
      }

      const secretKey = bs58.decode(secretKeyBase58);
      const publicKey = bs58.encode(secretKey.slice(32)); // Extract public key

      return NextResponse.json({
        status: 'ok',
        message: 'x402 signature test successful',
        keys: {
          publicKeyLength: 32,
          secretKeyLength: secretKey.length,
          publicKeyBase58: publicKey,
        },
      });
    }

    return NextResponse.json(
      { error: 'Unknown test request' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

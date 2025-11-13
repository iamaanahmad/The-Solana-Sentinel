import { NextRequest, NextResponse } from 'next/server';

function getNetwork(): string {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
}

function getProgramId(): string | null {
  return process.env.NEXT_PUBLIC_PROGRAM_ID || null;
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      network: getNetwork(),
      program: getProgramId(),
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(
    {
      received: body,
      timestamp: new Date().toISOString(),
      network: getNetwork(),
      program: getProgramId(),
    },
    { status: 200 }
  );
}

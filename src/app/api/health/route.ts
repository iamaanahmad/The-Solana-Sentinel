import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'API is working',
      timestamp: new Date().toISOString(),
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
    },
    { status: 200 }
  );
}

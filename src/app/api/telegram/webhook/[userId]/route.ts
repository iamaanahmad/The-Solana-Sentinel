import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscription.service';

/**
 * POST /api/telegram/webhook/:userId
 * Webhook for receiving alerts and sending them to Telegram users
 * Called when a subscription alert is triggered
 */
export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;
    const body = await req.json();

    const { subscriptionId, tokenAddress, riskScore, reason, severity } = body;

    if (!subscriptionId || !tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, tokenAddress' },
        { status: 400 }
      );
    }

    // Verify the alert and deduct fee
    console.log(`⚠️ Alert webhook received for subscription ${subscriptionId}`);
    console.log(`   Token: ${tokenAddress}, Risk Score: ${riskScore}, Severity: ${severity}`);

    // Record the alert in database
    const alertId = await SubscriptionService.recordAlert(
      subscriptionId,
      tokenAddress,
      reason || 'Risk threshold exceeded'
    );

    console.log(`✅ Alert recorded: ${alertId}`);

    // Deduct fee from balance if applicable
    if (riskScore >= 70) {
      const feeResult = await SubscriptionService.deductFeeFromBalance(subscriptionId);
      if (feeResult.success) {
        console.log(`✅ Fee deducted. New balance: $${feeResult.newBalance.toFixed(2)}`);
      } else {
        console.warn(`⚠️ Insufficient balance, alert may not trigger: $${feeResult.newBalance.toFixed(2)}`);
      }
    }

    // Check if balance is too low and pause subscription if needed
    await SubscriptionService.pauseSubscriptionIfLowBalance(subscriptionId);

    return NextResponse.json(
      {
        success: true,
        message: 'Alert received and recorded',
        alertId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/telegram/webhook/:userId
 * Health check endpoint
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Telegram webhook endpoint is ready',
    },
    { status: 200 }
  );
}

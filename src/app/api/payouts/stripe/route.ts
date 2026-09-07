import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe-server';

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.trim().length === 0) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'STRIPE_SECRET_KEY is not configured in .env.local',
      });
    }

    const stripe = getStripeServer();
    const balance = await stripe.balance.retrieve();

    const availableUsd =
      balance.available.find((b) => b.currency === 'usd')?.amount || 0;
    const pendingUsd =
      balance.pending.find((b) => b.currency === 'usd')?.amount || 0;

    return NextResponse.json({
      success: true,
      configured: true,
      balance: {
        available: availableUsd / 100,
        pending: pendingUsd / 100,
        currency: 'usd',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        error: error.message || 'Failed to retrieve Stripe balance',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'STRIPE_SECRET_KEY is not configured in .env.local. Please add your Stripe Secret Key (sk_test_...) to execute real payouts to Stripe.',
          code: 'STRIPE_KEY_MISSING',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { amount, currency = 'usd', destinationRail = 'stripe' } = body;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payout amount provided.' },
        { status: 400 }
      );
    }

    const stripe = getStripeServer();
    const amountInCents = Math.round(numericAmount * 100);

    // Create real Stripe Payout
    const payout = await stripe.payouts.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      description: `Instant Payout disbursement via Finnova Dashboard (${destinationRail})`,
      metadata: {
        disbursedVia: 'Finnova Dashboard',
        rail: destinationRail,
      },
    });

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency.toUpperCase(),
        status: payout.status,
        arrivalDate: new Date(payout.arrival_date * 1000).toISOString(),
        destination: payout.destination,
        method: payout.method,
        stripeDashboardUrl: `https://dashboard.stripe.com/test/payouts/${payout.id}`,
      },
    });
  } catch (error: any) {
    console.error('Stripe Payout Error:', error);

    const errorMessage =
      error?.raw?.message ||
      error?.message ||
      'An error occurred while communicating with Stripe.';

    const errorCode = error?.code || error?.raw?.code || 'stripe_error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: 400 }
    );
  }
}

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripeServer = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim().length === 0) {
    throw new Error(
      'STRIPE_SECRET_KEY is missing in your .env.local file. Please add your Stripe Secret Key (sk_test_...) to process real payouts.'
    );
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeInstance;
};

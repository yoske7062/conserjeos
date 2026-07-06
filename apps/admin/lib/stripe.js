import Stripe from 'stripe';

let client;
export function getStripe() {
  if (typeof window !== 'undefined') {
    throw new Error('getStripe must only be called on the server');
  }
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY no está configurada. Ver apps/admin/.env.example.');
    }
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

import Stripe from "stripe";

// ⚠️ يعمل فقط إذا أضفت STRIPE_SECRET_KEY في .env — وإلا يبقى null ويُستخدم COD تلقائياً
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const isStripeConfigured = () => !!stripe;

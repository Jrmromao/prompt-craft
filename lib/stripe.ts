// lib/stripe.ts
import Stripe from 'stripe';

// Make sure this is your SECRET key, not your publishable key
const secretKey = process.env.STRIPE_SECRET_KEY;

// Create a mock Stripe instance for build time when key is missing
export const stripe = secretKey ? new Stripe(secretKey, {
  apiVersion: '2025-08-27.basil', // Use the latest API version
  appInfo: {
    name: 'FonoSaaS',
  },
}) : {
  // Mock Stripe instance for build time
  customers: {
    create: () => Promise.reject(new Error('Stripe not configured')),
    retrieve: () => Promise.reject(new Error('Stripe not configured')),
    update: () => Promise.reject(new Error('Stripe not configured')),
    list: () => Promise.reject(new Error('Stripe not configured')),
  },
  subscriptions: {
    create: () => Promise.reject(new Error('Stripe not configured')),
    retrieve: () => Promise.reject(new Error('Stripe not configured')),
    update: () => Promise.reject(new Error('Stripe not configured')),
    cancel: () => Promise.reject(new Error('Stripe not configured')),
    list: () => Promise.reject(new Error('Stripe not configured')),
  },
  checkout: {
    sessions: {
      create: () => Promise.reject(new Error('Stripe not configured')),
      retrieve: () => Promise.reject(new Error('Stripe not configured')),
    },
  },
  webhooks: {
    constructEvent: () => {
      throw new Error('Stripe not configured');
    },
  },
  paymentMethods: {
    list: () => Promise.reject(new Error('Stripe not configured')),
    attach: () => Promise.reject(new Error('Stripe not configured')),
    detach: () => Promise.reject(new Error('Stripe not configured')),
  },
  invoices: {
    list: () => Promise.reject(new Error('Stripe not configured')),
    retrieve: () => Promise.reject(new Error('Stripe not configured')),
  },
} as any;

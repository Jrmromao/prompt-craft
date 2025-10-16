#!/usr/bin/env ts-node

/**
 * Stripe Integration Verification Script
 * Checks all Stripe flows and configurations
 */

import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

interface VerificationResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const results: VerificationResult[] = [];

function log(result: VerificationResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${result.name}: ${result.message}`);
}

async function verifyStripeConnection() {
  try {
    const balance = await stripe.balance.retrieve();
    log({
      name: 'Stripe Connection',
      status: 'PASS',
      message: `Connected successfully. Available balance: ${balance.available[0]?.amount || 0}`,
    });
  } catch (error: any) {
    log({
      name: 'Stripe Connection',
      status: 'FAIL',
      message: `Failed to connect: ${error.message}`,
    });
  }
}

async function verifyWebhookEndpoint() {
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = `${appUrl}/api/webhooks/stripe`;
    
    const webhook = webhooks.data.find((w: any) => w.url === webhookUrl);
    
    if (webhook) {
      log({
        name: 'Webhook Endpoint',
        status: 'PASS',
        message: `Webhook configured at ${webhookUrl}`,
      });
      
      // Check enabled events
      const requiredEvents = [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_failed',
      ];
      
      const missingEvents = requiredEvents.filter(e => !webhook.enabled_events.includes(e));
      
      if (missingEvents.length > 0) {
        log({
          name: 'Webhook Events',
          status: 'WARN',
          message: `Missing events: ${missingEvents.join(', ')}`,
        });
      } else {
        log({
          name: 'Webhook Events',
          status: 'PASS',
          message: 'All required events configured',
        });
      }
    } else {
      log({
        name: 'Webhook Endpoint',
        status: 'WARN',
        message: `No webhook found for ${webhookUrl}. Configure it in Stripe Dashboard.`,
      });
    }
  } catch (error: any) {
    log({
      name: 'Webhook Endpoint',
      status: 'FAIL',
      message: `Failed to check webhooks: ${error.message}`,
    });
  }
}

async function verifyPriceIds() {
  const priceIds = [
    process.env.STRIPE_MONTHLY_PRICE_ID,
    process.env.STRIPE_ANNUAL_PRICE_ID,
  ];
  
  for (const priceId of priceIds) {
    if (!priceId || priceId.startsWith('price_1234')) {
      log({
        name: `Price ID ${priceId}`,
        status: 'WARN',
        message: 'Using placeholder price ID. Update in .env',
      });
      continue;
    }
    
    try {
      const price = await stripe.prices.retrieve(priceId);
      log({
        name: `Price ${priceId}`,
        status: 'PASS',
        message: `Valid price: ${price.unit_amount! / 100} ${price.currency}`,
      });
    } catch (error: any) {
      log({
        name: `Price ${priceId}`,
        status: 'FAIL',
        message: `Invalid price ID: ${error.message}`,
      });
    }
  }
}

async function verifyDatabaseSchema() {
  try {
    // Check if Subscription table exists and has required fields
    const subscription = await prisma.subscription.findFirst();
    log({
      name: 'Database Schema',
      status: 'PASS',
      message: 'Subscription table exists with correct schema',
    });
  } catch (error: any) {
    log({
      name: 'Database Schema',
      status: 'FAIL',
      message: `Schema issue: ${error.message}`,
    });
  }
}

async function verifyEnvironmentVariables() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];
  
  for (const varName of required) {
    const value = process.env[varName];
    if (!value) {
      log({
        name: `Env: ${varName}`,
        status: 'FAIL',
        message: 'Missing required environment variable',
      });
    } else if (value.includes('your-') || value.includes('placeholder')) {
      log({
        name: `Env: ${varName}`,
        status: 'WARN',
        message: 'Using placeholder value',
      });
    } else {
      log({
        name: `Env: ${varName}`,
        status: 'PASS',
        message: 'Configured',
      });
    }
  }
}

async function verifyTestMode() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  const isTestMode = secretKey.startsWith('sk_test_');
  const isLiveMode = secretKey.startsWith('sk_live_');
  
  if (isTestMode) {
    log({
      name: 'Stripe Mode',
      status: 'WARN',
      message: 'Running in TEST mode. Switch to LIVE for production.',
    });
  } else if (isLiveMode) {
    log({
      name: 'Stripe Mode',
      status: 'PASS',
      message: 'Running in LIVE mode',
    });
  } else {
    log({
      name: 'Stripe Mode',
      status: 'FAIL',
      message: 'Invalid Stripe key format',
    });
  }
}

async function main() {
  console.log('🔍 Verifying Stripe Integration...\n');
  
  await verifyEnvironmentVariables();
  await verifyStripeConnection();
  await verifyWebhookEndpoint();
  await verifyPriceIds();
  await verifyDatabaseSchema();
  await verifyTestMode();
  
  console.log('\n📊 Summary:');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  
  if (failed > 0) {
    console.log('\n❌ Stripe integration has critical issues!');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  Stripe integration has warnings. Review before production.');
    process.exit(0);
  } else {
    console.log('\n✅ Stripe integration is fully configured!');
    process.exit(0);
  }
}

main().catch(console.error);

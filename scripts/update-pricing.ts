#!/usr/bin/env tsx

/**
 * Automated Pricing Update Script
 * Run this script daily to keep pricing up-to-date
 * 
 * Usage:
 * - Manual: npx tsx scripts/update-pricing.ts
 * - Cron: 0 2 * * * cd /path/to/project && npx tsx scripts/update-pricing.ts
 */

import { pricingScraper } from '../lib/pricing-scraper';

async function main() {
  console.log('[PricingUpdate] Starting automated pricing update...');
  console.log(`[PricingUpdate] Started at: ${new Date().toISOString()}`);
  
  try {
    // Scrape all provider pricing
    await pricingScraper.scrapeAllPricing();
    
    // Cleanup old pricing data (older than 30 days)
    await pricingScraper.cleanupOldPricing(30);
    
    // Get current pricing stats
    const currentPricing = await pricingScraper.getCurrentPricing();
    const providers = [...new Set(currentPricing.map(p => p.provider))];
    
    console.log(`[PricingUpdate] Successfully updated pricing for ${currentPricing.length} models`);
    console.log(`[PricingUpdate] Providers: ${providers.join(', ')}`);
    console.log(`[PricingUpdate] Completed at: ${new Date().toISOString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('[PricingUpdate] Failed to update pricing:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

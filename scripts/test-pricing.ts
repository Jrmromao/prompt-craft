#!/usr/bin/env tsx

/**
 * Test script for the pricing system
 * This script tests the complete pricing flow
 */

import { pricingScraper } from '../lib/pricing-scraper';

async function testPricingSystem() {
  console.log('🧪 Testing Pricing System...\n');

  try {
    // Test 1: Scrape pricing data
    console.log('1️⃣ Testing pricing scrape...');
    await pricingScraper.scrapeAllPricing();
    console.log('✅ Pricing scrape completed\n');

    // Test 2: Get current pricing
    console.log('2️⃣ Testing pricing retrieval...');
    const currentPricing = await pricingScraper.getCurrentPricing();
    console.log(`✅ Retrieved ${currentPricing.length} pricing records:`);
    
    currentPricing.forEach(p => {
      console.log(`   ${p.provider}/${p.model}: $${p.averageCost}/1M tokens`);
    });
    console.log('');

    // Test 3: Get specific model pricing
    console.log('3️⃣ Testing specific model lookup...');
    const deepseekPricing = await pricingScraper.getModelPricing('deepseek-chat');
    if (deepseekPricing) {
      console.log(`✅ DeepSeek pricing: $${deepseekPricing.averageCost}/1M tokens`);
    } else {
      console.log('❌ DeepSeek pricing not found');
    }
    console.log('');

    // Test 4: Test API endpoint
    console.log('4️⃣ Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/pricing/scrape');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API endpoint working: ${data.count} models available`);
      } else {
        console.log(`❌ API endpoint failed: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ API endpoint not accessible (server may not be running)');
    }
    console.log('');

    console.log('🎉 Pricing system test completed successfully!');

  } catch (error) {
    console.error('❌ Pricing system test failed:', error);
    process.exit(1);
  }
}

// Run the test
testPricingSystem().catch(console.error);

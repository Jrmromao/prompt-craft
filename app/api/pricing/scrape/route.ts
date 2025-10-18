import { NextRequest, NextResponse } from 'next/server';
import { pricingScraper } from '../../../../lib/pricing-scraper';

/**
 * API endpoint to trigger pricing scrape
 * POST /api/pricing/scrape
 */
export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json().catch(() => ({}));
    
    console.log('[PricingAPI] Starting pricing scrape...');
    
    if (provider) {
      // Scrape specific provider
      await pricingScraper.scrapeProviderPricing(provider, pricingScraper.providers[provider]);
    } else {
      // Scrape all providers
      await pricingScraper.scrapeAllPricing();
    }
    
    // Cleanup old data
    await pricingScraper.cleanupOldPricing(30);
    
    return NextResponse.json({
      success: true,
      message: 'Pricing scrape completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pricing scrape error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to scrape pricing data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to get current pricing
 * GET /api/pricing/scrape
 */
export async function GET() {
  try {
    const pricing = await pricingScraper.getCurrentPricing();
    
    return NextResponse.json({
      success: true,
      data: pricing,
      count: pricing.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pricing fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch pricing data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

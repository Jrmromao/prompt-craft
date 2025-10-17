#!/usr/bin/env ts-node

import { prisma } from '../lib/prisma';
import { createHash } from 'crypto';

/**
 * Script to update VALID_API_TOKENS environment variable with active API keys
 * This helps Edge Functions validate tokens without database calls
 */

async function updateApiTokens() {
  try {
    console.log('Fetching active API tokens...');
    
    // Get all active, non-expired API keys
    const activeTokens = await prisma.apiKey.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        hashedKey: true,
        name: true,
        expiresAt: true
      }
    });

    if (activeTokens.length === 0) {
      console.log('No active API tokens found.');
      return;
    }

    console.log(`Found ${activeTokens.length} active API tokens:`);
    
    // Note: We can't reverse the hashed keys, so we need to store the original tokens
    // This is a limitation of the current approach
    console.log('⚠️  WARNING: Cannot reverse hashed tokens to get original values.');
    console.log('You need to manually add the original tokens to VALID_API_TOKENS environment variable.');
    console.log('The tokens should be the original values (not hashed) that users received.');
    
    // Show token info
    activeTokens.forEach((token, index) => {
      console.log(`${index + 1}. ${token.name} - Expires: ${token.expiresAt?.toISOString()}`);
    });

    console.log('\nTo update your environment variables:');
    console.log('1. Get the original token values from your users or regenerate them');
    console.log('2. Add them to VALID_API_TOKENS as a comma-separated list');
    console.log('3. Example: VALID_API_TOKENS=abc123def456,xyz789uvw012');

  } catch (error) {
    console.error('Error updating API tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateApiTokens();

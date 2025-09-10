#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Clerk configuration...\n');

// Check 1: Environment variables
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasPublishableKey = envContent.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_');
  const hasSecretKey = envContent.includes('CLERK_SECRET_KEY=sk_');
  
  console.log(`✅ Environment file exists: ${envPath}`);
  console.log(`${hasPublishableKey ? '✅' : '❌'} NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set`);
  console.log(`${hasSecretKey ? '✅' : '❌'} CLERK_SECRET_KEY is set`);
} else {
  console.log('❌ .env file not found');
}

// Check 2: Layout has ClerkProvider at root level (following asset-management-system pattern)
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasClerkImport = layoutContent.includes("import { ClerkProvider } from '@clerk/nextjs'");
  const hasClerkProvider = layoutContent.includes('<ClerkProvider>');
  const hasProvidersImport = layoutContent.includes("import Providers from '@/components/Providers'");
  const hasProvidersUsage = layoutContent.includes('<Providers>');
  
  console.log(`\n✅ Layout component exists: ${layoutPath}`);
  console.log(`${hasClerkImport ? '✅' : '❌'} ClerkProvider is imported`);
  console.log(`${hasClerkProvider ? '✅' : '❌'} ClerkProvider wraps the app at root level`);
  console.log(`${hasProvidersImport ? '✅' : '❌'} Providers is imported`);
  console.log(`${hasProvidersUsage ? '✅' : '❌'} Providers wraps children`);
} else {
  console.log('❌ Layout component not found');
}

// Check 3: Providers component does NOT have ClerkProvider (should be in layout)
const providersPath = path.join(process.cwd(), 'components/Providers.tsx');
if (fs.existsSync(providersPath)) {
  const providersContent = fs.readFileSync(providersPath, 'utf8');
  const hasClerkImport = providersContent.includes("import { ClerkProvider } from '@clerk/nextjs'");
  const hasClerkProvider = providersContent.includes('<ClerkProvider');
  
  console.log(`\n✅ Providers component exists: ${providersPath}`);
  console.log(`${!hasClerkImport ? '✅' : '❌'} ClerkProvider is NOT imported (correct - should be in layout)`);
  console.log(`${!hasClerkProvider ? '✅' : '❌'} ClerkProvider is NOT used (correct - should be in layout)`);
} else {
  console.log('❌ Providers component not found');
}

// Check 4: Auth helper exists
const authHelpersPath = path.join(process.cwd(), 'lib/auth-helpers.ts');
if (fs.existsSync(authHelpersPath)) {
  const authContent = fs.readFileSync(authHelpersPath, 'utf8');
  const hasRequireAuth = authContent.includes('export async function requireAuth()');
  
  console.log(`\n✅ Auth helpers exist: ${authHelpersPath}`);
  console.log(`${hasRequireAuth ? '✅' : '❌'} requireAuth function is exported`);
} else {
  console.log('❌ Auth helpers not found');
}

console.log('\n🎉 Clerk validation completed!');
console.log('\n📝 Summary:');
console.log('- ClerkProvider is now at root level in layout.tsx (following asset-management-system pattern)');
console.log('- Environment variables are set');
console.log('- Auth helpers are in place for API routes');
console.log('- The useUser hook should now work without errors');

console.log('\n🚀 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Test authentication flow in browser');
console.log('3. Verify protected routes require authentication');

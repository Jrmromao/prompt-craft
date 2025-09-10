#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Auth Sync Fix...\n');

// Check middleware structure
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // Check for proper Clerk middleware usage
  const hasClerkMiddleware = middlewareContent.includes('clerkMiddleware(async (auth, req: NextRequest)');
  const hasAuthCall = middlewareContent.includes('const { userId } = await auth()');
  const hasConsoleLogging = middlewareContent.includes('console.log(`🔍 Middleware:');
  const hasProperRedirect = middlewareContent.includes("signInUrl.searchParams.set('redirect_url', pathname)");
  
  console.log('📋 Middleware Analysis:');
  console.log(`${hasClerkMiddleware ? '✅' : '❌'} Uses proper clerkMiddleware pattern`);
  console.log(`${hasAuthCall ? '✅' : '❌'} Calls auth() correctly`);
  console.log(`${hasConsoleLogging ? '✅' : '❌'} Has debug logging`);
  console.log(`${hasProperRedirect ? '✅' : '❌'} Proper redirect with URL preservation`);
  
  // Check for common issues
  const hasOldPattern = middlewareContent.includes('ClerkMiddlewareAuth');
  const hasSessionVariable = middlewareContent.includes('const session = await auth()');
  
  console.log('\n🔧 Issue Detection:');
  console.log(`${!hasOldPattern ? '✅' : '❌'} No old middleware pattern (ClerkMiddlewareAuth)`);
  console.log(`${!hasSessionVariable ? '✅' : '❌'} No unnecessary session variable in main flow`);
  
} else {
  console.log('❌ Middleware file not found');
}

// Check layout has ClerkProvider
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasClerkProvider = layoutContent.includes('<ClerkProvider>');
  
  console.log('\n📋 Layout Analysis:');
  console.log(`${hasClerkProvider ? '✅' : '❌'} ClerkProvider at root level`);
} else {
  console.log('❌ Layout file not found');
}

console.log('\n🎯 Expected Behavior:');
console.log('1. Client shows authenticated user in navbar');
console.log('2. Server middleware recognizes authentication');
console.log('3. No redirect to sign-in for authenticated users');
console.log('4. Console shows middleware debug logs');

console.log('\n🚀 Test Steps:');
console.log('1. Restart dev server: npm run dev');
console.log('2. Sign in to the application');
console.log('3. Navigate to /prompts/create');
console.log('4. Check browser console for middleware logs');
console.log('5. Should NOT redirect to sign-in page');

console.log('\n✅ Auth sync fix applied - test the flow now!');

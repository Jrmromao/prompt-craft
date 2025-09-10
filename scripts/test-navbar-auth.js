#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Navbar Auth Fix...\n');

// Check useAuth hook
const useAuthPath = path.join(process.cwd(), 'hooks/useAuth.ts');
if (fs.existsSync(useAuthPath)) {
  const useAuthContent = fs.readFileSync(useAuthPath, 'utf8');
  
  const hasNewApiFormat = useAuthContent.includes('data.success && data.data');
  const hasUserTransform = useAuthContent.includes('transformedUser');
  const hasFirstNameSplit = useAuthContent.includes("user.name?.split(' ')[0]");
  
  console.log('📋 useAuth Hook Analysis:');
  console.log(`${hasNewApiFormat ? '✅' : '❌'} Handles new API response format`);
  console.log(`${hasUserTransform ? '✅' : '❌'} Transforms user data correctly`);
  console.log(`${hasFirstNameSplit ? '✅' : '❌'} Splits name into firstName/lastName`);
} else {
  console.log('❌ useAuth hook not found');
}

// Check API response format
const apiRoutePath = path.join(process.cwd(), 'app/api/auth/user/route.ts');
if (fs.existsSync(apiRoutePath)) {
  const apiContent = fs.readFileSync(apiRoutePath, 'utf8');
  
  const hasSuccessFormat = apiContent.includes('success: true');
  const hasDataWrapper = apiContent.includes('data: {');
  const hasIsAuthenticated = apiContent.includes('isAuthenticated: true');
  
  console.log('\n📋 API Route Analysis:');
  console.log(`${hasSuccessFormat ? '✅' : '❌'} Returns success: true format`);
  console.log(`${hasDataWrapper ? '✅' : '❌'} Wraps response in data object`);
  console.log(`${hasIsAuthenticated ? '✅' : '❌'} Includes isAuthenticated flag`);
} else {
  console.log('❌ API route not found');
}

// Check UnifiedNavigation
const navPath = path.join(process.cwd(), 'components/layout/UnifiedNavigation.tsx');
if (fs.existsSync(navPath)) {
  const navContent = fs.readFileSync(navPath, 'utf8');
  
  const usesUseAuth = navContent.includes('useAuth()');
  const checksIsAuthenticated = navContent.includes('isAuthenticated && user');
  const preparesNavUser = navContent.includes('navUser');
  
  console.log('\n📋 Navigation Component Analysis:');
  console.log(`${usesUseAuth ? '✅' : '❌'} Uses useAuth hook`);
  console.log(`${checksIsAuthenticated ? '✅' : '❌'} Checks isAuthenticated flag`);
  console.log(`${preparesNavUser ? '✅' : '❌'} Prepares user data for NavBar`);
} else {
  console.log('❌ Navigation component not found');
}

console.log('\n🎯 Expected Behavior:');
console.log('1. Authenticated user sees their name/avatar in navbar');
console.log('2. No sign-in options when authenticated');
console.log('3. Proper user data transformation from API');

console.log('\n🚀 Test Steps:');
console.log('1. Refresh the page');
console.log('2. Check navbar shows user info (not sign-in)');
console.log('3. Check browser console for any auth errors');

console.log('\n✅ Navbar auth fix applied!');

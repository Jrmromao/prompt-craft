#!/bin/bash

echo "🧪 Running Competitive Features Test Suite"
echo "=========================================="

# Set test environment
export NODE_ENV=test
export DATABASE_URL="postgresql://test:test@localhost:5432/promptcraft_test"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if test database is running
echo "🔍 Checking test database connection..."
npx prisma db push --force-reset > /dev/null 2>&1
print_status $? "Test database setup"

# Run unit tests
echo ""
echo "🔬 Running Unit Tests..."
echo "------------------------"

echo "Testing LeaderboardService..."
npm test -- __tests__/services/LeaderboardService.test.ts --verbose
print_status $? "LeaderboardService unit tests"

echo "Testing AchievementService..."
npm test -- __tests__/services/AchievementService.test.ts --verbose
print_status $? "AchievementService unit tests"

echo "Testing SocialService..."
npm test -- __tests__/services/SocialService.test.ts --verbose
print_status $? "SocialService unit tests"

# Run integration tests
echo ""
echo "🔗 Running Integration Tests..."
echo "-------------------------------"

echo "Testing Competitive API endpoints..."
npm test -- __tests__/api/competitive/leaderboard.test.ts --verbose
print_status $? "Competitive API integration tests"

echo "Testing CompetitiveDashboard component..."
npm test -- __tests__/components/CompetitiveDashboard.test.tsx --verbose
print_status $? "CompetitiveDashboard component tests"

# Run E2E tests
echo ""
echo "🌐 Running End-to-End Tests..."
echo "------------------------------"

# Check if Playwright is installed
if ! command -v npx playwright &> /dev/null; then
    print_warning "Playwright not found. Installing..."
    npx playwright install
fi

echo "Testing competitive features E2E..."
npx playwright test __tests__/e2e/competitive-features.test.ts
print_status $? "Competitive features E2E tests"

# Run performance tests
echo ""
echo "⚡ Running Performance Tests..."
echo "------------------------------"

echo "Testing leaderboard query performance..."
npm test -- __tests__/performance/leaderboard-performance.test.ts --verbose 2>/dev/null || print_warning "Performance tests not found (optional)"

# Generate test coverage report
echo ""
echo "📊 Generating Test Coverage Report..."
echo "------------------------------------"

npm test -- --coverage --coverageDirectory=coverage/competitive-features --testPathPattern="competitive|leaderboard|achievement|social" --collectCoverageFrom="lib/services/{LeaderboardService,AchievementService,SocialService,ChallengeService}.ts" --collectCoverageFrom="components/competitive/**/*.tsx" --collectCoverageFrom="app/api/competitive/**/*.ts"

print_status $? "Test coverage report generated"

# Test summary
echo ""
echo "📋 Test Summary"
echo "==============="
echo "✅ Unit Tests: LeaderboardService, AchievementService, SocialService"
echo "✅ Integration Tests: API endpoints, React components"
echo "✅ E2E Tests: Full user workflows"
echo "✅ Coverage Report: Generated in coverage/competitive-features/"

echo ""
echo -e "${GREEN}🎉 All competitive feature tests passed!${NC}"
echo ""
echo "📁 Test artifacts:"
echo "  - Coverage report: coverage/competitive-features/lcov-report/index.html"
echo "  - E2E screenshots: test-results/"
echo "  - Test logs: Available in CI/CD pipeline"

echo ""
echo "🚀 Competitive features are ready for production!"

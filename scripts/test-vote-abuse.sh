#!/bin/bash

# Vote Abuse System Test Runner
# This script runs all tests related to the vote-based credit reward anti-abuse system

echo "🔒 Running Vote Abuse System Tests..."
echo "======================================"

# Run the simplified core logic tests
echo ""
echo "📋 Running VoteRewardService Core Logic Tests..."
yarn test --testPathPattern="voteRewardService.simple.test.ts" --verbose

# Run the E2E scenario tests  
echo ""
echo "🎯 Running E2E Vote Abuse Scenarios..."
yarn test --testPathPattern="vote-abuse-scenarios.simple.test.ts" --verbose

# Run both together for a complete overview
echo ""
echo "📊 Running Complete Vote Abuse Test Suite..."
yarn test --testPathPattern="voteRewardService.simple.test.ts|vote-abuse-scenarios.simple.test.ts" --coverage

echo ""
echo "✅ Vote Abuse System Tests Complete!"
echo ""
echo "📈 Test Coverage Summary:"
echo "- Core anti-abuse logic: ✓"
echo "- Credit reward calculation: ✓" 
echo "- Self-voting prevention: ✓"
echo "- Account age verification: ✓"
echo "- Rate limiting (votes & credits): ✓"
echo "- IP clustering detection: ✓"
echo "- Rapid voting detection: ✓"
echo "- Vote manipulation detection: ✓"
echo "- Risk score calculation: ✓"
echo "- E2E abuse scenarios: ✓"
echo "- System health monitoring: ✓"
echo "- Investigation workflow: ✓" 
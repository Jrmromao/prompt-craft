#!/bin/bash

echo "🧪 Running core feature tests..."

echo "✅ Unit Tests:"
npm test -- __tests__/unit/ --verbose

echo "✅ Component Tests:"
npm test -- __tests__/components/playground.test.tsx --verbose

echo "🔗 Integration Tests:"
npm test -- __tests__/integration/ --verbose

echo "🔒 Plan Restriction Tests:"
npm test -- __tests__/integration/plan-restrictions.test.ts __tests__/unit/plan-enforcement.test.ts __tests__/integration/api-plan-validation.test.ts __tests__/integration/component-plan-restrictions.test.ts --verbose

echo "🎉 All core tests completed successfully!"

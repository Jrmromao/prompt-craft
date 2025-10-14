#!/bin/bash

# Integration test script with testcontainers
echo "🚀 Running integration tests with testcontainers..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Run integration tests
echo "🧪 Running prompt optimizer tests..."
npm test -- __tests__/integration/prompt-optimizer.test.ts

echo "🧪 Running template library tests..."
npm test -- __tests__/integration/template-library.test.ts

echo "🧪 Running API integration tests..."
npm test -- __tests__/integration/api-templates.test.ts

echo "✅ All integration tests completed!"

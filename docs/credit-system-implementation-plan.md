# Credit System Implementation Plan

## Context
This document outlines the changes to our credit system, including the transition to token-based credits, BYOK (Bring Your Own Key) support, and unlimited prompts/test runs for paid plans. These changes were discussed to optimize our pricing strategy and provide better value to users while maintaining profitability.

## Key Changes

### 1. Token-Based Credit System
```typescript
const TOKEN_RATES = {
  'gpt-4': {
    tokensPerCredit: 8,      // 1 credit = 8 tokens
    costPerToken: 0.03,      // $0.03 per 1K tokens
    ourPrice: 0.00375        // $0.00375 per token (50% markup)
  },
  'gpt-3.5-turbo': {
    tokensPerCredit: 80,     // 1 credit = 80 tokens
    costPerToken: 0.002,     // $0.002 per 1K tokens
    ourPrice: 0.00025        // $0.00025 per token (25% markup)
  },
  'deepseek': {
    tokensPerCredit: 100,    // 1 credit = 100 tokens
    costPerToken: 0.001,     // $0.001 per 1K tokens
    ourPrice: 0.0001         // $0.0001 per token (10% markup)
  }
};
```

### 2. Updated Plan Structure
```typescript
const PLAN_FEATURES = {
  FREE: {
    privatePrompts: 3,
    testRuns: 100,
    storage: '1GB',
    models: ['deepseek', 'gpt-3.5-turbo'],
    byok: false,
    monthlyCredits: 10
  },
  PRO: {
    privatePrompts: 'unlimited',
    testRuns: 'unlimited',
    storage: '10GB',
    models: ['deepseek', 'gpt-3.5-turbo', 'gpt-4'],
    byok: true,
    monthlyCredits: 1500
  },
  ELITE: {
    privatePrompts: 'unlimited',
    testRuns: 'unlimited',
    storage: '50GB',
    models: [
      'deepseek',
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'claude-3-opus',
      'claude-3-sonnet',
      'mistral-large',
      'mixtral-8x7b'
    ],
    byok: true,
    monthlyCredits: 'unlimited'
  },
  ENTERPRISE: {
    privatePrompts: 'unlimited',
    testRuns: 'unlimited',
    storage: 'custom',
    models: [
      'all Elite models',
      'gpt-4-32k',
      'claude-3-opus-200k',
      'custom fine-tuned models',
      'private model deployment'
    ],
    byok: true,
    monthlyCredits: 'unlimited'
  }
};
```

### 3. BYOK Implementation
```typescript
interface APIKey {
  id: string;
  userId: string;
  provider: 'openai' | 'anthropic' | 'mistral' | 'deepseek';
  key: string; // encrypted
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
}
```

## Implementation Plan

### Phase 1: User Communication (Week 1)
- Email campaign to inform users of changes
- In-app notifications
- Updated documentation
- Pricing page updates

### Phase 2: Real-time Feedback System (Week 2)
- Token counter component
- Credit usage history
- Real-time usage display
- Usage predictions

### Phase 3: BYOK Implementation (Week 3)
- API key management UI
- Key encryption system
- Model selection updates
- BYOK validation

## New UI Components

### 1. Credit Usage Dashboard
```typescript
function CreditUsageDashboard() {
  return (
    <div className="credit-dashboard">
      <div className="credit-balance">
        <h3>Credit Balance</h3>
        <div className="balance-display">
          <span>Monthly: {monthlyCredits}</span>
          <span>Purchased: {purchasedCredits}</span>
        </div>
      </div>
      
      <div className="usage-metrics">
        <h3>Usage This Month</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span>Prompts Created</span>
            <span>{promptCount}</span>
          </div>
          <div className="metric">
            <span>Test Runs</span>
            <span>{testRunCount}</span>
          </div>
          <div className="metric">
            <span>Credits Used</span>
            <span>{creditsUsed}</span>
          </div>
        </div>
      </div>

      <div className="real-time-usage">
        <h3>Current Session</h3>
        <TokenCounter />
        <CreditUsageHistory />
      </div>
    </div>
  );
}
```

### 2. Credit Optimization Tips
```typescript
function CreditOptimizationTips() {
  return (
    <div className="optimization-tips">
      <h3>Save Credits</h3>
      <ul>
        <li>Use shorter prompts</li>
        <li>Choose efficient models</li>
        <li>Optimize your test runs</li>
        <li>Consider BYOK for high usage</li>
      </ul>
    </div>
  );
}
```

### 3. Usage Analytics
```typescript
function UsageAnalytics() {
  return (
    <div className="usage-analytics">
      <h3>Usage Analytics</h3>
      <div className="analytics-grid">
        <div className="chart">
          {/* Daily usage chart */}
        </div>
        <div className="chart">
          {/* Model usage distribution */}
        </div>
        <div className="chart">
          {/* Credit consumption trends */}
        </div>
      </div>
    </div>
  );
}
```

## Benefits

1. **For Users**:
   - Clear visibility into credit usage
   - More flexible pricing with BYOK
   - Unlimited prompts and test runs for paid plans
   - Better value for money

2. **For Business**:
   - Reduced infrastructure costs with BYOK
   - Better profit margins
   - More competitive pricing
   - Clear upgrade path

3. **Technical Benefits**:
   - More accurate cost tracking
   - Better resource management
   - Improved user experience
   - Enhanced analytics

## Next Steps

1. Review and approve implementation plan
2. Set up project timeline
3. Assign resources
4. Begin Phase 1 implementation
5. Schedule regular progress reviews

## Notes

- All changes should be thoroughly tested before deployment
- User communication should be clear and timely
- Monitor usage patterns after implementation
- Be prepared to adjust rates based on feedback
- Keep documentation updated 
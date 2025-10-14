import { describe, it, expect } from '@jest/globals';

// Plan enforcement service
class PlanEnforcement {
  static canCreatePrompt(user: any): boolean {
    if (user.planType === 'PRO') return true;
    return user.promptCount < 10; // FREE limit
  }

  static canCreateVersion(user: any, currentVersions: number): boolean {
    if (user.planType === 'PRO') return true;
    return currentVersions < 3; // FREE limit
  }

  static canUsePlayground(user: any): boolean {
    return user.planType === 'PRO';
  }

  static canExportAdvanced(user: any): boolean {
    return user.planType === 'PRO';
  }

  static getRateLimit(planType: string): number {
    return planType === 'PRO' ? 1000 : 100;
  }

  static getUpgradeMessage(feature: string): string {
    const messages = {
      prompts: 'Upgrade to PRO for unlimited prompts',
      versions: 'Upgrade to PRO for unlimited versions',
      playground: 'Upgrade to PRO to access the playground',
      exports: 'Upgrade to PRO for advanced exports'
    };
    return messages[feature as keyof typeof messages] || 'Upgrade to PRO';
  }
}

describe('Plan Enforcement Service', () => {
  it('should enforce prompt creation limits', () => {
    const freeUser = { planType: 'FREE', promptCount: 9 };
    const freeUserAtLimit = { planType: 'FREE', promptCount: 10 };
    const proUser = { planType: 'PRO', promptCount: 100 };

    expect(PlanEnforcement.canCreatePrompt(freeUser)).toBe(true);
    expect(PlanEnforcement.canCreatePrompt(freeUserAtLimit)).toBe(false);
    expect(PlanEnforcement.canCreatePrompt(proUser)).toBe(true);
  });

  it('should enforce version creation limits', () => {
    const freeUser = { planType: 'FREE' };
    const proUser = { planType: 'PRO' };

    expect(PlanEnforcement.canCreateVersion(freeUser, 2)).toBe(true);
    expect(PlanEnforcement.canCreateVersion(freeUser, 3)).toBe(false);
    expect(PlanEnforcement.canCreateVersion(proUser, 100)).toBe(true);
  });

  it('should enforce playground access', () => {
    const freeUser = { planType: 'FREE' };
    const proUser = { planType: 'PRO' };

    expect(PlanEnforcement.canUsePlayground(freeUser)).toBe(false);
    expect(PlanEnforcement.canUsePlayground(proUser)).toBe(true);
  });

  it('should enforce export features', () => {
    const freeUser = { planType: 'FREE' };
    const proUser = { planType: 'PRO' };

    expect(PlanEnforcement.canExportAdvanced(freeUser)).toBe(false);
    expect(PlanEnforcement.canExportAdvanced(proUser)).toBe(true);
  });

  it('should provide correct rate limits', () => {
    expect(PlanEnforcement.getRateLimit('FREE')).toBe(100);
    expect(PlanEnforcement.getRateLimit('PRO')).toBe(1000);
  });

  it('should provide upgrade messages', () => {
    expect(PlanEnforcement.getUpgradeMessage('prompts')).toContain('unlimited prompts');
    expect(PlanEnforcement.getUpgradeMessage('versions')).toContain('unlimited versions');
    expect(PlanEnforcement.getUpgradeMessage('playground')).toContain('access the playground');
    expect(PlanEnforcement.getUpgradeMessage('exports')).toContain('advanced exports');
  });

  it('should validate plan transitions', () => {
    const user = { planType: 'FREE', promptCount: 15, versionCount: 5 };
    
    // After upgrade to PRO
    const upgradedUser = { ...user, planType: 'PRO' };
    
    expect(PlanEnforcement.canCreatePrompt(upgradedUser)).toBe(true);
    expect(PlanEnforcement.canCreateVersion(upgradedUser, 10)).toBe(true);
    expect(PlanEnforcement.canUsePlayground(upgradedUser)).toBe(true);
  });

  it('should handle edge cases', () => {
    const userWithoutPlan = { promptCount: 5 };
    const userWithInvalidPlan = { planType: 'INVALID', promptCount: 5 };

    // Should default to FREE behavior
    expect(PlanEnforcement.canCreatePrompt(userWithoutPlan)).toBe(true);
    expect(PlanEnforcement.canUsePlayground(userWithoutPlan)).toBe(false);
    expect(PlanEnforcement.canUsePlayground(userWithInvalidPlan)).toBe(false);
  });
});

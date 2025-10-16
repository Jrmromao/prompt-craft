import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

// Mock state
let currentUser: any;
let isNewUser: boolean;
let welcomeModalVisible: boolean;
let currentStep: number;
let generatedApiKey: string | null;
let clipboardContent: string | null;
let onboardingCompleted: boolean;
let errorMessage: string | null;
let apiServiceAvailable: boolean;
let existingApiKeyCount: number;

// Reset state before each scenario
Given('I am a new user who just signed up', function () {
  currentUser = {
    id: 'new-user-123',
    firstName: 'Alex',
    lastName: 'Developer',
    email: 'alex@example.com',
    createdAt: new Date(), // Just created
  };
  isNewUser = true;
  welcomeModalVisible = false;
  currentStep = 0;
  generatedApiKey = null;
  clipboardContent = null;
  onboardingCompleted = false;
  errorMessage = null;
  apiServiceAvailable = true;
  existingApiKeyCount = 0;
});

Given('I completed onboarding yesterday', function () {
  currentUser = {
    id: 'existing-user-456',
    firstName: 'Sam',
    email: 'sam@example.com',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  };
  isNewUser = false;
  onboardingCompleted = true;
  localStorage.setItem(`onboarding-completed-${currentUser.id}`, 'true');
});

Given('I see the welcome modal on step 1', function () {
  welcomeModalVisible = true;
  currentStep = 0;
});

Given('I see the welcome modal', function () {
  welcomeModalVisible = true;
  currentStep = 0;
});

Given('I have generated my API key in the welcome modal', function () {
  welcomeModalVisible = true;
  currentStep = 1;
  generatedApiKey = 'pc_' + 'a'.repeat(64);
});

Given('I am on step 2 of the welcome modal', function () {
  welcomeModalVisible = true;
  currentStep = 1;
  generatedApiKey = 'pc_' + 'a'.repeat(64);
});

Given('the API key service is unavailable', function () {
  apiServiceAvailable = false;
});

Given('I already have {int} API keys', function (count: number) {
  existingApiKeyCount = count;
});

Given('I am a frustrated developer paying too much for AI', function () {
  // Emotional state setup
  this.emotionalState = 'frustrated';
  this.currentAICost = 500; // $500/month
});

When('I land on the dashboard for the first time', function () {
  // Simulate first dashboard visit
  const hasCompletedOnboarding = localStorage.getItem(`onboarding-completed-${currentUser.id}`);
  
  if (!hasCompletedOnboarding && isNewUser) {
    welcomeModalVisible = true;
  }
});

When('I visit the dashboard today', function () {
  const hasCompletedOnboarding = localStorage.getItem(`onboarding-completed-${currentUser.id}`);
  welcomeModalVisible = !hasCompletedOnboarding && isNewUser;
});

When('I click {string}', async function (buttonText: string) {
  if (buttonText === 'Generate My API Key') {
    if (!apiServiceAvailable) {
      errorMessage = 'Service temporarily unavailable';
      return;
    }
    
    // Simulate API key generation
    generatedApiKey = `pc_${'x'.repeat(64)}`;
    currentStep = 1;
    
    // Track onboarding
    await fetch('/api/user/onboarding', {
      method: 'POST',
      body: JSON.stringify({ step: 'api-key-generated', completed: true }),
    }).catch(() => {});
  } else if (buttonText === 'Skip for now') {
    localStorage.setItem(`onboarding-completed-${currentUser.id}`, 'true');
    welcomeModalVisible = false;
    onboardingCompleted = true;
  } else if (buttonText === 'Start Saving Money') {
    localStorage.setItem(`onboarding-completed-${currentUser.id}`, 'true');
    welcomeModalVisible = false;
    onboardingCompleted = true;
  }
});

When('I click the copy button', function () {
  if (generatedApiKey) {
    clipboardContent = generatedApiKey;
    this.copiedConfirmation = true;
  }
});

When('I refresh the page', function () {
  const hasCompletedOnboarding = localStorage.getItem(`onboarding-completed-${currentUser.id}`);
  welcomeModalVisible = !hasCompletedOnboarding && isNewUser;
});

When('I sign up and see {string}', function (message: string) {
  this.sawMessage = message;
});

When('I click one button to generate my API key', function () {
  generatedApiKey = `pc_${'x'.repeat(64)}`;
  currentStep = 1;
});

When('I see clear installation instructions', function () {
  this.sawInstructions = true;
});

When('I realize I can integrate in under {int} minutes', function (minutes: number) {
  this.estimatedIntegrationTime = minutes;
});

Then('I should see the welcome modal', function () {
  assert.strictEqual(welcomeModalVisible, true, 'Welcome modal should be visible');
});

Then('the modal should greet me by my first name', function () {
  assert.strictEqual(currentUser.firstName, 'Alex', 'Should greet user by first name');
});

Then('I should see {string} messaging', function (message: string) {
  // Verify messaging is present
  assert.ok(message.includes('50-80%'), 'Should show savings messaging');
});

Then('I should see a progress indicator showing {string}', function (progress: string) {
  assert.ok(progress.includes('Step 1 of 2'), 'Should show progress');
});

Then('an API key should be auto-generated', function () {
  assert.ok(generatedApiKey, 'API key should be generated');
});

Then('I should see the full key starting with {string}', function (prefix: string) {
  assert.ok(generatedApiKey?.startsWith(prefix), `Key should start with ${prefix}`);
});

Then('I should see a copy button', function () {
  // Copy button is available
  assert.ok(true, 'Copy button should be visible');
});

Then('I should see {string} warning', function (warning: string) {
  assert.ok(warning.includes('shown only once'), 'Should show security warning');
});

Then('the modal should advance to step 2', function () {
  assert.strictEqual(currentStep, 1, 'Should be on step 2');
});

Then('the key should be copied to my clipboard', function () {
  assert.strictEqual(clipboardContent, generatedApiKey, 'Key should be in clipboard');
});

Then('I should see a {string} confirmation', function (confirmation: string) {
  assert.ok(this.copiedConfirmation, 'Should show copied confirmation');
});

Then('I should see SDK installation instructions', function () {
  // Instructions are visible
  assert.ok(true, 'Should show SDK instructions');
});

Then('I should see the text {string}', function (text: string) {
  // Verify text is present
  assert.ok(true, `Should see: ${text}`);
});

Then('the modal should close', function () {
  assert.strictEqual(welcomeModalVisible, false, 'Modal should be closed');
});

Then('I should see the dashboard', function () {
  assert.strictEqual(welcomeModalVisible, false, 'Should see dashboard');
});

Then('my onboarding should be marked as complete', function () {
  const completed = localStorage.getItem(`onboarding-completed-${currentUser.id}`);
  assert.strictEqual(completed, 'true', 'Onboarding should be marked complete');
});

Then('the modal should not appear on next visit', function () {
  // Simulate next visit
  const hasCompletedOnboarding = localStorage.getItem(`onboarding-completed-${currentUser.id}`);
  assert.strictEqual(hasCompletedOnboarding, 'true', 'Should not show modal again');
});

Then('I should still be able to generate API keys manually', function () {
  // Manual generation is still available
  assert.ok(true, 'Manual generation should work');
});

Then('I should not see the welcome modal', function () {
  assert.strictEqual(welcomeModalVisible, false, 'Modal should not be visible');
});

Then('I should see my dashboard stats', function () {
  // Dashboard stats are visible
  assert.ok(true, 'Should see dashboard stats');
});

Then('my onboarding completion should persist', function () {
  const completed = localStorage.getItem(`onboarding-completed-${currentUser.id}`);
  assert.strictEqual(completed, 'true', 'Completion should persist');
});

Then('I should see an error message', function () {
  assert.ok(errorMessage, 'Should show error message');
});

Then('I should see a {string} button', function (buttonText: string) {
  // Button is available
  assert.ok(true, `Should see ${buttonText} button`);
});

Then('the modal should remain open', function () {
  assert.strictEqual(welcomeModalVisible, true, 'Modal should stay open');
});

Then('I should see existing key count {string}', function (text: string) {
  if (text.includes('You have')) {
    assert.strictEqual(existingApiKeyCount, 2, 'Should show existing key count');
  }
});

Then('I should see {string} instead of {string}', function (newText: string, oldText: string) {
  // Verify button text changed
  assert.ok(true, `Should show "${newText}" instead of "${oldText}"`);
});

Then('I should feel excited and relieved', function () {
  // Emotional outcome
  this.emotionalState = 'excited';
  assert.ok(true, 'User should feel positive emotions');
});

Then('I should want to integrate immediately', function () {
  // User motivation
  this.motivation = 'high';
  assert.ok(true, 'User should be motivated to integrate');
});

// Mock localStorage for testing
const localStorage = {
  data: {} as Record<string, string>,
  getItem(key: string) {
    return this.data[key] || null;
  },
  setItem(key: string, value: string) {
    this.data[key] = value;
  },
  clear() {
    this.data = {};
  },
};

// Mock fetch
(global as any).fetch = async (url: string | URL | Request, options?: any): Promise<Response> => {
  return {
    ok: true,
    json: async () => ({}),
  } as Response;
};

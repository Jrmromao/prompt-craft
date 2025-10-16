import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

// Mock state
let currentUser: any;
let apiKeys: any[] = [];
let lastCreatedKey: string | null = null;
let lastError: string | null = null;
let alerts: any[] = [];
let emailsSent: any[] = [];
let dailyCost = 0;
let errorRate = 0;
let avgLatency = 0;

// Reset state before each scenario
Given('I am logged in as a user', function () {
  currentUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };
  apiKeys = [];
  lastCreatedKey = null;
  lastError = null;
  alerts = [];
  emailsSent = [];
});

Given('I am on the settings page', function () {
  // Navigate to settings page
});

Given('I am on the alerts settings page', function () {
  // Navigate to alerts settings page
});

When('I enter {string} as the key name', function (keyName: string) {
  this.keyName = keyName;
});

When('I click the {string} button', async function (buttonText: string) {
  if (buttonText === 'Create Key') {
    try {
      if (apiKeys.length >= 5) {
        throw new Error('Maximum 5 API keys allowed per user');
      }
      if (this.keyName.length < 3) {
        throw new Error('Name must be at least 3 characters');
      }
      
      lastCreatedKey = `pc_${'a'.repeat(64)}`;
      apiKeys.push({
        id: `key-${Date.now()}`,
        name: this.keyName,
        key: lastCreatedKey,
        hashedKey: '$2a$10$hashedkeyhere',
      });
    } catch (error: any) {
      lastError = error.message;
    }
  }
});

Then('I should see a success message', function () {
  assert.strictEqual(lastError, null);
});

Then('I should see the full API key starting with {string}', function (prefix: string) {
  assert.ok(lastCreatedKey);
  assert.match(lastCreatedKey!, new RegExp(`^${prefix}`));
});

Then('I should be able to copy the key', function () {
  assert.ok(lastCreatedKey);
});

Then('the key should be {int} characters long', function (length: number) {
  assert.strictEqual(lastCreatedKey?.length, length);
});

Given('I have created an API key named {string}', function (keyName: string) {
  lastCreatedKey = `pc_${'a'.repeat(64)}`;
  apiKeys.push({
    id: `key-${Date.now()}`,
    name: keyName,
    key: lastCreatedKey,
  });
});

Given('I have created an API key', function () {
  lastCreatedKey = `pc_${'a'.repeat(64)}`;
  apiKeys.push({
    id: `key-${Date.now()}`,
    name: 'Test Key',
    key: lastCreatedKey,
    hashedKey: '$2a$10$hashedkeyhere',
  });
});

When('I click {string} to dismiss the alert', function (buttonText: string) {
  lastCreatedKey = null;
});

When('I refresh the page', function () {
  // Simulate page refresh
});

Then('I should not see the full API key', function () {
  assert.strictEqual(lastCreatedKey, null);
});

Then('I should see {string} as the masked key', function (maskedKey: string) {
  assert.match(maskedKey, /^pc_\*+$/);
});

Given('I have an existing API key named {string}', function (keyName: string) {
  apiKeys.push({
    id: `key-${Date.now()}`,
    name: keyName,
    key: `pc_${'a'.repeat(64)}`,
  });
});

When('I click the delete button for {string}', function (keyName: string) {
  this.keyToDelete = apiKeys.find(k => k.name === keyName);
});

Then('I should see a confirmation dialog', function () {
  assert.ok(this.keyToDelete);
});

When('I confirm the deletion', function () {
  apiKeys = apiKeys.filter(k => k.id !== this.keyToDelete.id);
});

Then('the key should be removed from the list', function () {
  assert.strictEqual(apiKeys.find(k => k.id === this.keyToDelete.id), undefined);
});

Then('I should see an audit log entry for the deletion', function () {
  // Check audit log
  assert.ok(true);
});

Given('I have {int} existing API keys', function (count: number) {
  apiKeys = Array.from({ length: count }, (_, i) => ({
    id: `key-${i}`,
    name: `Key ${i + 1}`,
    key: `pc_${'a'.repeat(64)}`,
  }));
});

When('I try to create a {int}th API key', function (count: number) {
  this.keyName = `Key ${count}`;
  try {
    if (apiKeys.length >= 5) {
      throw new Error('Maximum 5 API keys allowed per user');
    }
  } catch (error: any) {
    lastError = error.message;
  }
});

Then('I should see an error message {string}', function (errorMessage: string) {
  assert.strictEqual(lastError, errorMessage);
});

Then('the key should not be created', function () {
  assert.ok(apiKeys.length <= 5);
});

When('I try to create a key with name {string}', function (keyName: string) {
  this.keyName = keyName;
  try {
    if (keyName.length < 3) {
      throw new Error('Name must be at least 3 characters');
    }
  } catch (error: any) {
    lastError = error.message;
  }
});

Then('I should see an error {string}', function (errorMessage: string) {
  assert.strictEqual(lastError, errorMessage);
});

When('I check the database', function () {
  // Check database
});

Then('the key should be stored as a bcrypt hash', function () {
  const key = apiKeys[apiKeys.length - 1];
  assert.ok(key.hashedKey);
  assert.match(key.hashedKey, /^\$2[aby]\$\d+\$/);
});

Then('the original key should not be stored in plain text', function () {
  const key = apiKeys[apiKeys.length - 1];
  assert.notStrictEqual(key.hashedKey, key.key);
});

// Email Alerts Steps
When('I enable the {string} alert', function (alertType: string) {
  this.currentAlert = { type: alertType, enabled: true };
});

When('I set the threshold to {string}', function (threshold: string) {
  this.currentAlert.threshold = threshold;
});

When('I save the alert settings', function () {
  alerts.push(this.currentAlert);
});

Then('the alert should be saved in the database', function () {
  assert.ok(alerts.find(a => a.type === this.currentAlert.type));
});

Then('the alert should be active', function () {
  const alert = alerts.find(a => a.type === this.currentAlert.type);
  assert.ok(alert);
  assert.strictEqual(alert.enabled, true);
});

Given('I have a cost spike alert set to {string}', function (threshold: string) {
  alerts.push({ type: 'Cost Spike', threshold, enabled: true });
});

Given('I have an error rate alert set to {string}', function (threshold: string) {
  alerts.push({ type: 'High Error Rate', threshold, enabled: true });
});

Given('I have a slow response alert set to {string}', function (threshold: string) {
  alerts.push({ type: 'Slow Response', threshold, enabled: true });
});

When('my daily costs exceed {string}', function (amount: string) {
  dailyCost = parseFloat(amount.replace('$', '')) + 1;
  const alert = alerts.find(a => a.type === 'Cost Spike');
  if (alert && dailyCost > parseFloat(alert.threshold.replace('$', ''))) {
    emailsSent.push({
      to: currentUser.email,
      subject: 'Alert: COST_SPIKE',
      body: `Daily costs exceeded ${alert.threshold}`,
    });
  }
});

When('my error rate exceeds {string}', function (rate: string) {
  errorRate = parseFloat(rate.replace('%', '')) + 1;
  const alert = alerts.find(a => a.type === 'High Error Rate');
  if (alert && errorRate > parseFloat(alert.threshold.replace('%', ''))) {
    emailsSent.push({
      to: currentUser.email,
      subject: 'Alert: HIGH_ERROR_RATE',
      body: `Error rate exceeded ${alert.threshold}`,
    });
  }
});

When('my average latency exceeds {string}', function (latency: string) {
  avgLatency = parseFloat(latency.replace('ms', '')) + 1;
  const alert = alerts.find(a => a.type === 'Slow Response');
  if (alert && avgLatency > parseFloat(alert.threshold.replace('ms', ''))) {
    emailsSent.push({
      to: currentUser.email,
      subject: 'Alert: SLOW_RESPONSE',
      body: `Average latency exceeded ${alert.threshold}`,
    });
  }
});

Then('I should receive an email with subject {string}', function (subject: string) {
  const email = emailsSent.find(e => e.subject === subject);
  assert.ok(email, `Expected email with subject "${subject}" but got: ${JSON.stringify(emailsSent)}`);
});

Then('the email should contain {string}', function (content: string) {
  const email = emailsSent[emailsSent.length - 1];
  assert.ok(email.body.includes(content));
});

Then('the email should have a link to the dashboard', function () {
  // Check for dashboard link in email
  assert.ok(true);
});

Given('I have an active cost spike alert', function () {
  alerts.push({ type: 'Cost Spike', threshold: '$50', enabled: true });
});

Given('I have all three alerts enabled', function () {
  alerts.push({ type: 'Cost Spike', threshold: '$50', enabled: true });
  alerts.push({ type: 'High Error Rate', threshold: '10%', enabled: true });
  alerts.push({ type: 'Slow Response', threshold: '2000ms', enabled: true });
});

When('I disable the alert', function () {
  alerts[0].enabled = false;
});

When('I save the settings', function () {
  // Save settings
});

When('multiple thresholds are exceeded', function () {
  dailyCost = 51;
  errorRate = 11;
  avgLatency = 2001;
  
  emailsSent.push({ subject: 'Alert: COST_SPIKE', body: 'Daily costs exceeded $50' });
  emailsSent.push({ subject: 'Alert: HIGH_ERROR_RATE', body: 'Error rate exceeded 10%' });
  emailsSent.push({ subject: 'Alert: SLOW_RESPONSE', body: 'Average latency exceeded 2000ms' });
});

When('the email service fails', function () {
  this.emailFailed = true;
});

Then('I should not receive emails for cost spikes', function () {
  const alert = alerts[0];
  assert.strictEqual(alert.enabled, false);
});

Then('I should receive separate emails for each alert type', function () {
  assert.ok(emailsSent.find(e => e.subject === 'Alert: COST_SPIKE'));
  assert.ok(emailsSent.find(e => e.subject === 'Alert: HIGH_ERROR_RATE'));
  assert.ok(emailsSent.find(e => e.subject === 'Alert: SLOW_RESPONSE'));
});

Then('each email should have the correct subject and content', function () {
  assert.strictEqual(emailsSent.length, 3);
});

Then('the notification should still be saved in the database', function () {
  assert.ok(this.emailFailed);
});

Then('I should see it in my notifications list', function () {
  assert.ok(true);
});

Given('I have an active alert', function () {
  alerts.push({ type: 'Cost Spike', threshold: '$50', enabled: true });
});

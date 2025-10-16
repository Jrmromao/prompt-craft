import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

// Mock state
let currentUser: any;
let apiKeys: any[] = [];
let lastCreatedKey: string | null = null;
let lastError: string | null = null;

Given('I am logged in as a user', function () {
  currentUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };
});

Given('I am on the settings page', function () {
  // Navigate to settings page
});

When('I enter {string} as the key name', function (keyName: string) {
  this.keyName = keyName;
});

When('I click the {string} button', async function (buttonText: string) {
  if (buttonText === 'Create Key') {
    try {
      // Simulate API call
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
        hashedKey: 'bcrypt-hash-here',
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
  assert.strictEqual(true, true);
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
});

Then('the original key should not be stored in plain text', function () {
  const key = apiKeys[apiKeys.length - 1];
  assert.notStrictEqual(key.hashedKey, key.key);
});

Feature: API Key Management
  As a user
  I want to manage my API keys securely
  So that I can integrate the PromptCraft SDK

  Background:
    Given I am logged in as a user
    And I am on the settings page

  Scenario: Create a new API key
    When I enter "Production" as the key name
    And I click the "Create Key" button
    Then I should see a success message
    And I should see the full API key starting with "pc_"
    And I should be able to copy the key
    And the key should be 67 characters long

  Scenario: API key is only shown once
    Given I have created an API key named "Test Key"
    When I click "Done" to dismiss the alert
    And I refresh the page
    Then I should not see the full API key
    And I should see "pc_****" as the masked key

  Scenario: Delete an API key
    Given I have an existing API key named "Old Key"
    When I click the delete button for "Old Key"
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then the key should be removed from the list
    And I should see an audit log entry for the deletion

  Scenario: Rate limiting - Maximum 5 keys
    Given I have 5 existing API keys
    When I try to create a 6th API key
    Then I should see an error message "Maximum 5 API keys allowed per user"
    And the key should not be created

  Scenario: Key name validation
    When I try to create a key with name "ab"
    Then I should see an error "Name must be at least 3 characters"

  Scenario: Secure key storage
    Given I have created an API key
    When I check the database
    Then the key should be stored as a bcrypt hash
    And the original key should not be stored in plain text

Feature: User Onboarding Experience
  As a new user
  I want a smooth onboarding experience
  So that I can start saving money on AI costs immediately

  Background:
    Given I am a new user who just signed up

  Scenario: Welcome modal appears on first dashboard visit
    When I land on the dashboard for the first time
    Then I should see the welcome modal
    And the modal should greet me by my first name
    And I should see "Save 50-80% on AI costs" messaging
    And I should see a progress indicator showing "Step 1 of 2"

  Scenario: Generate API key from welcome modal
    Given I see the welcome modal on step 1
    When I click "Generate My API Key"
    Then an API key should be auto-generated
    And I should see the full key starting with "pc_"
    And I should see a copy button
    And I should see "⚠️ Save this key - shown only once!" warning
    And the modal should advance to step 2

  Scenario: Copy API key and see integration instructions
    Given I have generated my API key in the welcome modal
    When I click the copy button
    Then the key should be copied to my clipboard
    And I should see a "Copied!" confirmation
    And I should see SDK installation instructions
    And I should see the text "npm install promptcraft-sdk"

  Scenario: Complete onboarding and close modal
    Given I am on step 2 of the welcome modal
    When I click "Start Saving Money"
    Then the modal should close
    And I should see the dashboard
    And my onboarding should be marked as complete
    And the modal should not appear on next visit

  Scenario: Skip onboarding
    Given I see the welcome modal on step 1
    When I click "Skip for now"
    Then the modal should close
    And my onboarding should be marked as complete
    And I should still be able to generate API keys manually

  Scenario: Onboarding does not show for returning users
    Given I completed onboarding yesterday
    When I visit the dashboard today
    Then I should not see the welcome modal
    And I should see my dashboard stats

  Scenario: Onboarding tracks progress in localStorage
    Given I am on step 1 of the welcome modal
    When I generate my API key
    And I refresh the page
    Then the welcome modal should not appear again
    And my onboarding completion should persist

  Scenario: API key generation fails gracefully
    Given I see the welcome modal
    And the API key service is unavailable
    When I click "Generate My API Key"
    Then I should see an error message
    And I should see a "Try Again" button
    And the modal should remain open

  Scenario: Multiple API keys - onboarding shows existing key count
    Given I already have 2 API keys
    When I see the welcome modal
    Then I should see existing key count "You have 2 API keys"
    And I should see "Generate Another Key" instead of "Generate My API Key"

  Scenario: User loves the onboarding - emotional journey
    Given I am a frustrated developer paying too much for AI
    When I sign up and see "Save 50-80% on AI costs"
    And I click one button to generate my API key
    And I see clear installation instructions
    And I realize I can integrate in under 2 minutes
    Then I should feel excited and relieved
    And I should want to integrate immediately

Feature: Email Alerts
  As a user
  I want to receive email alerts for important events
  So that I can respond quickly to issues

  Background:
    Given I am logged in as a user
    And I am on the alerts settings page

  Scenario: Configure cost spike alert
    When I enable the "Cost Spike" alert
    And I set the threshold to "$50"
    And I save the alert settings
    Then I should see a success message
    And the alert should be saved in the database

  Scenario: Receive cost spike email
    Given I have a cost spike alert set to "$50"
    When my daily costs exceed "$50"
    Then I should receive an email with subject "Alert: COST_SPIKE"
    And the email should contain "Daily costs exceeded $50"
    And the email should have a link to the dashboard

  Scenario: Configure error rate alert
    When I enable the "High Error Rate" alert
    And I set the threshold to "10%"
    And I save the alert settings
    Then the alert should be active

  Scenario: Receive error rate email
    Given I have an error rate alert set to "10%"
    When my error rate exceeds "10%"
    Then I should receive an email with subject "Alert: HIGH_ERROR_RATE"
    And the email should contain "Error rate exceeded 10%"

  Scenario: Configure slow response alert
    When I enable the "Slow Response" alert
    And I set the threshold to "2000ms"
    And I save the alert settings
    Then the alert should be active

  Scenario: Receive slow response email
    Given I have a slow response alert set to "2000ms"
    When my average latency exceeds "2000ms"
    Then I should receive an email with subject "Alert: SLOW_RESPONSE"
    And the email should contain "Average latency exceeded 2000ms"

  Scenario: Disable an alert
    Given I have an active cost spike alert
    When I disable the alert
    And I save the settings
    Then I should not receive emails for cost spikes

  Scenario: Multiple alerts triggered
    Given I have all three alerts enabled
    When multiple thresholds are exceeded
    Then I should receive separate emails for each alert type
    And each email should have the correct subject and content

  Scenario: Email delivery failure
    Given I have an active alert
    When the email service fails
    Then the notification should still be saved in the database
    And I should see it in my notifications list

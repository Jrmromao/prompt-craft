Feature: Real-Time Savings Calculator
  As a user
  I want to see how much money I'm saving
  So that I can verify the value of the service

  Background:
    Given I am logged in as a user

  Scenario: Calculate baseline cost
    Given I requested "gpt-4" but was routed to "gpt-3.5-turbo"
    And the request used 1000 tokens
    When I calculate the baseline cost
    Then the baseline should be $0.045
    And the actual cost should be $0.001
    And the savings should be $0.044

  Scenario: Today's savings display
    Given I made 5 requests today
    And I saved $0.10 on each request
    When I view the dashboard
    Then I should see "Saved Today: $0.50"

  Scenario: Monthly savings breakdown
    Given I saved $50 from smart routing this month
    And I saved $30 from caching this month
    When I fetch monthly savings
    Then the total should be $80
    And the breakdown should show:
      | Type          | Amount |
      | Smart Routing | $50    |
      | Caching       | $30    |
      | Optimization  | $0     |

  Scenario: Savings rate calculation
    Given my baseline cost would be $500
    And my actual cost is $150
    When I calculate the savings rate
    Then the rate should be 70%

  Scenario: ROI calculation
    Given I saved $100 this month
    And my subscription costs $9
    When I calculate ROI
    Then the ROI should be 1011%
    And I should see "11x return"

  Scenario: Zero savings for new user
    Given I just signed up
    And I have made no requests
    When I view the dashboard
    Then I should see "Saved Today: $0.00"
    And I should see "This month: $0.00"

  Scenario: Daily savings chart
    Given I have savings data for the last 7 days:
      | Date       | Saved |
      | 2024-10-10 | $5    |
      | 2024-10-11 | $8    |
      | 2024-10-12 | $12   |
      | 2024-10-13 | $6    |
      | 2024-10-14 | $15   |
      | 2024-10-15 | $10   |
      | 2024-10-16 | $7    |
    When I fetch daily savings
    Then I should see 7 data points
    And the total should be $63

  Scenario: Savings without routing
    Given I made 10 requests with no smart routing
    And caching saved me $5
    When I view savings breakdown
    Then smart routing should show $0
    And caching should show $5
    And total should be $5

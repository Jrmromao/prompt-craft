Feature: On-Demand AI Optimization Agent

  As a user on a paid plan,
  I want to trigger an AI agent to analyze my past requests,
  So that I can receive actionable cost optimization suggestions.

  Scenario: User successfully triggers an optimization run and views the report
    Given I am a logged-in user on the 'Pro' plan
    And I am on the '/dashboard' page
    When I click the 'Find My Savings' button
    Then I should be redirected to the '/dashboard/optimizer/report/[id]' page
    And I should see a message indicating that my report is being generated
    And after a short period, I should see a list of optimization suggestions

  Scenario: A suggestion to downgrade a model is displayed
    Given my optimization report is complete
    When I view the report
    Then I should see a suggestion card with the title 'Downgrade Model'
    And the card should contain the text 'You can save an estimated $52/month by switching promptId: summarize-email from gpt-4-turbo to claude-3-haiku.'
    And the card should have an 'Apply This Change' button

  Scenario: A suggestion to optimize a prompt is displayed
    Given my optimization report is complete
    When I view the report
    Then I should see a suggestion card with the title 'Optimize Prompt'
    And the card should contain the text 'Your prompt generate-report can be made 45% shorter.'
    And the card should have a 'View/Copy New Prompt' button

  Scenario: Free user attempts to use the feature
    Given I am a logged-in user on the 'Free' plan
    And I am on the '/dashboard' page
    When I see the 'Find My Savings' button
    And I click it
    Then I should see a modal prompting me to upgrade to a paid plan

Feature: Automated Pricing System
  As a developer using the CostLens SDK
  I want the pricing system to automatically update and provide accurate cost estimates
  So that I can track and optimize my AI API costs

  Background:
    Given the pricing system is initialized

  Scenario: Update pricing data from all providers
    When I trigger a pricing scrape for all providers
    Then pricing data should be saved to the database

  Scenario: Retrieve current pricing information
    Given pricing data exists in the database
    When I request current pricing data
    Then I should receive all available pricing information

  Scenario: Find pricing for a specific model
    Given pricing data exists in the database
    When I search for pricing of "gpt-4"
    Then I should receive pricing information for that model

  Scenario: Clean up old pricing data
    Given there is old pricing data in the database
    When I clean up pricing data older than 30 days
    Then old pricing data should be removed

  Scenario: Handle network errors gracefully
    When the pricing scrape encounters a network error
    Then the system should handle the error gracefully

  Scenario: Validate pricing data integrity
    Given pricing data with invalid values
    When I attempt to save the invalid pricing data
    Then the system should handle the invalid data appropriately

  Scenario: Calculate accurate costs
    Given pricing data for "gpt-4" with input cost 30.0 and output cost 60.0
    When I calculate cost for 1000000 tokens using "gpt-4"
    Then the calculated cost should be 45.0

  Scenario: Handle concurrent pricing updates
    When multiple pricing updates are triggered simultaneously
    Then all updates should be processed successfully

  Scenario: API endpoint returns pricing data
    Given pricing data exists in the database
    When I make a GET request to "/api/pricing/scrape"
    Then I should receive a successful response with pricing data

  Scenario: API endpoint triggers pricing scrape
    When I make a POST request to "/api/pricing/scrape"
    Then the pricing scrape should be triggered
    And pricing data should be saved to the database

  Scenario: Handle specific provider scraping
    When I make a POST request to "/api/pricing/scrape" with provider "openai"
    Then only OpenAI pricing should be scraped
    And the data should be saved to the database

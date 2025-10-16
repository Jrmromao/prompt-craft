Feature: Redis Caching System
  As a user
  I want my API responses cached
  So that I save money on repeated requests

  Background:
    Given I am logged in as a user
    And Redis is configured

  Scenario: Cache miss on first request
    When I make an API request with model "gpt-3.5-turbo" and prompt "Hello"
    Then the cache should miss
    And the response should be fetched from OpenAI
    And the response should be saved to cache

  Scenario: Cache hit on repeated request
    Given I have made a request with model "gpt-3.5-turbo" and prompt "Hello"
    When I make the same request again
    Then the cache should hit
    And I should save the full API cost
    And no OpenAI API call should be made

  Scenario: Cache stats tracking
    Given I have made 10 requests with 8 cache hits
    When I fetch cache statistics
    Then I should see 8 hits
    And I should see 2 misses
    And the hit rate should be 80%
    And I should see total saved cost

  Scenario: Cache expiration
    Given I have a cached response with 1 second TTL
    When I wait 2 seconds
    And I make the same request
    Then the cache should miss
    And a new response should be fetched

  Scenario: Different prompts create different cache keys
    Given I have cached "What is 2+2?"
    When I request "What is 2 + 2?"
    Then the cache should miss
    And a new cache entry should be created

  Scenario: Cache disabled fallback
    Given Redis is not configured
    When I make an API request
    Then the request should succeed
    And no caching should occur
    And the response should come from OpenAI

  Scenario: Cache saves money
    Given I make a request that costs $0.05
    And the response is cached
    When I make the same request 10 times
    Then I should save $0.45
    And the cache stats should show $0.45 saved

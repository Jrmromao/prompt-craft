Feature: Stripe Payment Flows
  As a user
  I want to subscribe to a paid plan
  So that I can access premium features

  Background:
    Given I am logged in as a user
    And Stripe is configured correctly

  Scenario: Subscribe to Pro plan - New customer
    Given I am on the pricing page
    And I do not have a Stripe customer ID
    When I click "Start Free Trial" for the Pro plan
    Then a Stripe customer should be created
    And my user record should be updated with the customer ID
    And a checkout session should be created
    And I should be redirected to Stripe checkout
    And the session should include my email
    And the session should have metadata with userId and planId

  Scenario: Subscribe to Pro plan - Existing customer
    Given I have an existing Stripe customer ID
    When I click "Start Free Trial" for the Pro plan
    Then no new Stripe customer should be created
    And a checkout session should be created with my existing customer ID
    And I should be redirected to Stripe checkout

  Scenario: Successful payment webhook
    Given I have started a checkout session
    When Stripe sends a "checkout.session.completed" webhook
    Then the subscription should be created in the database
    And the subscription status should be "ACTIVE"
    And the user's plan should be updated to "PRO"
    And an audit log entry should be created

  Scenario: Subscription created webhook
    Given I have completed checkout
    When Stripe sends a "customer.subscription.created" webhook
    Then the subscription should be updated with the Stripe subscription ID
    And the current period dates should be set correctly
    And the subscription status should be "ACTIVE"

  Scenario: Subscription updated webhook
    Given I have an active subscription
    When Stripe sends a "customer.subscription.updated" webhook
    Then the subscription details should be updated in the database
    And the current period dates should be updated

  Scenario: Payment failed webhook
    Given I have an active subscription
    When Stripe sends a "invoice.payment_failed" webhook
    Then the subscription status should be updated to "PAST_DUE"
    And the user should receive an email notification
    And an audit log entry should be created

  Scenario: Subscription canceled webhook
    Given I have an active subscription
    When Stripe sends a "customer.subscription.deleted" webhook
    Then the subscription status should be updated to "CANCELED"
    And the user's plan should be downgraded to "FREE"
    And an audit log entry should be created

  Scenario: Cancel subscription at period end
    Given I have an active subscription
    When I click "Cancel Subscription" in settings
    Then a confirmation dialog should appear
    When I confirm the cancellation
    Then the subscription should be set to cancel at period end
    And I should see "Your subscription will end on [date]"
    And I should still have access until the period ends

  Scenario: Upgrade from Pro to Enterprise
    Given I have an active Pro subscription
    When I select the Enterprise plan
    Then my current subscription should be canceled at period end
    And a new checkout session should be created for Enterprise
    And I should be redirected to Stripe checkout

  Scenario: Webhook signature validation fails
    Given Stripe sends a webhook
    When the signature is invalid
    Then the webhook should be rejected with 400 status
    And no database changes should be made
    And an error should be logged

  Scenario: Idempotent webhook handling
    Given Stripe sends a "checkout.session.completed" webhook
    When the same webhook is sent again
    Then the subscription should not be duplicated
    And the response should still be successful

  Scenario: Handle deleted Stripe customer
    Given I have a Stripe customer ID in the database
    But the customer was deleted in Stripe
    When I try to subscribe to a plan
    Then a new Stripe customer should be created
    And my user record should be updated with the new customer ID
    And the checkout should proceed normally

  Scenario: Billing portal access
    Given I have an active subscription
    When I click "Manage Billing" in settings
    Then I should be redirected to Stripe billing portal
    And I should be able to update payment methods
    And I should be able to view invoices
    And I should be able to cancel my subscription

  Scenario: Promotion code applied
    Given I am on the Stripe checkout page
    When I enter a valid promotion code
    Then the discount should be applied
    And the final price should reflect the discount
    And the subscription should be created with the discount

  Scenario: Payment method update
    Given I have an active subscription
    When I update my payment method in Stripe portal
    And Stripe sends a "customer.updated" webhook
    Then the payment method should be updated in our system
    And an audit log entry should be created

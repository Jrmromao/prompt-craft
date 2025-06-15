export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ELITE = 'ELITE',
  ENTERPRISE = 'ENTERPRISE'
}

export enum Period {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum CreditType {
  INITIAL = 'INITIAL',
  SUBSCRIPTION = 'SUBSCRIPTION',
  USAGE = 'USAGE',
  TOP_UP = 'TOP_UP',
  REFUND = 'REFUND',
  MONTHLY_RESET = "MONTHLY_RESET",
  PURCHASE = "PURCHASE",
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  UNPAID = 'UNPAID',
  TRIALING = 'TRIALING',
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
}

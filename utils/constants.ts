export enum Role {
    FREE = 'FREE',
    LITE = 'LITE',
    PRO = 'PRO',
    ADMIN = 'ADMIN'
}

export enum PlanType {
    FREE = 'FREE',
    LITE = 'LITE',
    PRO = 'PRO'
}

export enum Period {
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

export enum CreditType {
    INITIAL = 'INITIAL',
    SUBSCRIPTION = 'SUBSCRIPTION',
    USAGE = 'USAGE',
    TOP_UP = 'TOP_UP',
    REFUND = 'REFUND'
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    PAST_DUE = 'PAST_DUE',
    CANCELED = 'CANCELED',
    UNPAID = 'UNPAID',
    TRIALING = 'TRIALING',
    INCOMPLETE = 'INCOMPLETE',
    INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED'
}
import { Prisma } from "@prisma/client";

export type User = Prisma.UserGetPayload<{}>;
export type Plan = Prisma.PlanGetPayload<{}>;
export type Prompt = Prisma.PromptGetPayload<{}>;
export type CreditHistory = Prisma.CreditHistoryGetPayload<{}>;
export type CreditType = "PURCHASE" | "MONTHLY_RENEWAL" | "USAGE" | "BONUS" | "REFUND";

export type UserWithPlan = User & {
  plan: Plan | null;
}; 
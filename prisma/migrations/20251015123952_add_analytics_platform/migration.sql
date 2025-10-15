-- DropIndex
DROP INDEX "public"."DataRetentionSchedule_userId_idx";

-- DropIndex
DROP INDEX "public"."Error_userId_idx";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "public"."PromptRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL,
    "latency" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptRun_userId_createdAt_idx" ON "public"."PromptRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PromptRun_promptId_idx" ON "public"."PromptRun"("promptId");

-- CreateIndex
CREATE INDEX "PromptRun_provider_idx" ON "public"."PromptRun"("provider");

-- CreateIndex
CREATE INDEX "PromptRun_model_idx" ON "public"."PromptRun"("model");

-- CreateIndex
CREATE INDEX "PromptRun_success_idx" ON "public"."PromptRun"("success");

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "public"."Alert"("userId");

-- CreateIndex
CREATE INDEX "Alert_enabled_idx" ON "public"."Alert"("enabled");

-- AddForeignKey
ALTER TABLE "public"."PromptRun" ADD CONSTRAINT "PromptRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

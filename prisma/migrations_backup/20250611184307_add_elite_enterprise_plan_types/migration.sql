/*
  Warnings:

  - The values [FREE,LITE] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlanType_new" AS ENUM ('PRO', 'ELITE', 'ENTERPRISE');
ALTER TABLE "User" ALTER COLUMN "planType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "planType" TYPE "PlanType_new" USING ("planType"::text::"PlanType_new");
ALTER TYPE "PlanType" RENAME TO "PlanType_old";
ALTER TYPE "PlanType_new" RENAME TO "PlanType";
DROP TYPE "PlanType_old";
ALTER TABLE "User" ALTER COLUMN "planType" SET DEFAULT 'PRO';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "planType" SET DEFAULT 'PRO';

-- CreateTable
CREATE TABLE "UsageMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageMetrics_userId_idx" ON "UsageMetrics"("userId");

-- CreateIndex
CREATE INDEX "UsageMetrics_type_idx" ON "UsageMetrics"("type");

-- CreateIndex
CREATE INDEX "UsageMetrics_createdAt_idx" ON "UsageMetrics"("createdAt");

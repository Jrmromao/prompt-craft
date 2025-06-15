/*
  Warnings:

  - You are about to drop the column `credits` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `customLimits` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxPrompts` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxTeamMembers` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `maxTokens` on the `Plan` table. All the data in the column will be lost.
  - The `period` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Plan_period_idx";

-- DropIndex
DROP INDEX "Plan_stripeProductId_key";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "credits",
DROP COLUMN "customLimits",
DROP COLUMN "maxPrompts",
DROP COLUMN "maxTeamMembers",
DROP COLUMN "maxTokens",
ALTER COLUMN "price" SET DEFAULT 0,
DROP COLUMN "period",
ADD COLUMN     "period" TEXT NOT NULL DEFAULT 'month',
ALTER COLUMN "stripeProductId" SET DEFAULT '',
ALTER COLUMN "stripePriceId" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "Plan_stripeProductId_idx" ON "Plan"("stripeProductId");

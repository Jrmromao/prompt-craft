/*
  Warnings:

  - The values [PURCHASE,MONTHLY_RENEWAL,BONUS] on the enum `CreditType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `monthlyCredits` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `stripeProductId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `lastPromptAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `User` table. All the data in the column will be lost.
  - Added the required column `creditCap` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credits` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'LITE', 'PRO');

-- CreateEnum
CREATE TYPE "Period" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterEnum
BEGIN;
CREATE TYPE "CreditType_new" AS ENUM ('INITIAL', 'SUBSCRIPTION', 'USAGE', 'TOP_UP', 'REFUND');
ALTER TABLE "CreditHistory" ALTER COLUMN "type" TYPE "CreditType_new" USING ("type"::text::"CreditType_new");
ALTER TYPE "CreditType" RENAME TO "CreditType_old";
ALTER TYPE "CreditType_new" RENAME TO "CreditType";
DROP TYPE "CreditType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('FREE', 'LITE', 'PRO');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'FREE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "PromptGeneration" DROP CONSTRAINT "PromptGeneration_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_planId_fkey";

-- DropIndex
DROP INDEX "Plan_stripePriceId_key";

-- DropIndex
DROP INDEX "Plan_stripeProductId_key";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "monthlyCredits",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeProductId",
ADD COLUMN     "creditCap" INTEGER NOT NULL,
ADD COLUMN     "credits" INTEGER NOT NULL,
ADD COLUMN     "period" "Period" NOT NULL,
ADD COLUMN     "type" "PlanType" NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "planId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastPromptAt",
DROP COLUMN "planId",
ADD COLUMN     "creditCap" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "lastCreditReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "credits" SET DEFAULT 10;

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptGeneration" ADD CONSTRAINT "PromptGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

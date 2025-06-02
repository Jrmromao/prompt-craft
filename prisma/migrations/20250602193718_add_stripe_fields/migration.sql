/*
  Warnings:

  - You are about to drop the column `creditCap` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeProductId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeProductId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "creditCap",
DROP COLUMN "features",
DROP COLUMN "type",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "stripeProductId" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "Plan"("stripeProductId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

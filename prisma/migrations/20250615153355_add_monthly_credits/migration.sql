/*
  Warnings:

  - You are about to drop the column `credits` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "credits",
ADD COLUMN     "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "purchasedCredits" INTEGER NOT NULL DEFAULT 0;

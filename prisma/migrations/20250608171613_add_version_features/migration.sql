/*
  Warnings:

  - You are about to drop the column `metadata` on the `PromptVersion` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PromptVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `PromptVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PromptVersion" DROP COLUMN "metadata",
ADD COLUMN     "commitMessage" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL;

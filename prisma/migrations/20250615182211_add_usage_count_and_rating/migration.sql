/*
  Warnings:

  - Made the column `description` on table `PromptTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PromptTemplate" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "complexity" DROP NOT NULL,
ALTER COLUMN "complexity" DROP DEFAULT,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

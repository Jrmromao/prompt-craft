/*
  Warnings:

  - Made the column `slug` on table `Prompt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Prompt" ALTER COLUMN "slug" SET NOT NULL;

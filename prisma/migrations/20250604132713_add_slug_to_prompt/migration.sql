/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_slug_key" ON "Prompt"("slug");

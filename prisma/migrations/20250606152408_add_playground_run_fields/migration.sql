/*
  Warnings:

  - Added the required column `prompt` to the `PlaygroundRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaygroundRun" ADD COLUMN     "prompt" TEXT NOT NULL,
ADD COLUMN     "result" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUCCESS';

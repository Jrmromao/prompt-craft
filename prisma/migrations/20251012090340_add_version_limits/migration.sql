-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "maxVersionsPerPrompt" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "versionsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PromptVersion" ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tags" TEXT[];

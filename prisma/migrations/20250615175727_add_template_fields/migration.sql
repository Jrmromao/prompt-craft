-- AlterTable
ALTER TABLE "PromptTemplate" ADD COLUMN     "bestPractices" TEXT[],
ADD COLUMN     "complexity" TEXT NOT NULL DEFAULT 'beginner',
ADD COLUMN     "example" TEXT,
ADD COLUMN     "successMetrics" JSONB,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'zero-shot';

-- CreateIndex
CREATE INDEX "PromptTemplate_type_idx" ON "PromptTemplate"("type");

-- CreateIndex
CREATE INDEX "PromptTemplate_complexity_idx" ON "PromptTemplate"("complexity");

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "changes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptBranch" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PromptBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromptVersion_promptId_idx" ON "PromptVersion"("promptId");

-- CreateIndex
CREATE INDEX "PromptVersion_createdBy_idx" ON "PromptVersion"("createdBy");

-- CreateIndex
CREATE INDEX "PromptVersion_version_idx" ON "PromptVersion"("version");

-- CreateIndex
CREATE INDEX "PromptBranch_promptId_idx" ON "PromptBranch"("promptId");

-- CreateIndex
CREATE INDEX "PromptBranch_createdBy_idx" ON "PromptBranch"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "PromptBranch_promptId_name_key" ON "PromptBranch"("promptId", "name");

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptBranch" ADD CONSTRAINT "PromptBranch_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptBranch" ADD CONSTRAINT "PromptBranch_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

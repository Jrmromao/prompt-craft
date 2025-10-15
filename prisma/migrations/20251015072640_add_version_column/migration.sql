-- AlterTable
ALTER TABLE "Version" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Version_promptId_version_key" ON "Version"("promptId", "version");

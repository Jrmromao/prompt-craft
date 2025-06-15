-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Comment_hidden_idx" ON "Comment"("hidden");

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT '@user' || floor(random() * 1000000)::text;

-- CreateIndex
CREATE INDEX "Prompt_isVerified_idx" ON "Prompt"("isVerified");

-- CreateIndex
CREATE INDEX "Prompt_isFeatured_idx" ON "Prompt"("isFeatured");

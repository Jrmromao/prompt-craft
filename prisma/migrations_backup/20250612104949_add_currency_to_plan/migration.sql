-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

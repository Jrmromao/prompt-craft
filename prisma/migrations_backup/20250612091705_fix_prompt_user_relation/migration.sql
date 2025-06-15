-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

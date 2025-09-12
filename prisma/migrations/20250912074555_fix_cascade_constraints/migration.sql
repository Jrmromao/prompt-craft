-- DropForeignKey
ALTER TABLE "public"."ApiUsage" DROP CONSTRAINT "ApiUsage_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ApiUsage" DROP CONSTRAINT "ApiUsage_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ApiUsage" ADD CONSTRAINT "ApiUsage_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "public"."Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiUsage" ADD CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

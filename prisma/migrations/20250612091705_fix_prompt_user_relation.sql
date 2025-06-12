-- Drop existing foreign key constraint
ALTER TABLE "Prompt" DROP CONSTRAINT IF EXISTS "Prompt_userId_fkey";

-- Update the foreign key to reference clerkId
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE; 
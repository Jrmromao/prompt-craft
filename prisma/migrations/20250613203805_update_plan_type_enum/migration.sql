-- First, create a new enum type with all values
CREATE TYPE "PlanType_new" AS ENUM ('FREE', 'PRO', 'ELITE', 'ENTERPRISE');

-- Remove the default value temporarily
ALTER TABLE "User" ALTER COLUMN "planType" DROP DEFAULT;

-- Update the column to use the new enum type
ALTER TABLE "User" 
  ALTER COLUMN "planType" TYPE "PlanType_new" 
  USING ("planType"::text::"PlanType_new");

-- Drop the old enum type
DROP TYPE "PlanType";

-- Rename the new enum type to the original name
ALTER TYPE "PlanType_new" RENAME TO "PlanType";

-- Add back the default value
ALTER TABLE "User" ALTER COLUMN "planType" SET DEFAULT 'FREE'::"PlanType";

-- CreateIndex
CREATE INDEX "User_planType_idx" ON "User"("planType");

-- First, add the new columns with default values
ALTER TABLE "Plan" ADD COLUMN "stripePriceId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Plan" ADD COLUMN "stripeAnnualPriceId" TEXT;

-- Remove the default values after the columns are added
ALTER TABLE "Plan" ALTER COLUMN "stripePriceId" DROP DEFAULT; 
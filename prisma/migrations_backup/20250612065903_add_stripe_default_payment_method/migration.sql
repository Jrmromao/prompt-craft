-- AlterTable
ALTER TABLE "EmailTemplate" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "stripeDefaultPaymentMethodId" TEXT;

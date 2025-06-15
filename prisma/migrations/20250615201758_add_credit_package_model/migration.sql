-- CreateTable
CREATE TABLE "CreditPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "bonusCredits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CreditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditPackage_stripePriceId_key" ON "CreditPackage"("stripePriceId");

-- CreateIndex
CREATE INDEX "CreditPackage_isActive_idx" ON "CreditPackage"("isActive");

-- CreateIndex
CREATE INDEX "CreditPackage_stripePriceId_idx" ON "CreditPackage"("stripePriceId");

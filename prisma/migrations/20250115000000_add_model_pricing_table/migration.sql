-- CreateTable
CREATE TABLE "ModelPricing" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "inputCost" DOUBLE PRECISION NOT NULL,
    "outputCost" DOUBLE PRECISION NOT NULL,
    "averageCost" DOUBLE PRECISION NOT NULL,
    "region" TEXT,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "cacheHitCost" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'scraper',
    "metadata" JSONB,

    CONSTRAINT "ModelPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelPricing_model_key" ON "ModelPricing"("model");

-- CreateIndex
CREATE INDEX "ModelPricing_provider_idx" ON "ModelPricing"("provider");

-- CreateIndex
CREATE INDEX "ModelPricing_model_idx" ON "ModelPricing"("model");

-- CreateIndex
CREATE INDEX "ModelPricing_isActive_idx" ON "ModelPricing"("isActive");

-- CreateIndex
CREATE INDEX "ModelPricing_lastUpdated_idx" ON "ModelPricing"("lastUpdated");

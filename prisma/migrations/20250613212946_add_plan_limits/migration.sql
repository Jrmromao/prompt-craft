-- CreateTable
CREATE TABLE "PlanLimits" (
    "id" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "feature" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'monthly',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanLimits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanLimits_planType_idx" ON "PlanLimits"("planType");

-- CreateIndex
CREATE INDEX "PlanLimits_feature_idx" ON "PlanLimits"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimits_planType_feature_key" ON "PlanLimits"("planType", "feature");

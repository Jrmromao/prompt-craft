-- CreateTable
CREATE TABLE "FeatureUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureUsage_userId_idx" ON "FeatureUsage"("userId");

-- CreateIndex
CREATE INDEX "FeatureUsage_feature_idx" ON "FeatureUsage"("feature");

-- AddForeignKey
ALTER TABLE "FeatureUsage" ADD CONSTRAINT "FeatureUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add onboarding tracking
CREATE TABLE IF NOT EXISTS "UserOnboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnboarding_pkey" PRIMARY KEY ("id")
);

-- Add web vitals tracking
CREATE TABLE IF NOT EXISTS "WebVital" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "rating" TEXT NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "metricId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebVital_pkey" PRIMARY KEY ("id")
);

-- Add user onboarding fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);

-- Create unique constraint for user onboarding steps
CREATE UNIQUE INDEX IF NOT EXISTS "UserOnboarding_userId_step_key" ON "UserOnboarding"("userId", "step");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "WebVital_userId_idx" ON "WebVital"("userId");
CREATE INDEX IF NOT EXISTS "WebVital_name_idx" ON "WebVital"("name");
CREATE INDEX IF NOT EXISTS "WebVital_timestamp_idx" ON "WebVital"("timestamp");
CREATE INDEX IF NOT EXISTS "WebVital_rating_idx" ON "WebVital"("rating");

-- Add foreign key constraints
ALTER TABLE "UserOnboarding" ADD CONSTRAINT "UserOnboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebVital" ADD CONSTRAINT "WebVital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

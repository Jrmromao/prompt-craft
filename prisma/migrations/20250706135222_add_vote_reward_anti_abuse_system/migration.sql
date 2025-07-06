-- CreateEnum
CREATE TYPE "VoteAbuseType" AS ENUM ('SOCKPUPPET_VOTING', 'VOTE_MANIPULATION', 'RAPID_VOTING', 'IP_CLUSTERING', 'DEVICE_FINGERPRINT_MATCH', 'TEMPORAL_PATTERN_ABUSE', 'COORDINATED_VOTING', 'SELF_VOTE_ATTEMPT', 'EXCESSIVE_VOTING_RATE', 'SUSPICIOUS_ACCOUNT_AGE');

-- CreateEnum
CREATE TYPE "VoteAbuseSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VoteAbuseStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'CONFIRMED', 'FALSE_POSITIVE', 'RESOLVED');

-- AlterEnum
ALTER TYPE "CreditType" ADD VALUE 'UPVOTE';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT '@user' || floor(random() * 1000000)::text;

-- CreateTable
CREATE TABLE "VoteReward" (
    "id" TEXT NOT NULL,
    "voteId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "promptAuthorId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "creditsAwarded" INTEGER NOT NULL,
    "voterPlanType" "PlanType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "VoteReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteAbuseDetection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "abuseType" "VoteAbuseType" NOT NULL,
    "severity" "VoteAbuseSeverity" NOT NULL,
    "details" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "status" "VoteAbuseStatus" NOT NULL DEFAULT 'PENDING',
    "investigatedBy" TEXT,
    "resolution" TEXT,

    CONSTRAINT "VoteAbuseDetection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotePattern" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "votesCount" INTEGER NOT NULL,
    "upvotesCount" INTEGER NOT NULL,
    "downvotesCount" INTEGER NOT NULL,
    "uniquePromptsVoted" INTEGER NOT NULL,
    "uniqueAuthorsVoted" INTEGER NOT NULL,
    "creditsEarned" INTEGER NOT NULL,
    "suspiciousPatterns" JSONB NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VotePattern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoteReward_voteId_key" ON "VoteReward"("voteId");

-- CreateIndex
CREATE INDEX "VoteReward_voterId_idx" ON "VoteReward"("voterId");

-- CreateIndex
CREATE INDEX "VoteReward_promptAuthorId_idx" ON "VoteReward"("promptAuthorId");

-- CreateIndex
CREATE INDEX "VoteReward_promptId_idx" ON "VoteReward"("promptId");

-- CreateIndex
CREATE INDEX "VoteReward_createdAt_idx" ON "VoteReward"("createdAt");

-- CreateIndex
CREATE INDEX "VoteReward_voterPlanType_idx" ON "VoteReward"("voterPlanType");

-- CreateIndex
CREATE INDEX "VoteReward_ipAddress_idx" ON "VoteReward"("ipAddress");

-- CreateIndex
CREATE INDEX "VoteAbuseDetection_userId_idx" ON "VoteAbuseDetection"("userId");

-- CreateIndex
CREATE INDEX "VoteAbuseDetection_abuseType_idx" ON "VoteAbuseDetection"("abuseType");

-- CreateIndex
CREATE INDEX "VoteAbuseDetection_severity_idx" ON "VoteAbuseDetection"("severity");

-- CreateIndex
CREATE INDEX "VoteAbuseDetection_status_idx" ON "VoteAbuseDetection"("status");

-- CreateIndex
CREATE INDEX "VoteAbuseDetection_detectedAt_idx" ON "VoteAbuseDetection"("detectedAt");

-- CreateIndex
CREATE INDEX "VoteAbuseDetection_investigatedBy_idx" ON "VoteAbuseDetection"("investigatedBy");

-- CreateIndex
CREATE INDEX "VotePattern_userId_idx" ON "VotePattern"("userId");

-- CreateIndex
CREATE INDEX "VotePattern_riskScore_idx" ON "VotePattern"("riskScore");

-- CreateIndex
CREATE INDEX "VotePattern_lastUpdated_idx" ON "VotePattern"("lastUpdated");

-- CreateIndex
CREATE INDEX "VotePattern_timeWindow_idx" ON "VotePattern"("timeWindow");

-- CreateIndex
CREATE UNIQUE INDEX "VotePattern_userId_timeWindow_key" ON "VotePattern"("userId", "timeWindow");

-- AddForeignKey
ALTER TABLE "VoteReward" ADD CONSTRAINT "VoteReward_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteReward" ADD CONSTRAINT "VoteReward_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteReward" ADD CONSTRAINT "VoteReward_promptAuthorId_fkey" FOREIGN KEY ("promptAuthorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteReward" ADD CONSTRAINT "VoteReward_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteAbuseDetection" ADD CONSTRAINT "VoteAbuseDetection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteAbuseDetection" ADD CONSTRAINT "VoteAbuseDetection_investigatedBy_fkey" FOREIGN KEY ("investigatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotePattern" ADD CONSTRAINT "VotePattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "public"."FeedbackType" AS ENUM ('BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL_FEEDBACK', 'COMPLAINT', 'COMPLIMENT', 'QUESTION', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "public"."FeedbackCategory" AS ENUM ('UI_UX', 'PERFORMANCE', 'BILLING', 'API', 'DOCUMENTATION', 'SECURITY', 'INTEGRATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FeedbackStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'DUPLICATE', 'WONT_FIX');

-- CreateEnum
CREATE TYPE "public"."FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "type" "public"."FeedbackType" NOT NULL,
    "category" "public"."FeedbackCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "url" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "status" "public"."FeedbackStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "response" TEXT,
    "responseAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "public"."Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_type_idx" ON "public"."Feedback"("type");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "public"."Feedback"("status");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "public"."Feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

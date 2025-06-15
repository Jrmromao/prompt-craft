-- CreateEnum
CREATE TYPE "EmailSignupStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "EmailSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "EmailSignupStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSignup_email_key" ON "EmailSignup"("email");

-- CreateIndex
CREATE INDEX "EmailSignup_email_idx" ON "EmailSignup"("email");

-- CreateIndex
CREATE INDEX "EmailSignup_status_idx" ON "EmailSignup"("status");

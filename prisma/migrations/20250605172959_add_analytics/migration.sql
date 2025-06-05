-- CreateTable
CREATE TABLE "PromptAnalytics" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptView" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptUsage" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptAnalytics_promptId_key" ON "PromptAnalytics"("promptId");

-- CreateIndex
CREATE INDEX "PromptAnalytics_promptId_idx" ON "PromptAnalytics"("promptId");

-- CreateIndex
CREATE INDEX "PromptView_promptId_idx" ON "PromptView"("promptId");

-- CreateIndex
CREATE INDEX "PromptView_userId_idx" ON "PromptView"("userId");

-- CreateIndex
CREATE INDEX "PromptView_createdAt_idx" ON "PromptView"("createdAt");

-- CreateIndex
CREATE INDEX "PromptUsage_promptId_idx" ON "PromptUsage"("promptId");

-- CreateIndex
CREATE INDEX "PromptUsage_userId_idx" ON "PromptUsage"("userId");

-- CreateIndex
CREATE INDEX "PromptUsage_createdAt_idx" ON "PromptUsage"("createdAt");

-- AddForeignKey
ALTER TABLE "PromptAnalytics" ADD CONSTRAINT "PromptAnalytics_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptView" ADD CONSTRAINT "PromptView_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptView" ADD CONSTRAINT "PromptView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptUsage" ADD CONSTRAINT "PromptUsage_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptUsage" ADD CONSTRAINT "PromptUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

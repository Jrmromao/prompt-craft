-- CreateTable
CREATE TABLE "PlaygroundRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaygroundRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaygroundRun_userId_idx" ON "PlaygroundRun"("userId");

-- CreateIndex
CREATE INDEX "PlaygroundRun_createdAt_idx" ON "PlaygroundRun"("createdAt");

-- AddForeignKey
ALTER TABLE "PlaygroundRun" ADD CONSTRAINT "PlaygroundRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

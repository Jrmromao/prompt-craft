-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT '@user' || floor(random() * 1000000)::text;

-- CreateTable
CREATE TABLE "DeletionAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedUser" (
    "id" TEXT NOT NULL,
    "originalUserId" TEXT NOT NULL,
    "originalEmail" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "deletionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retentionPeriod" INTEGER NOT NULL,
    "dataSnapshot" JSONB,

    CONSTRAINT "DeletedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeletionAuditLog_userId_idx" ON "DeletionAuditLog"("userId");

-- CreateIndex
CREATE INDEX "DeletionAuditLog_action_idx" ON "DeletionAuditLog"("action");

-- CreateIndex
CREATE INDEX "DeletionAuditLog_timestamp_idx" ON "DeletionAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "DeletedUser_originalUserId_idx" ON "DeletedUser"("originalUserId");

-- CreateIndex
CREATE INDEX "DeletedUser_deletionDate_idx" ON "DeletedUser"("deletionDate");

-- AddForeignKey
ALTER TABLE "DeletionAuditLog" ADD CONSTRAINT "DeletionAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

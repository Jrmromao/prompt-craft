-- CreateTable
CREATE TABLE "RoleChangeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldRole" "Role" NOT NULL,
    "newRole" "Role" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoleChangeLog_userId_idx" ON "RoleChangeLog"("userId");

-- CreateIndex
CREATE INDEX "RoleChangeLog_changedBy_idx" ON "RoleChangeLog"("changedBy");

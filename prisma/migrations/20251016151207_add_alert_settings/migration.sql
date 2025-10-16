-- CreateTable
CREATE TABLE "public"."AlertSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertSettings_userId_key" ON "public"."AlertSettings"("userId");

-- CreateIndex
CREATE INDEX "AlertSettings_userId_idx" ON "public"."AlertSettings"("userId");

-- AddForeignKey
ALTER TABLE "public"."AlertSettings" ADD CONSTRAINT "AlertSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailPreferences" JSONB DEFAULT '{"marketingEmails":true,"productUpdates":true,"securityAlerts":true}',
ADD COLUMN     "languagePreferences" JSONB DEFAULT '{"language":"en","dateFormat":"MM/DD/YYYY","timeFormat":"12h"}',
ADD COLUMN     "notificationSettings" JSONB DEFAULT '{"emailNotifications":true,"pushNotifications":true,"browserNotifications":true}',
ADD COLUMN     "securitySettings" JSONB DEFAULT '{"twoFactorEnabled":false,"sessionTimeout":30}',
ADD COLUMN     "themeSettings" JSONB DEFAULT '{"theme":"system","accentColor":"purple"}';

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

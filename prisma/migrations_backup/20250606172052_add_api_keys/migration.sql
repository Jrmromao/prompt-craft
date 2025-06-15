/*
  Warnings:

  - You are about to drop the column `key` on the `ApiKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashedKey]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashedKey` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastRotatedAt` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ApiKey_key_idx";

-- DropIndex
DROP INDEX "ApiKey_key_key";

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "key",
ADD COLUMN     "hashedKey" TEXT NOT NULL,
ADD COLUMN     "lastRotatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scopes" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");

-- CreateIndex
CREATE INDEX "ApiKey_hashedKey_idx" ON "ApiKey"("hashedKey");

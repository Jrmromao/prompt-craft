/*
  Warnings:

  - You are about to drop the column `dataDeletionRequest` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastDataAccess` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileUrl` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_isPublic_idx";

-- DropIndex
DROP INDEX "public"."User_profileUrl_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "dataDeletionRequest",
DROP COLUMN "isPublic",
DROP COLUMN "lastDataAccess",
DROP COLUMN "profileUrl";

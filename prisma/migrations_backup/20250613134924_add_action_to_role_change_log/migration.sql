/*
  Warnings:

  - Added the required column `action` to the `RoleChangeLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoleChangeLog" ADD COLUMN     "action" TEXT NOT NULL;

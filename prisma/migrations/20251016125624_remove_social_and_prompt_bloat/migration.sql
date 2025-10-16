/*
  Warnings:

  - You are about to drop the column `promptId` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `promptId` on the `PromptRun` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptCopy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptGeneration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromptUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Version` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoteAbuseDetection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VotePattern` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VoteReward` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ApiUsage" DROP CONSTRAINT "ApiUsage_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prompt" DROP CONSTRAINT "Prompt_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptCopy" DROP CONSTRAINT "PromptCopy_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptCopy" DROP CONSTRAINT "PromptCopy_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptGeneration" DROP CONSTRAINT "PromptGeneration_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptTemplate" DROP CONSTRAINT "PromptTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptUsage" DROP CONSTRAINT "PromptUsage_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptUsage" DROP CONSTRAINT "PromptUsage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Version" DROP CONSTRAINT "Version_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Version" DROP CONSTRAINT "Version_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoteAbuseDetection" DROP CONSTRAINT "VoteAbuseDetection_investigatedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoteAbuseDetection" DROP CONSTRAINT "VoteAbuseDetection_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VotePattern" DROP CONSTRAINT "VotePattern_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoteReward" DROP CONSTRAINT "VoteReward_promptAuthorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoteReward" DROP CONSTRAINT "VoteReward_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoteReward" DROP CONSTRAINT "VoteReward_voteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VoteReward" DROP CONSTRAINT "VoteReward_voterId_fkey";

-- DropIndex
DROP INDEX "public"."ApiUsage_promptId_idx";

-- DropIndex
DROP INDEX "public"."PromptRun_promptId_idx";

-- AlterTable
ALTER TABLE "public"."ApiUsage" DROP COLUMN "promptId";

-- AlterTable
ALTER TABLE "public"."PromptRun" DROP COLUMN "promptId";

-- DropTable
DROP TABLE "public"."Comment";

-- DropTable
DROP TABLE "public"."CommentLike";

-- DropTable
DROP TABLE "public"."Follow";

-- DropTable
DROP TABLE "public"."Prompt";

-- DropTable
DROP TABLE "public"."PromptCopy";

-- DropTable
DROP TABLE "public"."PromptGeneration";

-- DropTable
DROP TABLE "public"."PromptTemplate";

-- DropTable
DROP TABLE "public"."PromptUsage";

-- DropTable
DROP TABLE "public"."Version";

-- DropTable
DROP TABLE "public"."Vote";

-- DropTable
DROP TABLE "public"."VoteAbuseDetection";

-- DropTable
DROP TABLE "public"."VotePattern";

-- DropTable
DROP TABLE "public"."VoteReward";

-- DropEnum
DROP TYPE "public"."VoteAbuseSeverity";

-- DropEnum
DROP TYPE "public"."VoteAbuseStatus";

-- DropEnum
DROP TYPE "public"."VoteAbuseType";

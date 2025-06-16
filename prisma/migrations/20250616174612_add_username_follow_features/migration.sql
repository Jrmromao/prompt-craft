/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profileUrl]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "followerCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileUrl" TEXT,
ADD COLUMN     "username" TEXT NOT NULL DEFAULT '@user' || floor(random() * 1000000)::text;

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "Follow_createdAt_idx" ON "Follow"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "PromptFollow_userId_idx" ON "PromptFollow"("userId");

-- CreateIndex
CREATE INDEX "PromptFollow_promptId_idx" ON "PromptFollow"("promptId");

-- CreateIndex
CREATE INDEX "PromptFollow_createdAt_idx" ON "PromptFollow"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromptFollow_userId_promptId_key" ON "PromptFollow"("userId", "promptId");

-- CreateIndex
CREATE INDEX "PromptFavorite_userId_idx" ON "PromptFavorite"("userId");

-- CreateIndex
CREATE INDEX "PromptFavorite_promptId_idx" ON "PromptFavorite"("promptId");

-- CreateIndex
CREATE INDEX "PromptFavorite_createdAt_idx" ON "PromptFavorite"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromptFavorite_userId_promptId_key" ON "PromptFavorite"("userId", "promptId");

-- CreateIndex
CREATE INDEX "Prompt_followerCount_idx" ON "Prompt"("followerCount");

-- CreateIndex
CREATE INDEX "Prompt_favoriteCount_idx" ON "Prompt"("favoriteCount");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileUrl_key" ON "User"("profileUrl");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_profileUrl_idx" ON "User"("profileUrl");

-- CreateIndex
CREATE INDEX "User_isPublic_idx" ON "User"("isPublic");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFollow" ADD CONSTRAINT "PromptFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFollow" ADD CONSTRAINT "PromptFollow_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFavorite" ADD CONSTRAINT "PromptFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptFavorite" ADD CONSTRAINT "PromptFavorite_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

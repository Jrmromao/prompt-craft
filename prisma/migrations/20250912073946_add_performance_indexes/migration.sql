-- CreateIndex
CREATE INDEX "ActivityLog_userId_timestamp_idx" ON "public"."ActivityLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "ActivityLog_action_timestamp_idx" ON "public"."ActivityLog"("action", "timestamp");

-- CreateIndex
CREATE INDEX "Comment_userId_createdAt_idx" ON "public"."Comment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_promptId_createdAt_idx" ON "public"."Comment"("promptId", "createdAt");

-- CreateIndex
CREATE INDEX "Prompt_isPublic_isFeatured_idx" ON "public"."Prompt"("isPublic", "isFeatured");

-- CreateIndex
CREATE INDEX "Prompt_userId_createdAt_idx" ON "public"."Prompt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Prompt_isPublic_createdAt_idx" ON "public"."Prompt"("isPublic", "createdAt");

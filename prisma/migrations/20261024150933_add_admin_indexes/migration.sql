-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_lastSignedInAt_idx" ON "User"("lastSignedInAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

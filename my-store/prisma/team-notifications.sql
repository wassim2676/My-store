-- 👥 فرق العمل + 📝 طلبات الموافقة + 🔔 الإشعارات — نفّذه في Supabase قبل رفع الكود

CREATE TABLE IF NOT EXISTS "TeamMember" (
  "id" TEXT NOT NULL,
  "landingPageId" TEXT NOT NULL,
  "userId" TEXT,
  "email" VARCHAR(255) NOT NULL,
  "name" VARCHAR(80),
  "status" VARCHAR(12) NOT NULL DEFAULT 'pending',
  "requireApproval" BOOLEAN NOT NULL DEFAULT true,
  "inviteToken" VARCHAR(64),
  "inviteExpires" TIMESTAMP(3),
  "invitedById" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "lastActiveAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TeamMember_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_inviteToken_key" ON "TeamMember"("inviteToken");
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_landingPageId_email_key" ON "TeamMember"("landingPageId", "email");
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");

CREATE TABLE IF NOT EXISTS "ChangeRequest" (
  "id" TEXT NOT NULL,
  "landingPageId" TEXT NOT NULL,
  "memberId" TEXT,
  "authorId" TEXT NOT NULL,
  "authorName" VARCHAR(120) NOT NULL,
  "kind" VARCHAR(40) NOT NULL,
  "method" VARCHAR(8) NOT NULL,
  "path" VARCHAR(300) NOT NULL,
  "params" JSONB,
  "body" JSONB,
  "summary" VARCHAR(300) NOT NULL,
  "targetId" VARCHAR(40),
  "before" JSONB,
  "status" VARCHAR(12) NOT NULL DEFAULT 'pending',
  "reviewNote" VARCHAR(500),
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "error" VARCHAR(300),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChangeRequest_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChangeRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ChangeRequest_landingPageId_status_createdAt_idx" ON "ChangeRequest"("landingPageId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "ChangeRequest_authorId_createdAt_idx" ON "ChangeRequest"("authorId", "createdAt");

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" VARCHAR(40) NOT NULL,
  "data" JSONB,
  "link" VARCHAR(300),
  "dedupeKey" VARCHAR(120),
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

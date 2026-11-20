-- ============================================================
-- مقالات المسوّقين (مدونة صفحة الهبوط)
-- آمن لإعادة التشغيل — نفّذه في Supabase → SQL Editor قبل نشر التحديث
-- ============================================================
CREATE TABLE IF NOT EXISTS "Article" (
  "id" TEXT NOT NULL,
  "landingPageId" TEXT NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "title" VARCHAR(150) NOT NULL,
  "excerpt" VARCHAR(300),
  "content" TEXT NOT NULL,
  "coverImage" VARCHAR(1000),
  "category" VARCHAR(60),
  "status" VARCHAR(12) NOT NULL DEFAULT 'DRAFT',
  "seoTitle" VARCHAR(70),
  "seoDescription" VARCHAR(170),
  "views" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Article_landingPageId_slug_key" ON "Article"("landingPageId", "slug");
CREATE INDEX IF NOT EXISTS "Article_landingPageId_status_publishedAt_idx" ON "Article"("landingPageId", "status", "publishedAt");

DO $$ BEGIN
  ALTER TABLE "Article" ADD CONSTRAINT "Article_landingPageId_fkey"
    FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

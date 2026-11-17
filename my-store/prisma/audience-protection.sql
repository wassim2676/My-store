-- ============================================================
-- الجمهور وحماية روابط الأفلييت (استهداف الدول + حجب الروبوتات)
-- آمن لإعادة التشغيل — نفّذه في Supabase → SQL Editor قبل نشر التحديث
-- ============================================================
ALTER TABLE "LandingPage" ADD COLUMN IF NOT EXISTS "audience" JSONB;
ALTER TABLE "LandingPageDailyStat" ADD COLUMN IF NOT EXISTS "botHits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LandingPageDailyStat" ADD COLUMN IF NOT EXISTS "geoBlocked" INTEGER NOT NULL DEFAULT 0;

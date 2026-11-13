-- ============================================================
-- رفع الصور (جدول Media) + شعار المتجر الحر في العروض
-- آمن لإعادة التشغيل — نفّذه في Supabase → SQL Editor قبل نشر التحديث
-- ============================================================
CREATE TABLE IF NOT EXISTS "Media" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mime" VARCHAR(60) NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Media_userId_idx" ON "Media"("userId");
DO $$ BEGIN
  ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Offer" ADD COLUMN IF NOT EXISTS "storeLogo" VARCHAR(500);

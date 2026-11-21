-- 📣 المرحلة الأولى لتحسين الانتشار — نفّذه في Supabase قبل رفع الكود
ALTER TABLE "LandingPage" ADD COLUMN IF NOT EXISTS "integrations" JSONB;

CREATE TABLE IF NOT EXISTS "LandingPageSourceStat" (
  "id" TEXT NOT NULL,
  "landingPageId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "source" VARCHAR(20) NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "LandingPageSourceStat_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LandingPageSourceStat_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "LandingPageSourceStat_landingPageId_date_source_key" ON "LandingPageSourceStat"("landingPageId", "date", "source");

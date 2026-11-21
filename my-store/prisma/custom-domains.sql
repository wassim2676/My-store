-- 🌐 دومين خاص لكل صفحة مسوّق — نفّذه في Supabase قبل رفع الكود
ALTER TABLE "LandingPage" ADD COLUMN IF NOT EXISTS "customDomain" VARCHAR(253);
ALTER TABLE "LandingPage" ADD COLUMN IF NOT EXISTS "customDomainVerifiedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "LandingPage_customDomain_key" ON "LandingPage"("customDomain");

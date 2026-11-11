-- ============================================================
-- منصة المسوّقين بالعمولة — تحديث قاعدة البيانات (إضافات فقط، لا يحذف أي بيانات)
-- الطريقة المفضّلة:  npx prisma db push
-- البديل اليدوي: Supabase Dashboard → SQL Editor → الصق هذا الملف → Run (مرة واحدة)
-- مولَّد من: prisma migrate diff
-- ============================================================

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MARKETER';

-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" VARCHAR(40) NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "tagline" VARCHAR(160),
    "bio" TEXT,
    "avatarUrl" VARCHAR(1000),
    "coverUrl" VARCHAR(1000),
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "theme" VARCHAR(20) NOT NULL DEFAULT 'midnight',
    "accentColor" VARCHAR(20) NOT NULL DEFAULT '#C8A24A',
    "socialLinks" JSONB,
    "showDisclosure" BOOLEAN NOT NULL DEFAULT true,
    "disclosure" TEXT,
    "seoTitle" VARCHAR(70),
    "seoDescription" VARCHAR(170),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "brandId" TEXT,
    "storeName" VARCHAR(80),
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "subtitle" VARCHAR(200),
    "shortReview" VARCHAR(700) NOT NULL,
    "review" TEXT,
    "pros" TEXT[],
    "cons" TEXT[],
    "highlights" TEXT[],
    "specs" JSONB,
    "verdict" VARCHAR(400),
    "images" TEXT[],
    "videoUrl" VARCHAR(1000),
    "affiliateUrl" TEXT NOT NULL,
    "buttonLabel" VARCHAR(60),
    "couponCode" VARCHAR(60),
    "price" DECIMAL(10,2),
    "compareAt" DECIMAL(10,2),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "dealEndsAt" TIMESTAMP(3),
    "rating" DOUBLE PRECISION,
    "category" VARCHAR(80),
    "badge" VARCHAR(40),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "OfferStatus" NOT NULL DEFAULT 'PUBLISHED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPageDailyStat" (
    "id" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LandingPageDailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_userId_key" ON "LandingPage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");

-- CreateIndex
CREATE INDEX "LandingPage_slug_idx" ON "LandingPage"("slug");

-- CreateIndex
CREATE INDEX "Offer_landingPageId_status_position_idx" ON "Offer"("landingPageId", "status", "position");

-- CreateIndex
CREATE INDEX "Offer_brandId_idx" ON "Offer"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_landingPageId_slug_key" ON "Offer"("landingPageId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPageDailyStat_landingPageId_date_key" ON "LandingPageDailyStat"("landingPageId", "date");

-- AddForeignKey
ALTER TABLE "LandingPage" ADD CONSTRAINT "LandingPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPageDailyStat" ADD CONSTRAINT "LandingPageDailyStat_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ============================================================
-- المنصات الافتراضية (بدون شعارات — أضف شعار SVG أو رابطه لكل منصة من /admin/brands)
-- ============================================================
INSERT INTO "Brand" ("id", "name", "slug", "accentColor", "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Amazon',      'amazon',      '#FF9900', true, now(), now()),
  (gen_random_uuid()::text, 'Walmart',     'walmart',     '#0071CE', true, now(), now()),
  (gen_random_uuid()::text, 'Target',      'target',      '#CC0000', true, now(), now()),
  (gen_random_uuid()::text, 'eBay',        'ebay',        '#3665F3', true, now(), now()),
  (gen_random_uuid()::text, 'Best Buy',    'best-buy',    '#0046BE', true, now(), now()),
  (gen_random_uuid()::text, 'AliExpress',  'aliexpress',  '#E43225', true, now(), now()),
  (gen_random_uuid()::text, 'Etsy',        'etsy',        '#F1641E', true, now(), now()),
  (gen_random_uuid()::text, 'Home Depot',  'home-depot',  '#F96302', true, now(), now()),
  (gen_random_uuid()::text, 'Temu',        'temu',        '#FB7701', true, now(), now()),
  (gen_random_uuid()::text, 'Sephora',     'sephora',     '#111111', true, now(), now())
ON CONFLICT DO NOTHING;

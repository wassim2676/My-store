-- ============================================================
-- سكريبت مزامنة قاعدة البيانات يدوياً (بديل عن prisma db push)
-- استخدمه فقط إذا فشل أمر `npx prisma db push` عندك
-- طريقة الاستخدام: Supabase Dashboard → SQL Editor → الصق هذا كاملاً → Run
-- آمن للتنفيذ عدة مرات (كل الأوامر IF NOT EXISTS)
-- ============================================================

-- 1) إضافة دور "بائع" لتعداد الأدوار
DO $$ BEGIN
  ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SELLER';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) إنشاء تعداد حالة المتجر
DO $$ BEGIN
  CREATE TYPE "VendorStatus" AS ENUM ('PENDING','APPROVED','SUSPENDED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) إنشاء تعداد حالة نشر المقال
DO $$ BEGIN
  CREATE TYPE "PostStatus" AS ENUM ('DRAFT','PUBLISHED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) جدول المتاجر (Vendor)
CREATE TABLE IF NOT EXISTS "Vendor" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "storeName" VARCHAR(150) NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "logo" TEXT,
  "banner" TEXT,
  "description" TEXT,
  "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
  "rejectionReason" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#FF9900',
  "secondaryColor" TEXT NOT NULL DEFAULT '#131921',
  "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
  "textColor" TEXT NOT NULL DEFAULT '#0F1111',
  "bannerTitle" VARCHAR(150),
  "bannerSubtitle" VARCHAR(255),
  "phone" TEXT,
  "contactEmail" TEXT,
  "address" TEXT,
  "city" TEXT,
  "country" TEXT DEFAULT 'Morocco',
  "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "rating" DOUBLE PRECISION DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "totalSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "totalOrders" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "Vendor_status_idx" ON "Vendor"("status");
CREATE INDEX IF NOT EXISTS "Vendor_slug_idx" ON "Vendor"("slug");
CREATE INDEX IF NOT EXISTS "Vendor_userId_idx" ON "Vendor"("userId");

-- 5) جدول المقالات (Post)
CREATE TABLE IF NOT EXISTS "Post" (
  "id" TEXT PRIMARY KEY,
  "title" VARCHAR(200) NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "excerpt" VARCHAR(300),
  "content" TEXT NOT NULL,
  "coverImage" TEXT,
  "category" VARCHAR(100),
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
  "authorName" TEXT NOT NULL DEFAULT 'فريق المتجر',
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publishedAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "Post_status_idx" ON "Post"("status");
CREATE INDEX IF NOT EXISTS "Post_slug_idx" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_category_idx" ON "Post"("category");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt");

-- 6) ربط المنتج بالبائع
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "vendorId" TEXT REFERENCES "Vendor"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "Product_vendorId_idx" ON "Product"("vendorId");

-- 7) ربط عنصر الطلب بالبائع
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "vendorId" TEXT REFERENCES "Vendor"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "OrderItem_vendorId_idx" ON "OrderItem"("vendorId");

-- ============================================================
-- تم! بعد تنفيذ هذا، شغّل `npx prisma generate` عندك محلياً
-- ثم أعد تشغيل السيرفر (npm run dev)
-- ============================================================

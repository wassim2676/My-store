import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * connection_limit=1 يجعل كل استعلامات Promise.all تمر واحداً تلو الآخر على اتصال وحيد،
 * فتصبح لوحتا التحكم أبطأ بـ 3 مرات تقريباً (قيس: 3.2 ث مقابل 1.05 ث).
 * نرفعه إلى 5 (أو قيمة PRISMA_CONNECTION_LIMIT) — Supabase pooler (وضع transaction) يتحمّل ذلك بسهولة.
 */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  const limit = process.env.PRISMA_CONNECTION_LIMIT || "5";
  if (/[?&]connection_limit=1(?!\d)/.test(url)) return url.replace(/connection_limit=1(?!\d)/, `connection_limit=${limit}`);
  return url;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: datasourceUrl() });

// إعادة استخدام نفس العميل داخل نفس الـ instance (التطوير وإعادة التحميل السريع)
globalForPrisma.prisma = prisma;

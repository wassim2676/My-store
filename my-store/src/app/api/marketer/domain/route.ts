import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { normalizeDomainInput } from "@/lib/domains";
import { forgetDomain } from "@/lib/domain-lookup";
import { addDomain, domainStatus, domainsEnabled, removeDomain, type DomainStatus } from "@/lib/vercel-domains";

// ==================== 🌐 /api/marketer/domain: ربط دومين خاص بصفحة المسوّق ====================
// GET: الحالة الحالية (ويحدّث customDomainVerifiedAt) · POST { domain }: ربط · DELETE: فصل
// الأخطاء رموز تترجمها الواجهة.
const fail = (error: string, status = 400) => NextResponse.json({ success: false, error }, { status });

async function context() {
  const ctx = await getMarketerSession();
  if (!ctx) return { error: fail("unauthorized", 401) };
  if (!ctx.landingPage) return { error: fail("no_page", 404) };
  if (!domainsEnabled()) return { error: fail("not_enabled", 503) };
  return { page: ctx.landingPage };
}

function refresh(slug: string) {
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/${slug}`, "layout");
}

/** يزامن حالة التحقق في القاعدة مع ما يقوله Vercel */
async function sync(page: { id: string; slug: string; customDomainVerifiedAt: Date | null }, status: DomainStatus) {
  const active = status.state === "active";
  if (active !== !!page.customDomainVerifiedAt) {
    await prisma.landingPage.update({ where: { id: page.id }, data: { customDomainVerifiedAt: active ? new Date() : null } });
    refresh(page.slug);
  }
}

export async function GET() {
  const c = await context();
  if (c.error) return c.error;
  const { page } = c;
  if (!page.customDomain) return NextResponse.json({ success: true, data: null });

  try {
    let status = await domainStatus(page.customDomain);
    if (status.state === "missing") {
      // حُذف من Vercel يدوياً: نعيد إضافته
      const added = await addDomain(page.customDomain);
      if (added.ok) status = await domainStatus(page.customDomain);
    }
    await sync(page, status);
    return NextResponse.json({ success: true, data: status });
  } catch {
    return fail("provider_error", 502);
  }
}

export async function POST(request: NextRequest) {
  const c = await context();
  if (c.error) return c.error;
  const { page } = c;

  const body = await request.json().catch(() => ({}));
  const domain = normalizeDomainInput((body as { domain?: unknown }).domain);
  if (!domain) return fail("invalid_domain");
  if (page.customDomain === domain) return fail("same_domain");

  const owner = await prisma.landingPage.findUnique({ where: { customDomain: domain }, select: { id: true } });
  if (owner && owner.id !== page.id) return fail("taken", 409);

  const added = await addDomain(domain);
  if (!added.ok) return fail(added.error, added.error === "provider_error" ? 502 : 409);

  try {
    await prisma.landingPage.update({ where: { id: page.id }, data: { customDomain: domain, customDomainVerifiedAt: null } });
  } catch (err) {
    await removeDomain(domain).catch(() => null);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return fail("taken", 409);
    throw err;
  }

  // استبدال دومين سابق: نفصله من Vercel
  if (page.customDomain) {
    await removeDomain(page.customDomain).catch(() => null);
    forgetDomain(page.customDomain);
  }
  forgetDomain(domain);
  refresh(page.slug);

  try {
    const status = await domainStatus(domain);
    await sync({ ...page, customDomainVerifiedAt: null }, status);
    return NextResponse.json({ success: true, data: status });
  } catch {
    return NextResponse.json({ success: true, data: { domain, state: "dns", records: [] } satisfies DomainStatus });
  }
}

export async function DELETE() {
  const c = await context();
  if (c.error) return c.error;
  const { page } = c;
  if (!page.customDomain) return NextResponse.json({ success: true, data: null });

  const removed = await removeDomain(page.customDomain).catch(() => false);
  if (!removed) return fail("provider_error", 502);
  await prisma.landingPage.update({ where: { id: page.id }, data: { customDomain: null, customDomainVerifiedAt: null } });
  forgetDomain(page.customDomain);
  refresh(page.slug);
  return NextResponse.json({ success: true, data: null });
}

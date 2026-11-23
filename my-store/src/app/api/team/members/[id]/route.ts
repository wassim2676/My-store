import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { inviteUrl, INVITE_DAYS, newInviteToken, ownerOnly } from "@/lib/team";
import { notify } from "@/lib/notifications";
import { sendEmail } from "@/lib/email/send";
import { teamInviteEmail } from "@/lib/email/templates";

// ==================== 👤 PATCH/DELETE /api/team/members/{id}: إدارة عضو (صاحب الصفحة فقط) ====================
type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({
  requireApproval: z.boolean().optional(),
  status: z.enum(["active", "suspended"]).optional(),
  resend: z.literal(true).optional(),
  name: z.string().trim().max(80).optional(),
});

async function load(id: string) {
  const ctx = await getMarketerSession();
  if (!ctx?.landingPage) return { error: NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 }) };
  if (!ctx.isOwner) return { error: ownerOnly() };
  const member = await prisma.teamMember.findFirst({ where: { id, landingPageId: ctx.landingPage.id } });
  if (!member) return { error: NextResponse.json({ success: false, error: "not_found" }, { status: 404 }) };
  return { ctx, member };
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await load(id);
  if (r.error) return r.error;
  const { ctx, member } = r;

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: "invalid" }, { status: 400 });
  const d = parsed.data;

  if (d.resend) {
    if (member.status !== "pending") return NextResponse.json({ success: false, error: "not_pending" }, { status: 400 });
    const token = newInviteToken();
    await prisma.teamMember.update({ where: { id }, data: { inviteToken: token.hash, inviteExpires: token.expires } });
    const page = ctx.landingPage!;
    const inviter = [ctx.session.user.firstName, ctx.session.user.lastName].filter(Boolean).join(" ") || page.title;
    const sent = await sendEmail({
      to: member.email,
      tag: "team-invite",
      ...teamInviteEmail({ inviter, pageTitle: page.title, url: inviteUrl(token.raw), days: INVITE_DAYS, approval: member.requireApproval }),
    });
    return NextResponse.json({ success: true, data: { emailSent: sent } });
  }

  if (d.status && member.status === "pending") return NextResponse.json({ success: false, error: "not_joined" }, { status: 400 });
  const updated = await prisma.teamMember.update({
    where: { id },
    data: { requireApproval: d.requireApproval, status: d.status, name: d.name },
  });
  return NextResponse.json({ success: true, data: { id: updated.id, status: updated.status, requireApproval: updated.requireApproval } });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const r = await load(id);
  if (r.error) return r.error;
  const { ctx, member } = r;
  await prisma.$transaction([
    prisma.changeRequest.updateMany({ where: { memberId: id, status: "pending" }, data: { status: "cancelled" } }),
    prisma.teamMember.delete({ where: { id } }),
  ]);
  if (member.userId) await notify(member.userId, { type: "team.removed", data: { page: ctx.landingPage!.title } });
  return NextResponse.json({ success: true });
}

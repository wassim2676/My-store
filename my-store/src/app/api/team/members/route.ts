import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { inviteUrl, MAX_MEMBERS, INVITE_DAYS, newInviteToken, ownerOnly } from "@/lib/team";
import { sendEmail } from "@/lib/email/send";
import { teamInviteEmail } from "@/lib/email/templates";

// ==================== 👥 POST /api/team/members: دعوة عضو بالإيميل (صاحب الصفحة فقط) ====================
const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  name: z.string().trim().max(80).optional().nullable(),
  requireApproval: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const ctx = await getMarketerSession();
  if (!ctx?.landingPage) return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  if (!ctx.isOwner) return ownerOnly();

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ success: false, error: "invalid_email" }, { status: 400 });
  const { email, name, requireApproval } = parsed.data;
  const page = ctx.landingPage;

  if (email === ctx.session.user.email?.toLowerCase()) return NextResponse.json({ success: false, error: "self" }, { status: 400 });

  const existing = await prisma.teamMember.findUnique({ where: { landingPageId_email: { landingPageId: page.id, email } } });
  if (existing && existing.status !== "pending") return NextResponse.json({ success: false, error: "already_member" }, { status: 409 });
  if (!existing) {
    const count = await prisma.teamMember.count({ where: { landingPageId: page.id } });
    if (count >= MAX_MEMBERS) return NextResponse.json({ success: false, error: "limit" }, { status: 400 });
  }

  const token = newInviteToken();
  const member = existing
    ? await prisma.teamMember.update({
        where: { id: existing.id },
        data: { inviteToken: token.hash, inviteExpires: token.expires, name: name || existing.name, requireApproval },
      })
    : await prisma.teamMember.create({
        data: { landingPageId: page.id, email, name: name || null, requireApproval, invitedById: ctx.userId, inviteToken: token.hash, inviteExpires: token.expires },
      });

  const inviter = [ctx.session.user.firstName, ctx.session.user.lastName].filter(Boolean).join(" ") || page.title;
  const sent = await sendEmail({
    to: email,
    tag: "team-invite",
    ...teamInviteEmail({ inviter, pageTitle: page.title, url: inviteUrl(token.raw), days: INVITE_DAYS, approval: requireApproval }),
  });

  return NextResponse.json({ success: true, data: { id: member.id, emailSent: sent } }, { status: existing ? 200 : 201 });
}

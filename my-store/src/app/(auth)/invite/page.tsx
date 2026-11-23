import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hashToken } from "@/lib/team";
import InviteAccept, { type InviteState } from "@/components/auth/InviteAccept";

export const metadata: Metadata = { title: "Team invitation", robots: { index: false, follow: false } };

// ==================== ✉️ /invite?token=…: قبول دعوة فريق ====================
export default async function InvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;

  let state: InviteState = { kind: "invalid" };
  if (token.length >= 20 && token.length <= 100) {
    const member = await prisma.teamMember.findUnique({
      where: { inviteToken: hashToken(token) },
      include: { landingPage: { select: { title: true, user: { select: { firstName: true, lastName: true } } } } },
    });
    if (member && member.status === "pending") {
      const info = {
        email: member.email,
        page: member.landingPage.title,
        inviter: [member.landingPage.user.firstName, member.landingPage.user.lastName].filter(Boolean).join(" ") || member.landingPage.title,
        approval: member.requireApproval,
      };
      if (!member.inviteExpires || member.inviteExpires < new Date()) state = { kind: "expired", ...info };
      else {
        const [existing, session] = await Promise.all([prisma.user.findUnique({ where: { email: member.email }, select: { id: true } }), auth()]);
        if (!existing) state = { kind: "signup", ...info };
        else if (!session?.user?.id) state = { kind: "login", ...info };
        else if (session.user.id !== existing.id) state = { kind: "wrong", ...info, current: session.user.email ?? "" };
        else state = { kind: "accept", ...info };
      }
    }
  }

  return <InviteAccept token={token} state={state} />;
}

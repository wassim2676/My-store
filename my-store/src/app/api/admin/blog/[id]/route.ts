import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

async function assertAdmin() {
  const session = await getAuthSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) return null;
  return session;
}

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertAdmin();
  if (!session) return errorResponse("غير مصرح", 401);
  const { id } = await params;

  const body = await request.json();
  const validated = updateSchema.safeParse(body);
  if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return errorResponse("المقال غير موجود", 404);

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...validated.data,
      publishedAt:
        validated.data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined,
    },
  });

  return successResponse(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertAdmin();
  if (!session) return errorResponse("غير مصرح", 401);
  const { id } = await params;

  await prisma.post.delete({ where: { id } });
  return successResponse({ deleted: true });
}

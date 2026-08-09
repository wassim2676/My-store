import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthSession } from "@/lib/api-utils";

function slugify(input: string): string {
  const base = input.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  return base || `post-${Date.now()}`;
}

async function assertAdmin() {
  const session = await getAuthSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) return null;
  return session;
}

export async function GET() {
  const session = await assertAdmin();
  if (!session) return errorResponse("غير مصرح", 401);
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return successResponse(posts);
}

const postSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(10),
  coverImage: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export async function POST(request: NextRequest) {
  const session = await assertAdmin();
  if (!session) return errorResponse("غير مصرح", 401);

  const body = await request.json();
  const validated = postSchema.safeParse(body);
  if (!validated.success) return errorResponse(validated.error.issues[0].message, 400);

  let slug = slugify(validated.data.title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const post = await prisma.post.create({
    data: {
      ...validated.data,
      slug,
      publishedAt: validated.data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  return successResponse(post, 201);
}

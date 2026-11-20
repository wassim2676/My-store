import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { serializeArticle } from "@/lib/articles-server";
import ArticleForm from "@/components/dashboard/ArticleForm";
import { editorData } from "../editor-data";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getMarketerSession();
  const landingPage = ctx!.landingPage!;
  const article = await prisma.article.findFirst({ where: { id, landingPageId: landingPage.id } });
  if (!article) notFound();
  const { page, offers } = await editorData(landingPage);
  return <ArticleForm article={serializeArticle(article)} page={page} offers={offers} />;
}

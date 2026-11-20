import { prisma } from "@/lib/prisma";
import { getMarketerSession } from "@/lib/marketer";
import { serializeArticle } from "@/lib/articles-server";
import ArticlesManager from "@/components/dashboard/ArticlesManager";

export default async function ArticlesPage() {
  const ctx = await getMarketerSession();
  const page = ctx!.landingPage!;
  const articles = await prisma.article.findMany({ where: { landingPageId: page.id }, orderBy: { updatedAt: "desc" } });
  return <ArticlesManager initial={articles.map(serializeArticle)} pageSlug={page.slug} />;
}

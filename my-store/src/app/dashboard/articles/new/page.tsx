import { getMarketerSession } from "@/lib/marketer";
import ArticleForm from "@/components/dashboard/ArticleForm";
import { editorData } from "../editor-data";

export default async function NewArticlePage() {
  const ctx = await getMarketerSession();
  const { page, offers } = await editorData(ctx!.landingPage!);
  return <ArticleForm page={page} offers={offers} />;
}

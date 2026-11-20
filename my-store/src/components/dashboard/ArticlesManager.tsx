"use client";

/* eslint-disable @next/next/no-img-element -- صور المقالات من الرفع الداخلي أو روابط خارجية */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Clock, ExternalLink, Eye, FileText, Loader2, Newspaper, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import type { SerializedArticle } from "@/lib/articles-server";

type Filter = "all" | "PUBLISHED" | "DRAFT";

// ==================== 📰 قائمة مقالات المسوّق ====================
export default function ArticlesManager({ initial, pageSlug }: { initial: SerializedArticle[]; pageSlug: string }) {
  const t = useTranslations("dash.articles");
  const locale = useLocale();
  const router = useRouter();
  const [articles, setArticles] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const counts = {
    all: articles.length,
    PUBLISHED: articles.filter((a) => a.status === "PUBLISHED").length,
    DRAFT: articles.filter((a) => a.status === "DRAFT").length,
  };
  const q = query.trim().toLowerCase();
  const list = articles.filter((a) => (filter === "all" || a.status === filter) && (!q || a.title.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q)));
  const fmt = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));

  const toggle = async (a: SerializedArticle) => {
    const status = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusy(a.id);
    setError("");
    setArticles((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x))); // تحديث متفائل
    try {
      const res = await fetch(`/api/marketer/articles/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      setArticles((list) => list.map((x) => (x.id === a.id ? a : x)));
      setError(t("errors.generic"));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (a: SerializedArticle) => {
    if (!confirm(t("confirmDelete", { title: a.title }))) return;
    setBusy(a.id);
    setError("");
    try {
      const res = await fetch(`/api/marketer/articles/${a.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setArticles((list) => list.filter((x) => x.id !== a.id));
      startTransition(() => router.refresh());
    } catch {
      setError(t("errors.generic"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-white/55">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          {counts.PUBLISHED > 0 && (
            <a href={`/${pageSlug}/articles`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5">
              <ExternalLink className="h-4 w-4" />
              {t("viewBlog")}
            </a>
          )}
          <Link href="/dashboard/articles/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">
            <PlusCircle className="h-4 w-4" />
            {t("new")}
          </Link>
        </div>
      </div>

      {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-20 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] text-amber-300">
            <Newspaper className="h-6 w-6" />
          </span>
          <h2 className="mt-5 font-semibold">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-white/50">{t("emptyHint")}</p>
          <Link href="/dashboard/articles/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300">
            <PlusCircle className="h-4 w-4" />
            {t("first")}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 p-1">
              {(["all", "PUBLISHED", "DRAFT"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm transition cursor-pointer ${filter === k ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
                >
                  {k === "all" ? t("filterAll") : t(`status.${k}`)} <span className="text-white/35">{counts[k]}</span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 sm:w-72">
              <Search className="h-4 w-4 text-white/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} className="h-10 min-w-0 flex-1 bg-transparent text-sm focus:outline-none" />
            </label>
          </div>

          <ul className="space-y-3">
            {list.map((a) => (
              <li key={a.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4">
                <Link href={`/dashboard/articles/${a.id}`} className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white/[0.04] sm:h-20 sm:w-32">
                  {a.coverImage ? (
                    <img src={a.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-white/25"><FileText className="h-6 w-6" /></span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/articles/${a.id}`} className="truncate font-semibold hover:text-amber-300">{a.title}</Link>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${a.status === "PUBLISHED" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/55"}`}>
                      {t(`status.${a.status}`)}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                    {a.category && <span>{a.category}</span>}
                    <span>{fmt(a.publishedAt ?? a.updatedAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t("min", { n: a.readingMinutes })}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.views}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggle(a)}
                    disabled={busy === a.id}
                    className={`hidden rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:block cursor-pointer disabled:opacity-50 ${
                      a.status === "PUBLISHED" ? "border border-white/10 text-white/70 hover:bg-white/5" : "bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                    }`}
                  >
                    {busy === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : a.status === "PUBLISHED" ? t("unpublish") : t("publish")}
                  </button>
                  {a.status === "PUBLISHED" && (
                    <a href={`/${pageSlug}/articles/${a.slug}`} target="_blank" rel="noopener" title={t("view")} className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Link href={`/dashboard/articles/${a.id}`} title={t("edit")} className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => remove(a)} disabled={busy === a.id} title={t("delete")} className="rounded-lg p-2 text-white/50 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {list.length === 0 && <li className="py-10 text-center text-sm text-white/45">{t("noResults")}</li>}
          </ul>
        </>
      )}
    </div>
  );
}

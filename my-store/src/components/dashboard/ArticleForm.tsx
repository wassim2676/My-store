"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle, ArrowLeft, Bold, Check, CheckCircle2, Circle, Eye, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered,
  Loader2, Minus, PackagePlus, PenLine, Quote, Save, Send, X,
} from "lucide-react";
import { SingleImageField } from "./ImageUpload";
import { imageFilesFrom, uploadImage, UploadError } from "@/lib/upload-client";
import { autoExcerpt, parseArticle, plainText, readingMinutes } from "@/lib/articles";
import { pageDir, themeStyle, toSlug, type PageDesign } from "@/lib/landing";
import { useSiteHost } from "@/components/shared/useSiteHost";
import ArticleBody from "@/components/landing/ArticleBody";
import ClientFonts from "@/components/landing/ClientFonts";
import type { OfferCardData } from "@/components/landing/OfferCard";
import type { SerializedArticle } from "@/lib/articles-server";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50";

type PageInfo = { slug: string; title: string; theme: string; accentColor: string; language: string; design: PageDesign };

export default function ArticleForm({ article, page, offers }: { article?: SerializedArticle; page: PageInfo; offers: OfferCardData[] }) {
  const t = useTranslations("dash.articles");
  const tm = useTranslations("dash.media");
  const router = useRouter();
  const host = useSiteHost();
  const isEdit = !!article;

  const [f, setF] = useState({
    title: article?.title ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    coverImage: article?.coverImage ?? "",
    category: article?.category ?? "",
    seoTitle: article?.seoTitle ?? "",
    seoDescription: article?.seoDescription ?? "",
  });
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(article?.status ?? "DRAFT");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState<"DRAFT" | "PUBLISHED" | null>(null);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [offerMenu, setOfferMenu] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // رابط المقال: يتبع العنوان في المقالات الجديدة، ويبقى ثابتاً بعد الإنشاء (حتى لا تنكسر الروابط المنشورة)
  const slug = isEdit ? article!.slug : toSlug(f.title, 110) || "…";
  const words = useMemo(() => plainText(f.content).split(" ").filter(Boolean).length, [f.content]);
  const blocks = useMemo(() => parseArticle(f.content), [f.content]);
  const h2Count = blocks.filter((b) => b.t === "h2").length;
  const offersBySlug = useMemo(() => Object.fromEntries(offers.map((o) => [o.slug, o])), [offers]);

  // ✅ قائمة جودة (ما يحبه Google وAdSense)
  const checks = [
    { ok: f.title.trim().length >= 20 && f.title.trim().length <= 70, label: t("check.title") },
    { ok: words >= 600, label: t("check.words", { n: words }) },
    { ok: h2Count >= 3, label: t("check.headings") },
    { ok: !!f.coverImage, label: t("check.cover") },
    { ok: (f.excerpt || f.seoDescription).trim().length >= 70, label: t("check.description") },
    { ok: blocks.some((b) => b.t === "img" || b.t === "offer"), label: t("check.media") },
  ];

  // -------------------- ✍️ أدوات التنسيق --------------------
  const edit = (fn: (sel: string) => { text: string; cursor?: number }, block = false) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = value.slice(a, b);
    let { text } = fn(sel);
    let before = value.slice(0, a);
    const after = value.slice(b);
    // كتل (عناوين/قوائم/صور): على سطر مستقل مع سطر فارغ قبلها وبعدها
    if (block) {
      if (before && !before.endsWith("\n\n")) before += before.endsWith("\n") ? "\n" : "\n\n";
      if (!after.startsWith("\n")) text += "\n\n";
    }
    const next = before + text + after;
    set("content", next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = before.length + text.length;
      el.setSelectionRange(pos, pos);
    });
  };
  const wrap = (mark: string, ph: string) => edit((s) => ({ text: `${mark}${s || ph}${mark}` }));
  const prefixLines = (p: (i: number) => string, ph: string) =>
    edit((s) => ({ text: (s || ph).split("\n").map((l, i) => `${p(i)}${l.replace(/^(#{1,3}\s|[-*]\s|\d+[.)]\s|>\s?)/, "")}`).join("\n") }), true);
  const insertLink = () => {
    const url = window.prompt(t("tool.linkPrompt"), "https://");
    if (!url || url === "https://") return;
    edit((s) => ({ text: `[${s || t("tool.linkText")}](${url.trim()})` }));
  };

  const uploadInto = async (files: File[]) => {
    for (const file of files) {
      setUploading((n) => n + 1);
      try {
        const url = await uploadImage(file, { maxDim: 1800 });
        edit(() => ({ text: `![${file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ")}](${url})` }), true);
      } catch (e) {
        setError(tm(`errors.${e instanceof UploadError ? e.code : "network"}`));
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };
  const fileInput = useRef<HTMLInputElement>(null);

  // -------------------- 💾 الحفظ --------------------
  const save = async (nextStatus: "DRAFT" | "PUBLISHED") => {
    setError("");
    if (f.title.trim().length < 3) return setError(t("errors.title"));
    if (!f.content.trim()) return setError(t("errors.content"));
    setSaving(nextStatus);
    try {
      const body = {
        ...f,
        status: nextStatus,
        slug: isEdit ? article!.slug : undefined,
        excerpt: f.excerpt || null,
        coverImage: f.coverImage || null,
        category: f.category || null,
        seoTitle: f.seoTitle || null,
        seoDescription: f.seoDescription || null,
      };
      const res = await fetch(isEdit ? `/api/marketer/articles/${article!.id}` : "/api/marketer/articles", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const code = typeof data.error === "string" ? data.error : "";
        throw new Error(t.has(`errors.${code}`) ? t(`errors.${code}`) : t("errors.generic"));
      }
      setStatus(nextStatus);
      setDirty(false);
      if (!isEdit) router.replace(`/dashboard/articles/${data.data.id}`);
      else router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(null);
    }
  };

  // الأدوات تُعرَّف بمعرّف فقط؛ التنفيذ يتم عند النقر (لا قراءة لـ ref أثناء العرض)
  const TOOLS = [
    { id: "h2", icon: Heading2 },
    { id: "h3", icon: Heading3 },
    { id: "bold", icon: Bold },
    { id: "italic", icon: Italic },
    { id: "link", icon: Link2 },
    { id: "ul", icon: List },
    { id: "ol", icon: ListOrdered },
    { id: "quote", icon: Quote },
    { id: "hr", icon: Minus },
  ] as const;
  const runTool = (id: (typeof TOOLS)[number]["id"]) => {
    switch (id) {
      case "h2": return prefixLines(() => "## ", t("tool.heading"));
      case "h3": return prefixLines(() => "### ", t("tool.heading"));
      case "bold": return wrap("**", t("tool.boldText"));
      case "italic": return wrap("*", t("tool.italicText"));
      case "link": return insertLink();
      case "ul": return prefixLines(() => "- ", t("tool.item"));
      case "ol": return prefixLines((i) => `${i + 1}. `, t("tool.item"));
      case "quote": return prefixLines(() => "> ", t("tool.quoteText"));
      case "hr": return edit(() => ({ text: "---" }), true);
    }
  };

  const publishedUrl = `/${page.slug}/articles/${slug}`;

  return (
    <div className="mx-auto max-w-6xl">
      {/* العنوان + الحفظ */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex flex-col gap-3 border-b border-white/[0.06] bg-[#07090D]/90 px-4 py-4 backdrop-blur sm:-mx-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="min-w-0">
          <Link href="/dashboard/articles" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("title")}
          </Link>
          <h1 className="mt-1 flex items-center gap-3 font-serif text-2xl font-semibold">
            {isEdit ? t("editTitle") : t("newTitle")}
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status === "PUBLISHED" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/60"}`}>
              {t(`status.${status}`)}
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEdit && status === "PUBLISHED" && (
            <a href={publishedUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5">
              <Eye className="h-4 w-4" />
              {t("view")}
            </a>
          )}
          <button
            type="button"
            onClick={() => save("DRAFT")}
            disabled={!!saving}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/5 disabled:opacity-50 cursor-pointer"
          >
            {saving === "DRAFT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {status === "PUBLISHED" ? t("unpublish") : t("saveDraft")}
          </button>
          <button
            type="button"
            onClick={() => save("PUBLISHED")}
            disabled={!!saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50 cursor-pointer"
          >
            {saving === "PUBLISHED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
            {status === "PUBLISHED" ? t("update") : t("publish")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* 📝 العمود الرئيسي */}
        <div className="min-w-0 space-y-6">
          <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
            <input
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={150}
              placeholder={t("titlePh")}
              className="w-full bg-transparent font-serif text-2xl font-semibold text-white placeholder-white/25 focus:outline-none sm:text-3xl"
            />
            <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-white/40" dir="ltr">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              {host}/{page.slug}/articles/<span className={isEdit ? "text-white/60" : "text-amber-200/80"}>{slug}</span>
            </p>
            <div>
              <p className="mb-2 text-sm text-white/70">{t("cover")}</p>
              <SingleImageField value={f.coverImage} onChange={(v) => set("coverImage", v)} aspect="wide" maxDim={1800} />
            </div>
          </section>

          {/* المحرر */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-3 py-2">
              <div className="flex rounded-lg border border-white/10 p-0.5">
                {(["write", "preview"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTab(k)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${tab === k ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
                  >
                    {k === "write" ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {t(`tabs.${k}`)}
                  </button>
                ))}
              </div>
              {tab === "write" && (
                <div className="flex flex-wrap items-center gap-0.5">
                  {TOOLS.map(({ id, icon: Icon }) => (
                    <button key={id} type="button" title={t(`tool.${id}`)} aria-label={t(`tool.${id}`)} onClick={() => runTool(id)} className="rounded-md p-2 text-white/60 transition hover:bg-white/[0.07] hover:text-white cursor-pointer">
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                  <span className="mx-1 h-5 w-px bg-white/10" />
                  <button type="button" title={t("tool.image")} aria-label={t("tool.image")} onClick={() => fileInput.current?.click()} className="rounded-md p-2 text-white/60 transition hover:bg-white/[0.07] hover:text-white cursor-pointer">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      uploadInto(imageFilesFrom(e.target.files));
                      e.target.value = "";
                    }}
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOfferMenu((v) => !v)}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-400/10 cursor-pointer"
                    >
                      <PackagePlus className="h-4 w-4" />
                      {t("tool.offer")}
                    </button>
                    {offerMenu && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setOfferMenu(false)} />
                        <div className="absolute end-0 top-full z-40 mt-2 max-h-72 w-72 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0C0F15] p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
                          {offers.length === 0 ? (
                            <p className="px-3 py-6 text-center text-xs text-white/45">{t("tool.noOffers")}</p>
                          ) : (
                            offers.map((o) => (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() => {
                                  edit(() => ({ text: `{{offer:${o.slug}}}` }), true);
                                  setOfferMenu(false);
                                }}
                                className="block w-full truncate rounded-xl px-3 py-2.5 text-start text-sm text-white/80 hover:bg-white/[0.06] hover:text-white cursor-pointer"
                              >
                                {o.title}
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {tab === "write" ? (
              <>
                <textarea
                  ref={area}
                  value={f.content}
                  onChange={(e) => set("content", e.target.value)}
                  onPaste={(e) => {
                    const files = imageFilesFrom(e.clipboardData.items);
                    if (files.length) {
                      e.preventDefault();
                      uploadInto(files);
                    }
                  }}
                  onDrop={(e) => {
                    const files = imageFilesFrom(e.dataTransfer.files);
                    if (files.length) {
                      e.preventDefault();
                      uploadInto(files);
                    }
                  }}
                  maxLength={60000}
                  placeholder={t("contentPh")}
                  className="block min-h-[520px] w-full resize-y bg-transparent px-5 py-4 text-[15px] leading-7 text-white/90 placeholder-white/25 focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-2.5 text-xs text-white/40">
                  <span>{t("formatHint")}</span>
                  <span className="tabular-nums">
                    {t("stats", { words, min: readingMinutes(f.content) })}
                  </span>
                </div>
              </>
            ) : (
              <div data-lp dir={pageDir(page.language)} lang={page.language} style={themeStyle(page.theme, page.accentColor, page.design)} className="px-5 py-10 sm:px-10">
                <ClientFonts fonts={[page.design.font, page.design.bodyFont]} />
                <div className="mx-auto max-w-3xl">
                  {f.category && <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lp-accent-ink)]">{f.category}</p>}
                  <h1 className="mt-3 text-center font-serif text-3xl font-semibold leading-tight sm:text-4xl">{f.title || t("titlePh")}</h1>
                  {f.excerpt && <p className="mt-4 text-center text-lg text-[var(--lp-muted)]">{f.excerpt}</p>}
                  {f.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.coverImage} alt="" className="mt-8 aspect-[16/9] w-full rounded-[var(--lp-radius-lg)] object-cover" />
                  )}
                  <div className="mt-8">
                    {blocks.length ? (
                      <ArticleBody blocks={blocks} offers={offersBySlug} base={`/${page.slug}`} lang={page.language} />
                    ) : (
                      <p className="text-center text-[var(--lp-muted)]">{t("emptyPreview")}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ⚙️ الشريط الجانبي */}
        <aside className="space-y-5">
          <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <label className="block space-y-1.5">
              <span className="flex items-center justify-between text-sm text-white/70">
                {t("excerpt")}
                <span className="text-xs tabular-nums text-white/35">{f.excerpt.length}/300</span>
              </span>
              <textarea rows={4} maxLength={300} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder={t("excerptPh")} className={field + " resize-y"} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-white/70">{t("category")}</span>
              <input maxLength={60} value={f.category} onChange={(e) => set("category", e.target.value)} placeholder={t("categoryPh")} className={field} />
            </label>
          </section>

          {/* 🔍 نتيجة Google */}
          <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold">{t("seo")}</h2>
            <div className="rounded-xl bg-white p-4 text-start" dir="ltr">
              <p className="truncate text-xs text-[#4d5156]">{host} › {page.slug} › articles</p>
              <p className="mt-1 line-clamp-2 text-[17px] leading-snug text-[#1a0dab]">{(f.seoTitle || f.title || t("titlePh")).slice(0, 70)}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">
                {(f.seoDescription || f.excerpt || autoExcerpt(f.content, 160) || t("seoDescPh")).slice(0, 170)}
              </p>
            </div>
            <label className="block space-y-1.5">
              <span className="flex items-center justify-between text-sm text-white/70">
                {t("seoTitle")}
                <span className="text-xs tabular-nums text-white/35">{f.seoTitle.length}/70</span>
              </span>
              <input maxLength={70} value={f.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={f.title} className={field} />
            </label>
            <label className="block space-y-1.5">
              <span className="flex items-center justify-between text-sm text-white/70">
                {t("seoDescription")}
                <span className="text-xs tabular-nums text-white/35">{f.seoDescription.length}/170</span>
              </span>
              <textarea rows={3} maxLength={170} value={f.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder={t("seoDescPh")} className={field + " resize-y"} />
            </label>
          </section>

          {/* ✅ الجودة */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold">{t("quality")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/45">{t("qualityHint")}</p>
            <ul className="mt-4 space-y-2.5">
              {checks.map((c) => (
                <li key={c.label} className={`flex items-start gap-2.5 text-sm ${c.ok ? "text-white/80" : "text-white/45"}`}>
                  {c.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />}
                  {c.label}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-white/40">
              {checks.every((c) => c.ok) ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <X className="h-3.5 w-3.5" />}
              {t("qualityScore", { n: checks.filter((c) => c.ok).length, total: checks.length })}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

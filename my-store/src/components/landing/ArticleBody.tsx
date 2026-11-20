/* eslint-disable @next/next/no-img-element -- صور المقالات من الرفع الداخلي أو روابط خارجية */
import { Fragment } from "react";
import Link from "next/link";
import { parseInline, type Block, type InlineNode } from "@/lib/articles";
import OfferCard, { type OfferCardData } from "./OfferCard";
import AdSlot from "./AdSlot";

// ==================== 📰 جسم المقال: كتل آمنة → عناصر React بتنسيق تحريري مريح للقراءة ====================
// يُستخدم في الصفحة العامة وفي معاينة المحرر. عرض سطر ~68 حرفاً، تباعد مريح، عناوين بمعرّفات للفهرس.

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.k) {
          case "b":
            return <strong key={i} className="font-semibold text-[var(--lp-text)]">{n.v}</strong>;
          case "i":
            return <em key={i}>{n.v}</em>;
          case "code":
            return <code key={i} className="rounded bg-[var(--lp-surface2)] px-1.5 py-0.5 text-[0.9em]">{n.v}</code>;
          case "a": {
            const internal = n.href.startsWith("/") || n.href.startsWith("#");
            const cls = "font-medium text-[var(--lp-accent-ink)] underline decoration-[color-mix(in_srgb,var(--lp-accent)_45%,transparent)] underline-offset-4 hover:decoration-[var(--lp-accent)]";
            return internal ? (
              <Link key={i} href={n.href} className={cls}>{n.v}</Link>
            ) : (
              <a key={i} href={n.href} target="_blank" rel="nofollow noopener noreferrer" className={cls}>{n.v}</a>
            );
          }
          default:
            return <Fragment key={i}>{n.v}</Fragment>;
        }
      })}
    </>
  );
}

const T = ({ text }: { text: string }) => <Inline nodes={parseInline(text)} />;

export default function ArticleBody({
  blocks,
  offers,
  pageSlug,
  lang,
  withAds = false,
}: {
  blocks: Block[];
  offers: Record<string, OfferCardData>;
  pageSlug: string;
  lang: string;
  /** أماكن الإعلانات داخل المحتوى (لا تظهر إلا بعد تفعيل AdSense) */
  withAds?: boolean;
}) {
  // إعلان وسط المقال: بعد منتصف الفقرات تقريباً، وفقط في المقالات الطويلة بما يكفي
  const paragraphs = blocks.filter((b) => b.t === "p").length;
  const midAfter = withAds && paragraphs >= 6 ? Math.floor(paragraphs / 2) : -1;
  let pCount = 0;

  return (
    <div className="text-[17px] leading-[1.8] text-[color-mix(in_srgb,var(--lp-text)_88%,var(--lp-muted))] sm:text-[18px]">
      {blocks.map((b, i) => {
        let node: React.ReactNode;
        switch (b.t) {
          case "h2":
            node = <h2 id={b.id} className="mt-12 mb-4 scroll-mt-28 font-serif text-2xl font-semibold leading-snug text-[var(--lp-text)] sm:text-[1.7rem]"><T text={b.text} /></h2>;
            break;
          case "h3":
            node = <h3 id={b.id} className="mt-9 mb-3 scroll-mt-28 font-serif text-xl font-semibold text-[var(--lp-text)]"><T text={b.text} /></h3>;
            break;
          case "p":
            pCount++;
            node = <p className="my-5"><T text={b.text} /></p>;
            break;
          case "quote":
            node = (
              <blockquote className="my-8 border-s-4 border-[var(--lp-accent)] ps-5 font-serif text-xl italic leading-relaxed text-[var(--lp-text)]">
                <T text={b.text} />
              </blockquote>
            );
            break;
          case "ul":
          case "ol": {
            const L = b.t === "ul" ? "ul" : "ol";
            node = (
              <L className={`my-6 space-y-2.5 ps-6 ${b.t === "ul" ? "list-disc" : "list-decimal"} marker:text-[var(--lp-accent-ink)]`}>
                {b.items.map((it, j) => (
                  <li key={j} className="ps-1.5"><T text={it} /></li>
                ))}
              </L>
            );
            break;
          }
          case "img":
            node = (
              <figure className="my-9">
                <img src={b.src} alt={b.alt} loading="lazy" className="w-full rounded-[var(--lp-radius-md)] border border-[var(--lp-border)] bg-[var(--lp-surface2)] object-cover" />
                {b.alt && <figcaption className="mt-2.5 text-center text-sm text-[var(--lp-muted)]">{b.alt}</figcaption>}
              </figure>
            );
            break;
          case "offer": {
            const o = offers[b.slug];
            node = o ? (
              <div className="not-prose my-10 mx-auto max-w-sm">
                <OfferCard offer={o} pageSlug={pageSlug} lang={lang} />
              </div>
            ) : null;
            break;
          }
          case "hr":
            node = <hr className="my-12 border-[var(--lp-border)]" />;
            break;
        }
        return (
          <Fragment key={i}>
            {node}
            {b.t === "p" && pCount === midAfter && <AdSlot slot="middle" />}
          </Fragment>
        );
      })}
    </div>
  );
}

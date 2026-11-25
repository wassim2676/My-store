import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { PageFrame } from "@/components/site/StaticPage";
import ArticleCard, { JsonLd, readableAccent } from "@/components/blog/ArticleCard";
import { NETWORKS, NETWORK_BY_SLUG, articlesByNetwork, type NetworkSlug } from "@/content/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 🏬 صفحة مركزية لكل شبكة أفلييت (Topic hub): تربط مقالات الشبكة الخمسة ببعضها وتقوّي الأرشفة
export const dynamicParams = false;
export const generateStaticParams = () => NETWORKS.map((n) => ({ network: n.slug }));

type Props = { params: Promise<{ network: string }> };

const KIND_ORDER = ["Guide", "Commissions", "Strategy", "Social", "Compliance"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { network } = await params;
  const n = NETWORK_BY_SLUG[network as NetworkSlug];
  if (!n) return {};
  const url = `/blog/network/${n.slug}`;
  return {
    title: n.hubTitle,
    description: n.hubDescription,
    alternates: { canonical: url },
    openGraph: { title: n.hubTitle, description: n.hubDescription, url, type: "website" },
    twitter: { card: "summary_large_image", title: n.hubTitle, description: n.hubDescription },
  };
}

export default async function NetworkHubPage({ params }: Props) {
  const { network } = await params;
  const n = NETWORK_BY_SLUG[network as NetworkSlug];
  if (!n) notFound();
  const accent = readableAccent(n.color);
  const list = [...articlesByNetwork(n.slug)].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  const others = NETWORKS.filter((x) => x.slug !== n.slug);
  const url = `${SITE_URL}/blog/network/${n.slug}`;

  return (
    <PageFrame>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: n.hubTitle,
            description: n.hubDescription,
            url,
            isPartOf: { "@type": "Blog", name: `${SITE_NAME} Affiliate Academy`, url: `${SITE_URL}/blog` },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: list.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/blog/${a.slug}`, name: a.title })),
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 2, name: n.name, item: url },
            ],
          },
        ]}
      />

      <header className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute -top-44 left-1/2 h-[520px] w-[1100px] max-w-[180vw] -translate-x-1/2 rounded-full blur-[130px]" style={{ background: `${n.color}26` }} />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-10 sm:pt-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-white/45">
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/70">{n.name}</span>
          </nav>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg" style={{ boxShadow: `0 18px 40px ${n.color}40` }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- شعار SVG صغير */}
              <img src={`/brands/${n.slug}.svg`} alt={`${n.name} logo`} width={48} height={48} className="max-h-full max-w-full object-contain" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{n.program}</p>
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{n.hubTitle}</h1>
          <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-white/60">
            {n.hubIntro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/45"><BookOpen className="h-4 w-4" style={{ color: accent }} /> {list.length} in-depth guides</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        {/* مسار القراءة المقترح */}
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a, i) => (
            <li key={a.slug} className="relative flex">
              <span className="absolute -top-3 left-5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg" style={{ background: n.color, color: n.ink }}>{i + 1}</span>
              <ArticleCard a={a} />
            </li>
          ))}
        </ol>

        <aside className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Ready to promote {n.name}?</h2>
            <p className="mt-2 max-w-xl text-white/55">Add your {n.name} links to a {SITE_NAME} page with reviews, collections, disclosure and click analytics built in.</p>
          </div>
          <Link href="/register" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-300">
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>

        <section className="mt-16" aria-labelledby="other">
          <h2 id="other" className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">Guides for other networks</h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/blog/network/${o.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-4 py-2 text-sm text-white/75 transition hover:border-white/25 hover:text-white">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: readableAccent(o.color) }} />
                  {o.program}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageFrame>
  );
}

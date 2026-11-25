import Link from "next/link";
import { Lightbulb } from "lucide-react";

// ==================== 📝 عارض Markdown مبسّط لمقالات المدونة (بدون مكتبات خارجية) ====================
// يدعم: ## / ### عناوين (مع id للفهرس)، فقرات، قوائم - و 1.، ملاحظات >، جداول |، **عريض**، *مائل*، [رابط](url)

type Block =
  | { t: "h2" | "h3"; text: string; id: string }
  | { t: "p"; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "table"; head: string[]; rows: string[][] };

export const slugify = (s: string) =>
  s.toLowerCase().replace(/\*\*|\*/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 64);

const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: Block[] = [];
  const used = new Map<string, number>();
  const uid = (text: string) => {
    const base = slugify(text) || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n ? `${base}-${n + 1}` : base;
  };
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const tr = line.trim();
    if (!tr) { i++; continue; }
    if (tr.startsWith("### ")) { out.push({ t: "h3", text: tr.slice(4), id: uid(tr.slice(4)) }); i++; continue; }
    if (tr.startsWith("## ")) { out.push({ t: "h2", text: tr.slice(3), id: uid(tr.slice(3)) }); i++; continue; }
    if (tr.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const r = lines[i].trim();
        if (!/^\|[\s:|-]+\|$/.test(r)) rows.push(cells(r));
        i++;
      }
      if (rows.length) out.push({ t: "table", head: rows[0], rows: rows.slice(1) });
      continue;
    }
    if (tr.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) { parts.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      out.push({ t: "quote", text: parts.join(" ") });
      continue;
    }
    if (/^[-*] /.test(tr)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) { items.push(lines[i].trim().slice(2)); i++; }
      out.push({ t: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(tr)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s/, "")); i++; }
      out.push({ t: "ol", items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |\||>|[-*] |\d+\. )/.test(lines[i].trim())) { para.push(lines[i].trim()); i++; }
    out.push({ t: "p", text: para.join(" ") });
  }
  return out;
}

/** فهرس المحتويات (عناوين H2) */
export const tocOf = (blocks: Block[]) =>
  blocks.flatMap((b) => (b.t === "h2" ? [{ id: b.id, text: b.text.replace(/\*\*/g, "") }] : []));

// -------------------- ✍️ العناصر داخل السطر --------------------
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\s][^*]*?)\*/g;

export function Inline({ text, accent }: { text: string; accent?: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index! > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) nodes.push(<strong key={k++} className="font-semibold text-white"><Inline text={m[1]} accent={accent} /></strong>);
    else if (m[2] !== undefined) {
      const href = m[3];
      const internal = href.startsWith("/");
      nodes.push(
        internal ? (
          <Link key={k++} href={href} className="font-medium underline decoration-2 underline-offset-[3px] transition hover:text-white" style={{ color: accent, textDecorationColor: accent ? `${accent}66` : undefined }}>
            {m[2]}
          </Link>
        ) : (
          <a key={k++} href={href} rel="nofollow noopener" target="_blank" className="font-medium underline underline-offset-[3px]" style={{ color: accent }}>
            {m[2]}
          </a>
        ),
      );
    } else if (m[4] !== undefined) nodes.push(<em key={k++} className="text-white/60">{m[4]}</em>);
    last = m.index! + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

// -------------------- 📄 العرض --------------------
export default function Markdown({ blocks, accent }: { blocks: Block[]; accent: string }) {
  return (
    <div className="text-[17px] leading-[1.85] text-white/[0.72]">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2":
            return (
              <h2 key={i} id={b.id} className="mt-14 scroll-mt-28 font-serif text-[28px] font-semibold leading-tight tracking-tight text-white first:mt-0 sm:text-[32px]">
                <Inline text={b.text} accent={accent} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={b.id} className="mt-9 scroll-mt-28 text-xl font-semibold text-white">
                <Inline text={b.text} accent={accent} />
              </h3>
            );
          case "p":
            return <p key={i} className="mt-5"><Inline text={b.text} accent={accent} /></p>;
          case "ul":
            return (
              <ul key={i} className="mt-5 space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                    <span><Inline text={it} accent={accent} /></span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="mt-5 space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold" style={{ background: `${accent}22`, color: accent }}>
                      {j + 1}
                    </span>
                    <span><Inline text={it} accent={accent} /></span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <aside key={i} className="mt-7 flex gap-4 rounded-2xl border p-5 text-[16px] leading-relaxed text-white/80" style={{ borderColor: `${accent}40`, background: `${accent}0f` }}>
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accent }} />
                <div><Inline text={b.text.replace(/^"|"$/g, "")} accent={accent} /></div>
              </aside>
            );
          case "table":
            return (
              <div key={i} className="mt-7 overflow-x-auto rounded-2xl border border-white/[0.08]">
                <table className="w-full min-w-[520px] border-collapse text-left text-[15px]">
                  <thead>
                    <tr style={{ background: `${accent}14` }}>
                      {b.head.map((h, j) => (
                        <th key={j} className="border-b border-white/[0.08] px-4 py-3 font-semibold text-white"><Inline text={h} accent={accent} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="odd:bg-white/[0.015]">
                        {r.map((c, k) => (
                          <td key={k} className="border-b border-white/[0.05] px-4 py-3 align-top text-white/70"><Inline text={c} accent={accent} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}

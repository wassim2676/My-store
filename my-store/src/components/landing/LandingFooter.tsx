import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { publicT } from "@/lib/landing";
import { SITE_NAME } from "@/lib/site";

// ==================== 🦶 تذييل صفحة الهبوط (مشترك بين الصفحة العامة ومعاينة لوحة التحكم) ====================
export default function LandingFooter({
  lang,
  title,
  showDisclosure,
  disclosure,
}: {
  lang: string;
  title: string;
  showDisclosure: boolean;
  disclosure?: string | null;
}) {
  return (
    <footer className="mt-20 border-t border-[var(--lp-border)]">
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        {showDisclosure && (
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-5 text-start">
            <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--lp-accent-ink)]">
              <ShieldCheck className="h-4 w-4" />
              {publicT(lang, "disclosureTitle")}
            </p>
            <p className="text-[13px] leading-relaxed text-[var(--lp-muted)]">{disclosure || publicT(lang, "disclosureDefault")}</p>
          </div>
        )}
        <p className="text-xs text-[var(--lp-muted)]">
          © {new Date().getFullYear()} {title} · {publicT(lang, "poweredBy")}{" "}
          <Link href="/" className="font-semibold text-[var(--lp-text)] hover:text-[var(--lp-accent-ink)]">
            {SITE_NAME}
          </Link>
        </p>
      </div>
    </footer>
  );
}

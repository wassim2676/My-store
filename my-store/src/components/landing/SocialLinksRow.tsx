import { Globe, ArrowUpRight } from "lucide-react";
import { SOCIAL_KEYS, type SocialLinks } from "@/lib/landing";

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  pinterest: "Pinterest",
  website: "Website",
};

export default function SocialLinksRow({ links, className = "justify-center" }: { links: SocialLinks; className?: string }) {
  const entries = SOCIAL_KEYS.filter((k) => links[k]);
  if (entries.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {entries.map((key) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer me"
          className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--lp-muted)] transition hover:border-[var(--lp-accent)] hover:text-[var(--lp-text)]"
        >
          {key === "website" && <Globe className="h-3.5 w-3.5" />}
          {LABELS[key]}
          <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
        </a>
      ))}
    </div>
  );
}

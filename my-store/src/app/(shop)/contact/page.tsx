import { getTranslations } from "next-intl/server";
import { Clock, Mail } from "lucide-react";
import StaticPage, { contentMetadata } from "@/components/site/StaticPage";

export const generateMetadata = () => contentMetadata("contact");

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@mystore.ma";

export default async function Page() {
  const t = await getTranslations("pages.contact");
  return (
    <StaticPage pageKey="contact">
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${CONTACT_EMAIL}`} className="group rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-6 transition hover:bg-amber-400/[0.09]">
          <Mail className="h-5 w-5 text-amber-300" />
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/40">{t("emailLabel")}</p>
          <p className="mt-1 font-semibold text-white group-hover:text-amber-200" dir="ltr">{CONTACT_EMAIL}</p>
        </a>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <Clock className="h-5 w-5 text-amber-300" />
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/40">{t("responseLabel")}</p>
          <p className="mt-1 font-semibold text-white">{t("response")}</p>
        </div>
      </div>
    </StaticPage>
  );
}

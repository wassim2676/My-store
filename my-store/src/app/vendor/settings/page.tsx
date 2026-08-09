"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import MegaNavbar from "@/components/home/MegaNavbar";
import MegaFooter from "@/components/home/MegaFooter";
import VendorSidebar from "@/components/vendor/VendorSidebar";

interface VendorSettings {
  storeName: string; slug: string; description: string | null;
  logo: string | null; banner: string | null;
  bannerTitle: string | null; bannerSubtitle: string | null;
  primaryColor: string; secondaryColor: string; backgroundColor: string; textColor: string;
  phone: string | null; city: string | null;
}

export default function VendorSettingsPage() {
  const [form, setForm] = useState<VendorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/vendor/store")
      .then((r) => r.json())
      .then((d) => { if (d.success) setForm(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/vendor/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.storeName,
          description: form.description,
          logo: form.logo || null,
          banner: form.banner || null,
          bannerTitle: form.bannerTitle,
          bannerSubtitle: form.bannerSubtitle,
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          backgroundColor: form.backgroundColor,
          textColor: form.textColor,
          phone: form.phone,
          city: form.city,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const colorFields: { key: keyof VendorSettings; label: string }[] = [
    { key: "primaryColor", label: "اللون الأساسي" },
    { key: "secondaryColor", label: "اللون الثانوي" },
    { key: "backgroundColor", label: "لون الخلفية" },
    { key: "textColor", label: "لون النص" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MegaNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          <VendorSidebar />

          <div className="flex-1 min-w-0 max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">تخصيص المتجر</h1>
              <Link href={`/store/${form.slug}`} target="_blank" className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                معاينة المتجر <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-slate-900">المعلومات العامة</h2>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">اسم المتجر</label>
                <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">وصف المتجر</label>
                <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">رابط الشعار (Logo)</label>
                  <input value={form.logo || ""} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">رابط صورة الغلاف (Banner)</label>
                  <input value={form.banner || ""} onChange={(e) => setForm({ ...form, banner: e.target.value })} placeholder="https://..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">عنوان الغلاف</label>
                  <input value={form.bannerTitle || ""} onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">نص فرعي للغلاف</label>
                  <input value={form.bannerSubtitle || ""} onChange={(e) => setForm({ ...form, bannerSubtitle: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-slate-900">ألوان المتجر</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {colorFields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">{field.label}</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2 py-1.5">
                      <input
                        type="color"
                        value={form[field.key] as string}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0"
                      />
                      <span className="text-xs text-slate-500 font-mono">{form[field.key] as string}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-slate-900 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? "جاري الحفظ..." : saved ? "✓ تم الحفظ" : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </main>

      <MegaFooter />
    </div>
  );
}

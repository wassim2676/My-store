"use client";
/* eslint-disable @next/next/no-img-element -- معاينة صور مرفوعة أو روابط خارجية */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { UploadError, imageFilesFrom, uploadImage } from "@/lib/upload-client";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50";

function useUploader(opts: { maxDim?: number } = {}) {
  const t = useTranslations("dash.media");
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const run = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];
    setError("");
    setBusy((n) => n + files.length);
    const urls: string[] = [];
    for (const f of files) {
      try {
        urls.push(await uploadImage(f, opts));
      } catch (e) {
        setError(t(`errors.${e instanceof UploadError ? e.code : "network"}`));
      } finally {
        setBusy((n) => n - 1);
      }
    }
    return urls;
  };
  return { run, busy: busy > 0, error, setError };
}

// ==================== 🖼️ منطقة إضافة صور متعددة (سحب وإفلات + لصق + تصفّح + رابط) ====================
export function ImageDropzone({
  onAdd,
  remaining,
  pasteAnywhere = true,
}: {
  onAdd: (urls: string[]) => void;
  remaining: number;
  /** التقاط الصور الملصوقة (Ctrl+V) في أي مكان بالصفحة، ما عدا داخل حقول النص */
  pasteAnywhere?: boolean;
}) {
  const t = useTranslations("dash.media");
  const { run, busy, error, setError } = useUploader();
  const [over, setOver] = useState(false);
  const [url, setUrl] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const add = async (files: File[]) => onAdd(await run(files.slice(0, remaining)));

  // لصق صورة من الحافظة (لقطة شاشة، صورة منسوخة من موقع...)
  const addRef = useRef(add);
  useEffect(() => {
    addRef.current = add;
  });
  useEffect(() => {
    if (!pasteAnywhere || remaining <= 0) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = imageFilesFrom(e.clipboardData?.items);
      if (!files.length) return; // نص عادي → نتركه للحقل
      e.preventDefault();
      addRef.current(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteAnywhere, remaining]);

  const addUrl = () => {
    const urls = url.split(/\s+/).map((u) => u.trim()).filter(Boolean);
    const valid = urls.filter((u) => /^https?:\/\/\S+$/i.test(u));
    if (!valid.length) return setError(t("errors.url"));
    onAdd(valid.slice(0, remaining));
    setUrl("");
    setError("");
  };

  if (remaining <= 0) return null;
  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(imageFilesFrom(e.dataTransfer.files));
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition ${
          over ? "border-amber-400 bg-amber-400/[0.08]" : "border-white/12 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
        }`}
      >
        {busy ? <Loader2 className="h-7 w-7 animate-spin text-amber-300" /> : <Upload className="h-7 w-7 text-white/45" />}
        <p className="text-sm text-white/80">
          {busy ? t("uploading") : t("dropTitle")}{" "}
          {!busy && <span className="font-semibold text-amber-300 underline-offset-2 hover:underline">{t("browse")}</span>}
        </p>
        <p className="text-xs text-white/40">{t("dropHint", { n: remaining })}</p>
        <input
          ref={input}
          type="file"
          accept="image/*,.svg"
          multiple
          hidden
          onChange={(e) => {
            add(imageFilesFrom(e.target.files));
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            dir="ltr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder={t("urlPh")}
            className={field + " ps-9"}
          />
        </div>
        <button type="button" onClick={addUrl} className="shrink-0 rounded-xl border border-white/10 px-4 text-sm text-white/80 hover:bg-white/5 cursor-pointer">
          {t("add")}
        </button>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}

// ==================== 🖼️ حقل صورة واحدة (الصورة الشخصية، الغلاف، شعار المتجر) ====================
export function SingleImageField({
  value,
  onChange,
  aspect = "square",
  maxDim = 1600,
  accept = "image/*,.svg",
  checker = false,
}: {
  value: string;
  onChange: (v: string) => void;
  aspect?: "square" | "wide" | "logo";
  maxDim?: number;
  accept?: string;
  /** خلفية شطرنجية لإظهار الشفافية (مفيد للشعارات) */
  checker?: boolean;
}) {
  const t = useTranslations("dash.media");
  const { run, busy, error } = useUploader({ maxDim });
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const take = async (files: File[]) => {
    const [url] = await run(files.slice(0, 1));
    if (url) onChange(url);
  };

  const box =
    aspect === "wide" ? "h-20 w-36" : aspect === "logo" ? "h-16 w-32" : "h-20 w-20";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div
          role="button"
          tabIndex={0}
          aria-label={t("browse")}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
          onPaste={(e) => {
            const files = imageFilesFrom(e.clipboardData.items);
            if (files.length) {
              e.preventDefault();
              take(files);
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            take(imageFilesFrom(e.dataTransfer.files));
          }}
          className={`relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${box} ${
            over ? "border-amber-400 bg-amber-400/10" : value ? "border-white/10" : "border-white/15 hover:border-white/30"
          } ${checker ? "bg-[length:12px_12px] bg-[conic-gradient(#ffffff14_25%,transparent_0_50%,#ffffff14_0_75%,transparent_0)]" : "bg-white/[0.03]"}`}
          title={t("singleHint")}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
          ) : value ? (
            <img src={value} alt="" className={`h-full w-full ${aspect === "logo" ? "object-contain p-2" : "object-cover"}`} />
          ) : (
            <ImagePlus className="h-5 w-5 text-white/35" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              {t("upload")}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("remove")}
              </button>
            )}
          </div>
          <input
            dir="ltr"
            maxLength={1000}
            value={value.startsWith("/api/media/") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={(e) => {
              const files = imageFilesFrom(e.clipboardData.items);
              if (files.length) {
                e.preventDefault();
                take(files);
              }
            }}
            placeholder={value.startsWith("/api/media/") ? t("uploaded") : t("urlPh")}
            className={field + " py-2 text-xs"}
          />
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          take(imageFilesFrom(e.target.files));
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}

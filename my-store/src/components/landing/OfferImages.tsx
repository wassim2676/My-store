"use client";
/* eslint-disable @next/next/no-img-element -- صور خارجية يضيفها المسوّق */

import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function OfferImages({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-[var(--lp-card-img)]">
        {current ? (
          <img src={current} alt={alt} className="h-full w-full object-contain p-8" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-300">
            <ImageOff className="h-12 w-12" />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[var(--lp-card-img)] transition cursor-pointer ${
                i === active ? "border-[var(--lp-accent)]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`${alt} ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

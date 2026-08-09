"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full bg-white rounded-2xl border border-slate-200 overflow-hidden mb-3">
        <Image src={images[active]} alt={name} fill className="object-contain p-6" sizes="(max-width: 1024px) 100vw, 50vw" priority />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                active === i ? "border-orange-500" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

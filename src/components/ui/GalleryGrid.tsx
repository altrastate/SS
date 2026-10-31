"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  caption?: string | null;
  imageUrl: string;
  altText: string;
};

export function GalleryGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (active === null) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((current) => (current === null ? current : (current + 1) % items.length));
      if (event.key === "ArrowLeft") setActive((current) => (current === null ? current : (current - 1 + items.length) % items.length));
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = active === null ? "" : "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, items.length]);

  const current = active === null ? null : items[active];

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className="card-lift w-full overflow-hidden border border-navy/10 bg-white text-left"
              onClick={() => setActive(index)}
            >
              <figure>
                <div className="relative aspect-[4/3] bg-ivory-dark">
                  <Image
                    src={item.imageUrl}
                    alt={item.altText}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <figcaption className="p-4">
                  <p className="font-serif text-lg text-navy">{item.title}</p>
                  {item.caption ? <p className="mt-1 text-sm text-muted">{item.caption}</p> : null}
                </figcaption>
              </figure>
            </button>
          </li>
        ))}
      </ul>
      {current ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/90 p-4" role="dialog" aria-modal="true" aria-label={current.title}>
          <button type="button" className="absolute right-4 top-4 min-h-11 px-3 text-sm font-semibold text-ivory" onClick={() => setActive(null)}>
            Close
          </button>
          <button type="button" className="hero-nav-btn absolute left-4" aria-label="Previous image" onClick={() => setActive((active! - 1 + items.length) % items.length)}>
            ←
          </button>
          <figure className="max-h-[90vh] w-full max-w-5xl">
            <div className="relative aspect-[16/10] w-full">
              <Image src={current.imageUrl} alt={current.altText} fill className="object-contain" sizes="100vw" />
            </div>
            <figcaption className="mt-3 text-center text-ivory">
              <p className="font-serif text-2xl">{current.title}</p>
              {current.caption ? <p className="mt-1 text-sm text-ivory/75">{current.caption}</p> : null}
            </figcaption>
          </figure>
          <button type="button" className="hero-nav-btn absolute right-4 top-1/2" aria-label="Next image" onClick={() => setActive((active! + 1) % items.length)}>
            →
          </button>
        </div>
      ) : null}
    </>
  );
}

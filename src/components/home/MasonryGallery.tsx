"use client";

import { useEffect, useState } from "react";
import { GALLERY_IMAGES } from "@/lib/site-media";
import { Reveal } from "@/components/motion/Reveal";

export function MasonryGallery() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (active === null) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((current) => ((current ?? 0) + 1) % GALLERY_IMAGES.length);
      if (event.key === "ArrowLeft") {
        setActive((current) => ((current ?? 0) - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
      }
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = active === null ? "" : "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="masonry">
        {GALLERY_IMAGES.map((src, index) => (
          <Reveal key={src}>
            <figure>
              <button type="button" onClick={() => setActive(index)} className="block w-full border-0 bg-transparent p-0">
                <img src={src} alt={`Jinja College gallery photo ${index + 1}`} loading="lazy" />
              </button>
            </figure>
          </Reveal>
        ))}
      </div>
      <div
        className={`lightbox${active !== null ? " open" : ""}`}
        onClick={() => setActive(null)}
        role="dialog"
        aria-modal="true"
        aria-hidden={active === null}
      >
        <button type="button" className="lb-close" aria-label="Close" onClick={() => setActive(null)}>
          ×
        </button>
        <button
          type="button"
          className="lb-prev"
          aria-label="Previous"
          onClick={(event) => {
            event.stopPropagation();
            setActive((current) => ((current ?? 0) - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
          }}
        >
          ←
        </button>
        {active !== null ? (
          <img
            src={GALLERY_IMAGES[active]}
            alt={`Jinja College gallery photo ${active + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
        ) : null}
        <button
          type="button"
          className="lb-next"
          aria-label="Next"
          onClick={(event) => {
            event.stopPropagation();
            setActive((current) => ((current ?? 0) + 1) % GALLERY_IMAGES.length);
          }}
        >
          →
        </button>
      </div>
    </>
  );
}

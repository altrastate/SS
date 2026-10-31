"use client";

import { useEffect, useRef } from "react";

export type NewsCard = {
  href: string;
  image: string;
  date: string;
  title: string;
  summary: string;
  external?: boolean;
};

export function NewsCarousel({ items }: { items: NewsCard[] }) {
  const track = useRef<HTMLDivElement>(null);

  function step() {
    const first = track.current?.querySelector(".n") as HTMLElement | null;
    return (first?.offsetWidth || 360) + 24;
  }

  useEffect(() => {
    const node = track.current;
    if (!node || items.length < 2) return;
    const timer = window.setInterval(() => {
      if (node.matches(":hover")) return;
      if (node.scrollLeft + node.clientWidth >= node.scrollWidth - 10) {
        node.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        node.scrollBy({ left: step(), behavior: "smooth" });
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <>
      <div className="news-track" ref={track}>
        {items.map((item) => (
          <a
            key={item.href}
            className="n"
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <img src={item.image} alt="" />
            <time>{item.date}</time>
            <h4>{item.title}</h4>
            <p>{item.summary}</p>
          </a>
        ))}
      </div>
      <div className="news-nav">
        <button type="button" aria-label="Previous news" onClick={() => track.current?.scrollBy({ left: -step(), behavior: "smooth" })}>
          ←
        </button>
        <button type="button" aria-label="Next news" onClick={() => track.current?.scrollBy({ left: step(), behavior: "smooth" })}>
          →
        </button>
      </div>
    </>
  );
}

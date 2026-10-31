"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <a
      href="#main-content"
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-11 items-center bg-gold px-4 text-sm font-semibold text-navy shadow-lg"
    >
      Back to top
    </a>
  );
}

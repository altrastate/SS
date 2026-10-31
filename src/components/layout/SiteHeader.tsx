"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HOME_NAV, SCHOOL_CREST } from "@/lib/site-media";

export function SiteHeader({ schoolName }: { schoolName: string; motto?: string }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    setOpen(false);
    setScrolled(!isHome);
  }, [pathname, isHome]);

  useEffect(() => {
    function onScroll() {
      if (isHome) setScrolled(window.scrollY > 40);
      const y = window.scrollY + 200;
      if (!isHome) return;
      let id = "";
      document.querySelectorAll("section[id]").forEach((section) => {
        if ((section as HTMLElement).offsetTop <= y) id = section.id;
      });
      setActive(id);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {!isHome ? <div className="nav-spacer" /> : null}
      <header className={`jico-nav${scrolled || open ? " scrolled" : ""}`}>
        <Link href="/#home" className="jico-brand" onClick={() => setOpen(false)}>
          <img src={SCHOOL_CREST} alt={`${schoolName} crest`} width={46} height={46} />
          <span>
            <b>{schoolName}</b>
            <small>Est. 1946</small>
          </span>
        </Link>
        <nav className={`jico-links${open ? " open" : ""}`} aria-label="Primary">
          {HOME_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={active && item.href.endsWith(`#${active}`) ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/#contact" className="btn btn-gold sm" onClick={() => setOpen(false)}>
            Admissions
          </Link>
        </nav>
        <button
          type="button"
          className={`jico-burger${open ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </header>
    </>
  );
}

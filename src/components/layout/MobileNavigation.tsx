"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mainNav } from "@/lib/nav";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/25 px-3 text-sm font-semibold text-ivory"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {open ? (
        <div
          id="mobile-navigation"
          className="fixed inset-x-0 top-[4.75rem] z-40 border-t border-navy/10 bg-ivory shadow-lg lg:top-[7rem]"
        >
          <nav aria-label="Mobile" className="container-page py-4">
            <ul className="flex flex-col">
              {mainNav.map((item) => (
                <li key={item.href} className="border-b border-navy/10">
                  <Link
                    href={item.href}
                    className="block py-3 text-base font-medium text-navy"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-b border-navy/10">
                <Link href="/search" className="block py-3 text-base font-medium text-navy" onClick={() => setOpen(false)}>
                  Search
                </Link>
              </li>
              <li className="border-b border-navy/10">
                <Link href="/downloads" className="block py-3 text-base font-medium text-navy" onClick={() => setOpen(false)}>
                  Downloads
                </Link>
              </li>
              <li className="pt-4">
                <Link
                  href="/admissions"
                  className="inline-flex min-h-11 items-center bg-navy px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Admissions enquiry
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

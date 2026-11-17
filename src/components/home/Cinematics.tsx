"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SCHOOL_CREST } from "@/lib/site-media";

export function Cinematics() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [loader, setLoader] = useState(isHome);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isHome) {
      setLoader(false);
      return;
    }
    const hide = window.setTimeout(() => setLoader(false), 1400);
    return () => window.clearTimeout(hide);
  }, [isHome]);

  useEffect(() => {
    const bar = document.getElementById("jico-scroll-prog");
    if (!bar) return;
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="scroll-prog" id="jico-scroll-prog" aria-hidden="true" />
      {loader ? (
        <div className="jico-loader" role="status" aria-label="Loading Kapchorwa Senior Secondary School">
          <img src={SCHOOL_CREST} alt="" width={90} height={90} className="bg-transparent" />
          <span>Knowledge Is Our Future Light</span>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";

function useCount(target: number, start: boolean, duration = 1800) {
  const [value, setValue] = useState(start ? target : 0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const begin = performance.now();
    const from = target > 1000 && target < 3000 ? 1900 : 0;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - begin) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target, duration]);
  return value;
}

export function StatCounters({ foundingYear }: { foundingYear: number }) {
  const years = Math.max(0, new Date().getFullYear() - foundingYear);
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const founded = useCount(foundingYear, start);
  const excellence = useCount(years, start);
  const classes = useCount(6, start);
  const levels = useCount(2, start);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStart(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: founded, label: "Year founded" },
    { value: excellence, label: "Years of excellence" },
    { value: classes, label: "Senior classes, S.1–S.6" },
    { value: levels, label: "O' Level & A' Level" },
  ];

  return (
    <div ref={ref} className="stats-bar">
      {stats.map((item, index) => (
        <Reveal key={item.label} className="stat" delay={index * 80}>
          <b>{item.value}</b>
          <span>{item.label}</span>
        </Reveal>
      ))}
    </div>
  );
}

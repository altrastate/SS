"use client";

import { useEffect, useRef } from "react";

function splitNode(node: HTMLElement) {
  const walk = (n: Node) => {
    [...n.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        const fragment = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((token) => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            fragment.appendChild(document.createTextNode(token));
            return;
          }
          const wrap = document.createElement("span");
          wrap.className = "w";
          const inner = document.createElement("span");
          inner.textContent = token;
          wrap.appendChild(inner);
          fragment.appendChild(wrap);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(node);
  node.querySelectorAll(".w > span").forEach((span, index) => {
    (span as HTMLElement).style.transitionDelay = `${0.1 + index * 0.08}s`;
  });
}

export function SplitHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h1" | "h2";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || node.dataset.split === "true") return;
    splitNode(node);
    node.dataset.split = "true";
    if (Tag === "h1") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("in");
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [Tag]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

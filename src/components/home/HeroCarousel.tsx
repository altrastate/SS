"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SplitHeading } from "@/components/home/SplitHeading";
import { HERO_SLIDES } from "@/lib/site-media";

const DURATION = 6500;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [barOn, setBarOn] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  useEffect(() => {
    setBarOn(false);
    const restart = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBarOn(true));
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => cancelAnimationFrame(restart);
    }
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, DURATION);
    return () => {
      cancelAnimationFrame(restart);
      window.clearTimeout(timer);
    };
  }, [index]);

  useEffect(() => {
    const hero = heroRef.current;
    const slides = slidesRef.current;
    const cue = cueRef.current;
    if (!hero || !slides) return;

    function onScroll() {
      if (window.scrollY < window.innerHeight) {
        slides!.style.transform = `translateY(${window.scrollY * 0.35}px)`;
        if (cue) cue.style.opacity = String(Math.max(0, 1 - window.scrollY / 200));
      }
    }
    function onMove(event: MouseEvent) {
      const rect = hero!.getBoundingClientRect();
      hero!.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      hero!.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    hero.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      hero.removeEventListener("mousemove", onMove);
    };
  }, []);

  function go(next: number) {
    setIndex((next + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  return (
    <section
      className="hero"
      id="home"
      ref={heroRef}
      aria-roledescription="carousel"
      aria-label="College highlights"
      onTouchStart={(event) => {
        startX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        const delta = event.changedTouches[0].clientX - startX.current;
        if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
      }}
    >
      <div className="slides" ref={slidesRef}>
        {HERO_SLIDES.map((item, slideIndex) => (
          <div
            key={item.src}
            className={`slide${slideIndex === index ? " active" : ""}`}
            style={{ ["--img" as string]: `url('${item.src}')` }}
            aria-hidden={slideIndex !== index}
          >
            <div className="hero-text">
              <p className="eyebrow">{item.eyebrow}</p>
              <SplitHeading as="h1">
                {item.titleBefore}
                <em>{item.titleAccent}</em>
                {item.titleAfter}
              </SplitHeading>
              <p className="hero-kicker">O&apos; Level &amp; A&apos; Level · Boys&apos; boarding</p>
              <p className="hero-motto-line">{item.description}</p>
              <div className="row">
                <Link href={item.primary.href} className="btn btn-gold">
                  {item.primary.label}
                </Link>
                <Link href={item.secondary.href} className="btn btn-ghost">
                  {item.secondary.label}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-ui">
        <div className="counter">
          <b>{String(index + 1).padStart(2, "0")}</b> / {String(HERO_SLIDES.length).padStart(2, "0")}
        </div>
        <div className="dots">
          {HERO_SLIDES.map((item, slideIndex) => (
            <button
              key={item.src}
              type="button"
              className={slideIndex === index ? "on" : undefined}
              aria-label={`Slide ${slideIndex + 1}`}
              aria-current={slideIndex === index ? true : undefined}
              onClick={() => go(slideIndex)}
            />
          ))}
        </div>
        <div className="arrows">
          <button type="button" aria-label="Previous" onClick={() => go(index - 1)}>
            ←
          </button>
          <button type="button" aria-label="Next" onClick={() => go(index + 1)}>
            →
          </button>
        </div>
      </div>
      <div className="progress">
        <i style={{ width: barOn ? "100%" : "0%", transition: barOn ? `width ${DURATION}ms linear` : "none" }} />
      </div>
      <div className="scroll-cue" ref={cueRef} aria-hidden="true" />
    </section>
  );
}

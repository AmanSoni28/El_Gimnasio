"use client";

import { useRef } from "react";
import MagneticButton from "@/components/animations/MagneticButton";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { openJoin } from "@/lib/store";

/** Motion language: monumental. Words assemble out of depth while the brand rings turn and the gold light rises. */
export default function FinalCTA() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create("[data-cta-title]", { type: "words", wordsClass: "inline-block will-change-transform" });
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 60%", once: true } });
        tl.from(split.words, { yPercent: 60, z: -200, rotateX: -70, autoAlpha: 0, duration: 1.5, ease: "expo.out", stagger: 0.09 })
          .from("[data-cta-fade]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.6);
        gsap.fromTo(
          "[data-cta-rings]",
          { rotate: -25, scale: 0.85 },
          { rotate: 25, scale: 1.1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.fromTo(
          "[data-cta-glow]",
          { yPercent: 30, autoAlpha: 0.2 },
          { yPercent: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } },
        );
        return () => split.revert();
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="cta-title"
      data-section="cta"
      data-nav="contact"
      data-title="Comienza"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink py-32"
    >
      <div
        data-cta-glow
        aria-hidden
        className="pointer-events-none absolute -bottom-[30%] left-1/2 h-[110vmin] w-[110vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22),rgba(212,175,55,0.05)_45%,transparent_70%)]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-cta-rings
        src="/brand/logo-rings.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(120vmin,1100px)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.13]"
      />
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center text-center gutter [perspective:900px]">
        <p data-cta-fade className="label text-[0.6rem] text-gold">Tu próximo capítulo</p>
        <h2
          id="cta-title"
          data-cta-title
          className="mt-8 font-serif text-[clamp(2.9rem,9vw,9.5rem)] font-medium uppercase leading-[0.88] [transform-style:preserve-3d]"
        >
          Ready to become <br />
          <em className="text-gold-metal font-normal">stronger?</em>
        </h2>
        <p data-cta-fade className="mt-8 max-w-md text-[1.05rem] text-bone/70">
          Your next chapter begins with one decision.
        </p>
        <div data-cta-fade className="mt-12">
          <MagneticButton onClick={() => openJoin()} strength={0.45} className="px-10! py-5! text-[0.72rem]!" cursor="Go">
            Start your journey
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

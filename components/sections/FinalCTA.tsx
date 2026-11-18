"use client";

import { useRef } from "react";
import MagneticButton from "@/components/animations/MagneticButton";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { openJoin } from "@/lib/store";

/**
 * Motion language: monumental. Words assemble out of depth, the gold word is struck by light,
 * and a gold ring draws itself closed as you scroll in — "one decision" completes the circle.
 */
export default function FinalCTA() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Split only the bone line: splitting the gold word breaks its background-clip:text (renders invisible).
        const split = SplitText.create("[data-cta-words]", { type: "words", wordsClass: "inline-block will-change-transform" });
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 60%", once: true } });
        tl.from(split.words, { yPercent: 60, z: -200, rotateX: -70, autoAlpha: 0, duration: 1.5, ease: "expo.out", stagger: 0.09 })
          .fromTo(
            "[data-cta-gold]",
            { clipPath: "inset(0 100% 0 0)", backgroundPosition: "100% 0" },
            { clipPath: "inset(0 0% 0 0)", backgroundPosition: "0% 0", duration: 1.6, ease: "expo.inOut" },
            0.45,
          )
          .from("[data-cta-fade]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.7)
          .from("[data-cta-rule]", { scaleX: 0, duration: 1.4, ease: "expo.inOut" }, 1)
          .add(() => {
            // Slow metallic shimmer once revealed.
            gsap.to("[data-cta-gold]", { backgroundPosition: "100% 0", duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true });
          });

        const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo("[data-cta-rings]", { rotate: -25, scale: 0.85 }, { rotate: 25, scale: 1.1, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(
          "[data-cta-glow]",
          { yPercent: 30, autoAlpha: 0.2 },
          { yPercent: 0, autoAlpha: 1, ease: "none", scrollTrigger: { ...scrub, end: "center center" } },
        );

        // Decision ring: stroke draws closed while the spark rides its leading edge.
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 85%", end: "center center", scrub: 1 } })
          .fromTo("[data-cta-arc]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none" }, 0)
          .fromTo("[data-cta-spark]", { rotation: 0 }, { rotation: 360, svgOrigin: "50 50", ease: "none" }, 0);

        return () => split.revert();
      });

      // Pointer depth: background drifts against the cursor (desktop only).
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const el = root.current!;
        const depth = gsap.utils.toArray<HTMLElement>("[data-cta-depth]").map((node) => ({
          f: Number(node.dataset.ctaDepth),
          x: gsap.quickTo(node, "x", { duration: 1.2, ease: "power3.out" }),
          y: gsap.quickTo(node, "y", { duration: 1.2, ease: "power3.out" }),
        }));
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          depth.forEach((d) => (d.x(nx * d.f), d.y(ny * d.f)));
        };
        el.addEventListener("pointermove", move);
        return () => el.removeEventListener("pointermove", move);
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
      className="relative flex items-center justify-center overflow-hidden bg-ink py-24 sm:min-h-[100svh] sm:py-32"
    >
      <div data-cta-depth="-30" aria-hidden className="pointer-events-none absolute inset-0">
        <div
          data-cta-glow
          className="absolute -bottom-[30%] left-1/2 h-[110vmin] w-[110vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22),rgba(212,175,55,0.05)_45%,transparent_70%)]"
        />
      </div>

      <div data-cta-depth="40" aria-hidden className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-cta-rings
          src="/brand/logo-rings.webp"
          alt=""
          className="absolute left-1/2 top-1/2 w-[min(120vmin,1100px)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.13]"
        />
      </div>

      <div data-cta-depth="18" aria-hidden className="pointer-events-none absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="absolute left-1/2 top-1/2 w-[min(80vmin,780px)] -translate-x-1/2 -translate-y-1/2 overflow-visible drop-shadow-[0_0_10px_rgba(212,175,55,0.45)]"
        >
          <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.15" />
          <circle
            data-cta-arc
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="#d4af37"
            strokeWidth="0.2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            transform="rotate(-90 50 50)"
          />
          <g data-cta-spark>
            <circle cx="50" cy="1" r="1.4" fill="rgba(245,196,81,0.25)" />
            <circle cx="50" cy="1" r="0.5" fill="#f5c451" />
          </g>
        </svg>
      </div>

      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center text-center gutter [perspective:900px]">
        <p data-cta-fade className="label text-[0.6rem] text-gold">Tu próximo capítulo</p>
        <h2
          id="cta-title"
          className="mt-8 font-serif text-[clamp(2.9rem,9vw,9.5rem)] font-medium uppercase leading-[0.88] [transform-style:preserve-3d]"
        >
          <span data-cta-words className="block">
            Ready to become
          </span>
          <em data-cta-gold className="text-gold-metal inline-block pr-[0.08em] font-normal">
            stronger?
          </em>
        </h2>
        <p data-cta-fade className="mt-8 max-w-md text-[1.05rem] text-bone/70">
          Your next chapter begins with one decision.
        </p>
        <span data-cta-rule aria-hidden className="hairline mt-6 block w-40" />
        <div data-cta-fade className="relative mt-12">
          <span aria-hidden className="cta-halo pointer-events-none absolute inset-0 rounded-full" />
          <MagneticButton onClick={() => openJoin()} strength={0.45} className="px-10! py-5! text-[0.72rem]!" cursor="Go">
            Start your journey
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import LazyVideo from "@/components/ui/LazyVideo";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Motion language: a framed film that scroll-expands to full bleed, while the
 * two headline lines drift in opposite directions (sticky, scrubbed).
 */
export default function Showcase() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 0.5 };
        gsap.fromTo(
          "[data-sc-frame]",
          { clipPath: "inset(16% 14% 16% 14% round 18px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power1.inOut", scrollTrigger: { ...st, start: "top 90%", end: "center center" } },
        );
        gsap.fromTo("[data-sc-video]", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: st });
        gsap.fromTo("[data-sc-l1]", { xPercent: -18 }, { xPercent: 6, ease: "none", scrollTrigger: st });
        gsap.fromTo("[data-sc-l2]", { xPercent: 18 }, { xPercent: -6, ease: "none", scrollTrigger: st });
        gsap.from("[data-sc-meta]", {
          autoAlpha: 0,
          y: 20,
          stagger: 0.1,
          duration: 1,
          scrollTrigger: { trigger: root.current, start: "35% center", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Your limits are just the beginning" data-section="showcase" data-nav="programs" data-title="Límites" className="relative h-[200svh] bg-ink-2">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-sc-frame className="absolute inset-0 overflow-hidden will-change-[clip-path]">
          <div data-sc-video className="absolute inset-0 will-change-transform">
            <LazyVideo
              src="/media/showcase.mp4"
              poster="/media/posters/showcase.jpg"
              className="h-full w-full object-cover"
              label="A walk through the EL GIMNASIO training floor"
            />
          </div>
          <div className="absolute inset-0 bg-ink/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,8,8,0.75)_100%)]" />
          <div className="grain absolute inset-0" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center overflow-hidden text-center">
          <p data-sc-meta className="label mb-8 text-[0.6rem] text-gold sm:mb-10">Tu límite es solo el comienzo</p>
          <h2 className="w-full font-serif font-medium uppercase leading-[0.88]">
            <span data-sc-l1 className="block whitespace-nowrap text-[clamp(2.6rem,9.5vw,11rem)] will-change-transform">
              Your limits are
            </span>
            <span data-sc-l2 className="block whitespace-nowrap text-[clamp(2.6rem,9.5vw,11rem)] will-change-transform">
              just the <em className="text-gold-metal font-normal">beginning.</em>
            </span>
          </h2>
          <div data-sc-meta className="mt-10 flex items-center gap-4 sm:mt-14">
            <span className="block h-px w-10 bg-gold/60" />
            <span className="label text-[0.55rem] text-bone/60">EL GIMNASIO — The Gym</span>
            <span className="block h-px w-10 bg-gold/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

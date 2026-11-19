"use client";

import { useEffect, useRef } from "react";
import MagneticButton from "@/components/animations/MagneticButton";
import LazyVideo from "@/components/ui/LazyVideo";
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";
import { introPhase, useStore } from "@/lib/store";

export default function Hero() {
  const phase = useStore(introPhase, "pending");
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const mediaInner = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const cleanup = useRef<(() => void) | null>(null);

  // Revert only on unmount: reverting on the revealing→done phase change re-hid the copy mid-entrance.
  useEffect(() => () => cleanup.current?.(), []);

  /* Entrance: starts while the intro portal is still opening, so the two feel like one shot. */
  useEffect(() => {
    if (played.current || (phase !== "revealing" && phase !== "done")) return;
    played.current = true;
    const el = root.current!;
    const viaIntro = phase === "revealing";
    const reduce = prefersReducedMotion();
    let split: SplitText | null = null;

    const ctx = gsap.context(() => {
      const hidden = el.querySelectorAll(".hero-hide");
      if (reduce) {
        gsap.set(hidden, { visibility: "visible" });
        return;
      }
      // Gold word stays unsplit: per-char wrappers break its background-clip:text and it renders invisible.
      split = SplitText.create(el.querySelectorAll("[data-hero-line]"), { type: "chars", charsClass: "inline-block will-change-transform", ignore: "em" });
      const tl = gsap.timeline({ delay: viaIntro ? 0.1 : 0.15 });
      tl.set(hidden, { visibility: "visible" })
        // Source is 480p: keep zoom minimal so it isn't upscaled further.
        .fromTo(mediaInner.current, { scale: viaIntro ? 1.14 : 1.08 }, { scale: 1.01, duration: viaIntro ? 2.6 : 2.2, ease: "expo.out" }, 0)
        .from("[data-hero-rule]", { scaleX: 0, transformOrigin: "left", duration: 1.2, ease: "expo.inOut" }, 0.2)
        .from("[data-hero-kicker]", { yPercent: 120, duration: 1, ease: "expo.out" }, 0.4)
        .from(split.chars, { yPercent: 118, rotate: 5, duration: 1.25, ease: "expo.out", stagger: 0.018 }, 0.45)
        .from("[data-hero-line] em", { yPercent: 118, rotate: 5, filter: "blur(8px)", duration: 1.5, ease: "expo.out" }, 0.8)
        .from("[data-hero-sub]", { y: 24, autoAlpha: 0, duration: 1.1, ease: "power3.out" }, 1.1)
        .from("[data-hero-cta]", { y: 30, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, 1.25)
        .from("[data-hero-side]", { autoAlpha: 0, y: 16, duration: 1, stagger: 0.12 }, 1.4)
        .from("[data-hero-scroll]", { autoAlpha: 0, y: -10, duration: 1 }, 1.7);
    }, el);

    cleanup.current = () => {
      ctx.revert();
      split?.revert();
    };
  }, [phase]);

  /* Scroll + pointer parallax (desktop pointer only). */
  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(media.current, {
          yPercent: 22,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(content.current, {
          y: -110,
          autoAlpha: 0.0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "75% top", scrub: true },
        });
      });
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const mx = gsap.quickTo(media.current, "x", { duration: 1.4, ease: "power3" });
        const my = gsap.quickTo(media.current, "y", { duration: 1.4, ease: "power3" });
        const cx = gsap.quickTo(content.current, "x", { duration: 1.6, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          mx(nx * -26);
          my(ny * -18);
          cx(nx * 10);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="home"
      data-section="home"
      data-nav="home"
      data-title="Inicio"
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink"
    >
      {/* Media */}
      <div ref={media} className="absolute -inset-[2%] will-change-transform">
        <div ref={mediaInner} className="absolute inset-0 scale-[1.01] will-change-transform">
          <LazyVideo
            eager
            src="/media/hero.mp4"
            poster="/media/posters/hero.jpg"
            threshold={0.05}
            // Light, crisp grade: a touch brighter and punchier so the footage reads clearly.
            className="h-full w-full object-cover [filter:brightness(1.08)_contrast(1.08)_saturate(1.1)]"
            label="Inside EL GIMNASIO: the training floor overlooking the city"
          />
        </div>
      </div>

      {/* Grade: readable left, cinematic bottom, soft gold accent */}
      {/* Light grade: video stays clear; only the text area (left/bottom) and nav strip get shade. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.55)_0%,rgba(8,8,8,0.25)_40%,transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.45)_0%,transparent_16%,transparent_50%,rgba(8,8,8,0.8)_100%)]" />
      <div className="pointer-events-none absolute -bottom-1/3 -left-1/4 h-[90vh] w-[90vh] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_62%)]" />
      <div className="grain pointer-events-none absolute inset-0" />

      {/* Copy */}
      <div
        ref={content}
        className="relative z-10 flex h-full flex-col justify-end gutter pb-[max(5.5rem,12svh)] pt-[var(--nav-h)] will-change-transform"
      >
        <div className="hero-hide mb-6 flex items-center gap-4 sm:mb-8">
          <span data-hero-rule className="block h-px w-12 bg-gold sm:w-16" />
          <span className="mask-line">
            <span data-hero-kicker className="label block text-[0.6rem] tracking-[0.42em] text-gold sm:text-[0.68rem]">
              Fuerza • Disciplina • Excelencia
            </span>
          </span>
        </div>

        <h2 className="hero-hide font-serif text-[clamp(2.65rem,8.2vw,8.75rem)] [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] font-medium uppercase leading-[0.9] tracking-[-0.012em]">
          <span className="mask-line">
            <span data-hero-line className="block">
              Built by discipline.
            </span>
          </span>
          <span className="mask-line">
            <span data-hero-line className="block">
              Defined by <em className="text-gold-metal inline-block pr-[0.08em] font-normal italic [text-shadow:none]">strength.</em>
            </span>
          </span>
        </h2>

        <div className="mt-8 flex flex-col gap-8 sm:mt-10 lg:flex-row lg:items-end lg:justify-between">
          <p data-hero-sub className="hero-hide max-w-[34rem] text-[0.98rem] leading-relaxed text-bone/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] sm:text-[1.05rem]">
            Where strength meets purpose. Discover a better version of yourself at{" "}
            <span className="text-bone">EL GIMNASIO</span>.
          </p>
          <div className="hero-hide flex flex-col gap-3 xs:flex-row sm:gap-4">
            <div data-hero-cta>
              <MagneticButton onClick={() => scrollToId("about")} className="w-full xs:w-auto" cursor="Go">
                Explore the gym
              </MagneticButton>
            </div>
            <div data-hero-cta>
              <MagneticButton variant="ghost" onClick={() => scrollToId("programs")} className="w-full xs:w-auto">
                Discover our programs
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Side meta (desktop) */}
      <div className="pointer-events-none absolute right-[var(--gutter)] top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-6 lg:flex">
        <div data-hero-side className="hero-hide flex origin-right rotate-90 translate-x-[45%] items-center gap-3">
          <span className="label text-[0.56rem] text-bone/45">Buddha Tower</span>
          <span className="block h-px w-10 bg-gold/50" />
          <span className="label text-[0.56rem] text-gold/80">N° 01</span>
        </div>
      </div>

      {/* Rotating seal (desktop) */}
      <div data-hero-side className="hero-hide pointer-events-none absolute bottom-[12svh] right-[var(--gutter)] z-10 hidden h-32 w-32 xl:block">
        <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <path id="seal" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text className="fill-bone/55" style={{ fontSize: 13.5, letterSpacing: "0.38em", fontFamily: "var(--font-manrope)", fontWeight: 600 }}>
            <textPath href="#seal">EL GIMNASIO • THE GYM • FUERZA • </textPath>
          </text>
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.webp" alt="" className="absolute inset-0 m-auto w-12" />
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        data-hero-scroll
        onClick={() => scrollToId("about")}
        className="hero-hide absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 sm:bottom-8"
        aria-label="Scroll to discover"
      >
        <span className="label text-[0.52rem] text-bone/50">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-bone/15">
          <span className="scroll-dot absolute left-0 top-0 block h-1/3 w-px bg-gold-bright" />
        </span>
      </button>
    </section>
  );
}

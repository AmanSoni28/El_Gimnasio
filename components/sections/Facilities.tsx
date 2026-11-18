"use client";

import Image from "next/image";
import { useRef } from "react";
import RevealLines from "@/components/animations/RevealLines";
import SectionLabel from "@/components/ui/SectionLabel";
import { gsap, useGSAP } from "@/lib/gsap";
import staircase from "@/assets-src/images/staircase.png";

const ARCH_H = 146.7; // viewBox height for a 3 : 4.4 arch

/**
 * Motion language: architectural. A Spanish arch frames the staircase and
 * its gold outline draws itself with scroll; a counter climbs the same
 * calorie values printed on the real steps.
 */
export default function Facilities() {
  const root = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-arch]",
          { clipPath: "inset(100% 0% 0% 0% round 999px 999px 0 0)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)",
            duration: 1.8,
            ease: "expo.inOut",
            scrollTrigger: { trigger: "[data-arch]", start: "top 80%", once: true },
          },
        );
        gsap.fromTo(
          "[data-arch-img]",
          { yPercent: -8, scale: 1.18 },
          { yPercent: 8, scale: 1.05, ease: "none", scrollTrigger: { trigger: "[data-arch]", start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.fromTo(
          "[data-arch-line]",
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "[data-arch]", start: "top 75%", end: "bottom 60%", scrub: 0.6 } },
        );
        gsap.fromTo(
          "[data-esc-word]",
          { yPercent: 15 },
          { yPercent: -25, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.from("[data-mural]", {
          scale: 0.6,
          autoAlpha: 0,
          rotate: -20,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-mural]", start: "top 90%", once: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) =>
          gsap.from(el, { y: 30, autoAlpha: 0, duration: 1.1, scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
        );
      });

      // The counter runs for everyone (it is information, not decoration).
      const val = { v: 2.2 };
      gsap.to(val, {
        v: 3.0,
        ease: "none",
        scrollTrigger: { trigger: "[data-arch]", start: "top 70%", end: "bottom 50%", scrub: true },
        onUpdate: () => {
          if (counter.current) counter.current.textContent = (Math.round(val.v * 10) / 10).toFixed(2);
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="facility"
      data-section="facility"
      data-nav="facilities"
      data-title="La Escalera"
      className="relative overflow-hidden bg-ink py-20 sm:py-32 lg:py-44"
    >
      {/* Vertical outlined word */}
      <div
        data-esc-word
        aria-hidden
        className="pointer-events-none absolute left-[2vw] top-0 hidden select-none font-serif text-[12vw] uppercase leading-none text-outline [writing-mode:vertical-rl] lg:block"
      >
        Escalera
      </div>

      <div className="relative grid gap-16 gutter lg:grid-cols-12 lg:gap-8">
        {/* Copy column */}
        <div className="flex flex-col justify-between lg:col-span-5 lg:col-start-2 lg:py-10">
          <div>
            <SectionLabel index="04" es="La Escalera" en="The Facility" />
            <RevealLines
              className="mt-8 font-serif text-[clamp(2.6rem,6vw,6rem)] font-medium uppercase leading-[0.92]"
              lines={[
                "Every step",
                <>
                  <em className="text-gold-metal font-normal">counts.</em>
                </>,
              ]}
            />
            <p data-fade className="mt-8 max-w-md text-[1.02rem] leading-relaxed text-bone/70">
              The workout starts before you reach the floor. Our staircase is part of the training: each step is marked with
              the calories it burns, from the first stride to the final climb, beneath a mural celebrating every kind of athlete.
            </p>
          </div>

          {/* Counter */}
          <div data-fade className="mt-14 border-t border-line pt-8">
            <p className="label text-[0.58rem] text-mute">Calories per step · as marked</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-display text-[clamp(4.5rem,10vw,8.5rem)] leading-[0.8] text-bone">
                <span className="text-gold">−</span>
                <span ref={counter}>2.20</span>
              </span>
              <span className="mb-2 font-display text-2xl tracking-wider text-gold">CAL</span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="font-display text-sm text-bone/50">2.20</span>
              <span className="relative h-px flex-1 bg-bone/15">
                <span className="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-gold/20 to-gold" />
              </span>
              <span className="font-display text-sm text-gold">3.00</span>
            </div>
          </div>

          {/* Mural detail: the logo wall at the top of the stairs */}
          <div className="mt-14 flex items-center gap-6">
            <div data-mural className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36">
              <div className="absolute inset-0 overflow-hidden rounded-full border border-gold/50">
                <Image
                  src={staircase}
                  alt="The EL GIMNASIO logo mural at the top of the staircase"
                  fill
                  sizes="160px"
                  className="scale-[3.1] object-cover"
                  style={{ objectPosition: "50% 0%", transformOrigin: "54% 49%" }}
                />
              </div>
              <svg viewBox="0 0 200 200" className="spin-slow absolute -inset-5 h-[calc(100%+2.5rem)] w-[calc(100%+2.5rem)]" aria-hidden>
                <defs>
                  <path id="muralPath" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
                </defs>
                <text className="fill-gold/70" style={{ fontSize: 11, letterSpacing: "0.42em", fontFamily: "var(--font-manrope)", fontWeight: 600 }}>
                  <textPath href="#muralPath">CADA PASO CUENTA • EVERY STEP COUNTS • </textPath>
                </text>
              </svg>
            </div>
            <p data-fade className="text-sm leading-relaxed text-mute">
              Athletes in motion, from lifters to boxers to yogis, line the wall that greets you on the way up.
            </p>
          </div>
        </div>

        {/* Arch */}
        <div className="relative lg:col-span-5 lg:col-start-8">
          <div className="relative mx-auto aspect-[3/4.4] w-full max-w-[560px]">
            <div data-arch className="absolute inset-0 overflow-hidden rounded-t-[999px] [clip-path:inset(0_0_0_0_round_999px_999px_0_0)]">
              <div data-arch-img className="absolute inset-0 will-change-transform">
                <Image
                  src={staircase}
                  alt="The illuminated EL GIMNASIO staircase, each marble step labelled with the calories it burns"
                  fill
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  placeholder="blur"
                  quality={85}
                  className="object-cover object-[50%_60%]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/10" />
            </div>
            {/* Gold arch outline, offset outside the image */}
            <svg
              viewBox={`-4 -4 108 ${ARCH_H + 8}`}
              className="pointer-events-none absolute -inset-[3.7%] h-[107.4%] w-[107.4%] overflow-visible"
              aria-hidden
            >
              <path
                data-arch-line
                d={`M0,${ARCH_H + 4} L0,50 A50,50 0 0 1 100,50 L100,${ARCH_H + 4}`}
                fill="none"
                stroke="#d4af37"
                strokeWidth="0.35"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="0"
              />
            </svg>
            <span className="absolute -right-2 bottom-10 rotate-90 origin-bottom-right label text-[0.52rem] text-bone/50 sm:-right-4">
              Arquitectura del esfuerzo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

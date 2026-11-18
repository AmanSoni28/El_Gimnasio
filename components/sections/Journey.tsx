"use client";

import { useRef } from "react";
import MagneticButton from "@/components/animations/MagneticButton";
import RevealLines from "@/components/animations/RevealLines";
import SectionLabel from "@/components/ui/SectionLabel";
import { gsap, useGSAP } from "@/lib/gsap";
import { openJoin } from "@/lib/store";

const STEPS = [
  { n: "01", es: "Visita", title: "Book a visit", body: "Tour the training floors at Buddha Tower and feel the space before you commit." },
  { n: "02", es: "Conoce", title: "Meet your coach", body: "Talk through your goals, your history and the hours that fit your week." },
  { n: "03", es: "Planifica", title: "Get your plan", body: "Strength, boxing, yoga, functional or one-to-one: a programme built around you." },
  { n: "04", es: "Entrena", title: "Train with purpose", body: "Show up, put in the work, track the progress. Discipline does the rest." },
];

/**
 * Motion language: a path. A gold line draws through the four steps as you scroll,
 * and each step ignites the moment the line reaches it.
 */
export default function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 1024px)" },
        (ctx) => {
          const { motion, wide } = ctx.conditions!;
          const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
          if (!motion) {
            gsap.set("[data-step]", { "--lit": 1 });
            return;
          }
          gsap.from("[data-fade]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
          gsap.from(steps, { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.12, scrollTrigger: { trigger: "[data-steps]", start: "top 80%", once: true } });

          const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-steps]", start: wide ? "top 65%" : "top 70%", end: wide ? "bottom 55%" : "bottom 60%", scrub: 0.8 } });
          tl.fromTo("[data-path]", wide ? { scaleX: 0 } : { scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: "none", duration: 1 }, 0);
          steps.forEach((s, i) => tl.fromTo(s, { "--lit": 0 }, { "--lit": 1, duration: 0.12, ease: "none" }, (i / (steps.length - 1)) * 0.88));
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="journey"
      data-section="journey"
      data-nav="contact"
      data-title="Tu Camino"
      className="relative overflow-hidden bg-ink-2 py-20 sm:py-32"
    >
      <div className="pointer-events-none absolute -right-1/4 top-0 h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.08),transparent_65%)]" />

      <div className="gutter">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel index="06" es="Tu Camino" en="How to start" />
            <RevealLines
              className="mt-8 font-serif text-[clamp(2.4rem,5.5vw,5.2rem)] font-medium uppercase leading-[0.92]"
              lines={[
                "Four steps to",
                <>
                  a <em className="text-gold-metal font-normal">stronger</em> you.
                </>,
              ]}
            />
          </div>
          <div data-fade>
            <MagneticButton onClick={() => openJoin({ mode: "visit" })} cursor="Book">
              Start with step 01
            </MagneticButton>
          </div>
        </div>

        <ol data-steps className="relative mt-14 grid sm:mt-20 gap-12 pl-10 lg:grid-cols-4 lg:gap-10 lg:pl-0 lg:pt-14">
          {/* Track + drawn path: vertical on mobile, horizontal on desktop */}
          <span className="absolute bottom-0 left-[7px] top-0 w-px bg-line lg:inset-x-0 lg:bottom-auto lg:top-[7px] lg:h-px lg:w-auto" />
          <span
            data-path
            className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-gradient-to-b from-gold via-gold-bright to-gold lg:inset-x-0 lg:bottom-auto lg:top-[7px] lg:h-px lg:w-auto lg:origin-left lg:bg-gradient-to-r"
          />

          {STEPS.map((s) => (
            <li key={s.n} data-step className="group relative [--lit:0]">
              {/* Node */}
              <span className="absolute -left-10 top-0 flex h-[15px] w-[15px] items-center justify-center lg:left-0 lg:-top-14">
                <span className="absolute inset-0 rounded-full border border-gold/50 bg-ink-2" />
                <span
                  className="absolute inset-[3px] rounded-full bg-gold-bright shadow-[0_0_16px_rgba(245,196,81,0.9)]"
                  style={{ opacity: "var(--lit)", transform: "scale(var(--lit))" }}
                />
              </span>

              <div className="relative">
                <span className="text-outline block font-serif text-[clamp(3.5rem,6vw,5.5rem)] leading-none">{s.n}</span>
                <span
                  aria-hidden
                  className="text-gold-metal absolute left-0 top-0 block font-serif text-[clamp(3.5rem,6vw,5.5rem)] leading-none"
                  style={{ clipPath: "inset(calc((1 - var(--lit)) * 100%) 0 0 0)" }}
                >
                  {s.n}
                </span>
              </div>
              <p className="label mt-6 text-[0.58rem] text-gold/80">{s.es}</p>
              <h3 className="mt-2 font-serif text-2xl uppercase tracking-wide text-bone transition-colors duration-500 group-hover:text-gold-bright">
                {s.title}
              </h3>
              <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-mute">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

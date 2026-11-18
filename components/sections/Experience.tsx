"use client";

import Image from "next/image";
import { useRef } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { gsap, useGSAP } from "@/lib/gsap";
import interior from "@/assets-src/images/interior.png";

const FEATURES = [
  { n: "01", title: "Modern Equipment", es: "Equipamiento", text: "Plate-loaded and selectorised machines, racks and a full dumbbell wall.", x: 17, y: 50 },
  { n: "02", title: "Premium Environment", es: "Ambiente", text: "Floor-to-ceiling glass and the city skyline as your backdrop.", x: 47, y: 34 },
  { n: "03", title: "Workout Spaces", es: "Espacios", text: "An open free-weight floor with room to move, lift and focus.", x: 54, y: 68 },
  { n: "04", title: "Professional Atmosphere", es: "Atmósfera", text: "Warm light, clean lines and a culture of focused, coached training.", x: 87, y: 56 },
];

/**
 * Motion language: pinned, scroll-scrubbed circular aperture that opens
 * onto the training floor, then feature hotspots light up one by one.
 */
export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 768px)",
        },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
          if (!motion) {
            gsap.set("[data-hotspot]", { autoAlpha: 1 });
            return;
          }

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: "[data-exp-pin]",
              start: "top top",
              end: desktop ? "+=230%" : "+=170%",
              scrub: 0.6,
              pin: true,
              anticipatePin: 1,
            },
          });

          tl.fromTo("[data-exp-aperture]", { clipPath: "circle(13% at 50% 55%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 1 }, 0)
            .fromTo("[data-exp-img]", { scale: 1.35 }, { scale: 1.02, duration: 1.2 }, 0)
            .fromTo("[data-exp-ring]", { scale: 1, autoAlpha: 1 }, { scale: 6, autoAlpha: 0, duration: 0.7 }, 0)
            .to("[data-exp-title]", { scale: 1.5, autoAlpha: 0, duration: 0.55 }, 0)
            .fromTo("[data-exp-shade]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.85);

          if (desktop) {
            gsap.utils.toArray<HTMLElement>("[data-hotspot]").forEach((h, i) => {
              tl.fromTo(h, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" }, 1.0 + i * 0.16);
              tl.fromTo(h.querySelector("[data-hs-line]"), { scaleY: 0 }, { scaleY: 1, duration: 0.15 }, 1.0 + i * 0.16);
            });
            tl.to({}, { duration: 0.35 });
          } else {
            const items = gsap.utils.toArray<HTMLElement>("[data-exp-mobile] li");
            items.forEach((li, i) => tl.fromTo(li, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.15 }, 0.9 + i * 0.12));
            tl.to({}, { duration: 0.25 });
          }
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="facilities"
      data-section="facilities"
      data-nav="facilities"
      data-title="Instalaciones"
      className="relative bg-ink"
    >
      <div data-exp-pin className="relative h-[100svh] overflow-hidden">
        {/* Opening title over black */}
        <div data-exp-title className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-start pt-[14svh] text-center gutter">
          <SectionLabel index="02" es="La Experiencia" en="The Experience" align="center" />
          <h2 className="mt-6 font-serif text-[clamp(2.4rem,6vw,5.8rem)] font-medium uppercase leading-[0.92]">
            Step <em className="text-gold-metal font-normal">inside.</em>
          </h2>
        </div>

        {/* Aperture */}
        <div data-exp-aperture className="absolute inset-0 z-[2] [clip-path:circle(75%_at_50%_50%)] will-change-[clip-path]">
          <div data-exp-img className="absolute inset-0 will-change-transform">
            <Image
              src={interior}
              alt="The EL GIMNASIO training floor with plate-loaded machines, benches and a dumbbell wall beside panoramic city windows"
              fill
              sizes="100vw"
              placeholder="blur"
              quality={85}
              className="object-cover"
            />
          </div>
          <div data-exp-shade className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.55),rgba(8,8,8,0.05)_35%,rgba(8,8,8,0.15)_60%,rgba(8,8,8,0.9))]" />
        </div>

        {/* Gold aperture ring */}
        <div
          data-exp-ring
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[55%] z-[3] aspect-square w-[26vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/70"
        />

        {/* Desktop hotspots */}
        <ul className="absolute inset-0 z-[4] hidden md:block">
          {FEATURES.map((f) => (
            <li
              key={f.n}
              data-hotspot
              className="invisible absolute w-[15.5rem]"
              style={{ left: `${f.x}%`, top: `${f.y}%`, transform: "translate(-50%, 0)" }}
            >
              <span className="absolute left-1/2 top-0 block h-3 w-3 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/60" />
                <span className="absolute inset-0 rounded-full border border-ink bg-gold-bright" />
              </span>
              <span data-hs-line className="absolute left-1/2 top-2 block h-12 w-px origin-top bg-gold/70" />
              <div className="mt-14 rounded-sm border border-bone/10 bg-ink/70 p-4 backdrop-blur-md">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-sm text-gold">{f.n}</span>
                  <span className="label text-[0.5rem] text-mute">{f.es}</span>
                </div>
                <h3 className="mt-1 font-serif text-xl leading-tight">{f.title}</h3>
                <p className="mt-1.5 text-[0.78rem] leading-snug text-bone/65">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Mobile list */}
        <div className="absolute inset-x-0 bottom-0 z-[4] gutter pb-10 md:hidden">
          <p className="label mb-4 text-[0.55rem] text-gold">The floor</p>
          <ul data-exp-mobile className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f.n} className="flex gap-3 border-l border-gold/60 pl-3">
                <span className="font-display text-sm text-gold">{f.n}</span>
                <div>
                  <h3 className="font-serif text-lg leading-tight">{f.title}</h3>
                  <p className="text-[0.75rem] leading-snug text-bone/65">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

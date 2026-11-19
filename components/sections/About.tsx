"use client";

import Image from "next/image";
import { useRef } from "react";
import RevealLines from "@/components/animations/RevealLines";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionLabel from "@/components/ui/SectionLabel";
import { gsap, useGSAP } from "@/lib/gsap";
import trainer from "@/assets-src/images/trainer-boxing.png";

const PILLARS = [
  { es: "Fuerza", en: "Strength", text: "Progressive, intelligent training that builds power you keep." },
  { es: "Disciplina", en: "Discipline", text: "Structure, consistency and coaching that turn effort into habit." },
  { es: "Excelencia", en: "Excellence", text: "A space, equipment and standard designed without compromise." },
];

/** Motion language: vertical curtain wipe + inner counter-parallax + staggered editorial lines. */
export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Curtain wipe on the main image, then slow parallax inside it
        gsap.fromTo(
          "[data-about-frame]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.6,
            ease: "expo.inOut",
            scrollTrigger: { trigger: "[data-about-frame]", start: "top 85%", once: true },
          },
        );
        gsap.fromTo(
          "[data-about-img]",
          { yPercent: -10, scale: 1.25 },
          {
            yPercent: 10,
            scale: 1.12,
            ease: "none",
            scrollTrigger: { trigger: "[data-about-frame]", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.from("[data-about-inset]", {
          y: 120,
          ease: "none",
          scrollTrigger: { trigger: "[data-about-frame]", start: "top bottom", end: "bottom center", scrub: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) =>
          gsap.from(el, {
            y: 30,
            autoAlpha: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
        );
        gsap.from("[data-pillar]", {
          y: 50,
          autoAlpha: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-pillars]", start: "top 85%", once: true },
        });
        gsap.from("[data-pillar-line]", {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1.4,
          stagger: 0.12,
          ease: "expo.inOut",
          scrollTrigger: { trigger: "[data-pillars]", start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="about"
      data-section="about"
      data-nav="about"
      data-title="Nosotros"
      className="relative overflow-hidden bg-ink py-20 sm:py-32 lg:py-44"
    >
      {/* Oversized background word */}
      <div aria-hidden className="pointer-events-none absolute -top-6 right-0 select-none font-serif text-[22vw] uppercase leading-none text-outline lg:text-[15vw]">
        Vida
      </div>

      <div className="relative grid gap-16 gutter lg:grid-cols-12 lg:gap-10">
        {/* Copy */}
        <div className="lg:col-span-6 lg:pr-8 xl:col-span-6">
          <SectionLabel index="01" es="Nosotros" en="About" />
          <RevealLines
            className="mt-8 font-serif text-[clamp(2.6rem,6.4vw,6.2rem)] font-medium uppercase leading-[0.92]"
            lines={[
              "More than a gym.",
              <>
                A way of <em className="text-gold-metal font-normal">life.</em>
              </>,
            ]}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
            <span data-fade className="label hidden pt-2 text-[0.58rem] text-gold sm:block">
              Manifiesto
            </span>
            <div className="space-y-5 text-[1.02rem] leading-relaxed text-bone/70">
              <p data-scrub-text>
                EL GIMNASIO was built on a simple belief: strength is earned, not given. Every detail of our space — from the
                calorie-marked staircase to the training floor framed by the city skyline — is designed to keep you moving forward.
              </p>
              <p data-scrub-text>
                Here, beginners and athletes train side by side under one standard. No shortcuts. No noise. Just purposeful work,
                expert guidance and a community that holds you to your best.
              </p>
            </div>
          </div>

          <div data-pillars className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {PILLARS.map((p, i) => (
              <div data-pillar key={p.es}>
                <span data-pillar-line className="mb-5 block h-px w-full bg-gradient-to-r from-gold to-transparent" />
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-xl text-gold">0{i + 1}</span>
                  <h3 className="font-serif text-2xl italic">{p.es}</h3>
                </div>
                <p className="label mt-1 text-[0.55rem] text-mute/70">{p.en}</p>
                <p className="mt-3 text-sm leading-relaxed text-mute">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Imagery */}
        <div className="relative lg:col-span-6 xl:col-span-5 xl:col-start-8">
          <div data-about-frame className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] sm:aspect-[5/6] lg:aspect-[4/5.4]">
            <div data-about-img className="absolute inset-0 will-change-transform">
              <Image
                src={trainer}
                alt="An EL GIMNASIO coach shadow-boxing on the functional turf"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                placeholder="blur"
                className="object-cover object-[50%_30%]"
                quality={85}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <span className="label text-[0.55rem] text-bone/80">Entrenamiento funcional</span>
              <span className="font-display text-sm text-gold">EG — 01</span>
            </div>
          </div>

          {/* Inset group-training clip */}
          <div
            data-about-inset
            className="absolute -bottom-12 -left-4 w-[42%] overflow-hidden rounded-[2px] border border-gold/30 shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:-left-10 lg:-left-16 lg:w-[46%]"
          >
            <div className="relative aspect-[3/4]">
              <LazyVideo src="/media/group.mp4" poster="/media/posters/group.jpg" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-3">
                <span className="label text-[0.5rem] text-gold-bright">Sesiones de grupo</span>
              </div>
            </div>
          </div>

          {/* Gold frame accent */}
          <div aria-hidden className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 border-r border-t border-gold/60 sm:-right-5 sm:-top-5" />
        </div>
      </div>
    </section>
  );
}

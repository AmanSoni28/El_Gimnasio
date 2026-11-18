"use client";

import Image from "next/image";
import { useRef } from "react";
import MagneticButton from "@/components/animations/MagneticButton";
import RevealLines from "@/components/animations/RevealLines";
import SectionLabel from "@/components/ui/SectionLabel";
import { CONTACT } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { openJoin, showToast } from "@/lib/store";
import exterior from "@/assets-src/images/exterior.png";

const ROWS = [
  { k: "Building", es: "Edificio", v: `${CONTACT.building}, upper floors`, placeholder: false },
  { k: "Address", es: "Dirección", v: `${CONTACT.address}\n${CONTACT.city}`, placeholder: true },
  { k: "Phone", es: "Teléfono", v: CONTACT.phone, placeholder: true },
  { k: "Email", es: "Correo", v: CONTACT.email, placeholder: true },
  { k: "Hours", es: "Horario", v: CONTACT.hours, placeholder: true },
];

/** Motion language: window-blind slats lift off the building (echoing its façade), details tick in row by row. */
export default function Location() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-slat]", {
          scaleY: 0,
          duration: 1.3,
          ease: "expo.inOut",
          stagger: { each: 0.09, from: "start" },
          scrollTrigger: { trigger: "[data-building]", start: "top 75%", once: true },
        });
        gsap.fromTo(
          "[data-building-img]",
          { scale: 1.2 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-building]", start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.from("[data-row]", {
          y: 24,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-rows]", start: "top 85%", once: true },
        });
        gsap.from("[data-row-line]", {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1.2,
          stagger: 0.08,
          ease: "expo.inOut",
          scrollTrigger: { trigger: "[data-rows]", start: "top 85%", once: true },
        });
        gsap.from("[data-fade]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-slat]", { scaleY: 0 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="contact"
      data-section="contact"
      data-nav="contact"
      data-title="Encuéntranos"
      className="relative overflow-hidden bg-ink py-28 sm:py-36 lg:py-44"
    >
      <div className="grid gap-16 gutter lg:grid-cols-12 lg:gap-10">
        {/* Building */}
        <div className="relative lg:col-span-5">
          <div data-building className="relative aspect-[945/1400] w-full overflow-hidden rounded-[3px]">
            <div data-building-img className="absolute inset-0 will-change-transform">
              <Image
                src={exterior}
                alt="Buddha Tower at dusk, with EL GIMNASIO — The Gym on its illuminated upper floors"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                placeholder="blur"
                quality={85}
                className="object-cover object-[50%_25%]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            {/* Blinds */}
            <div aria-hidden className="absolute inset-0 flex">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} data-slat className="block h-full flex-1 origin-top bg-ink" />
              ))}
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <span className="label text-[0.55rem] text-bone/85">Buddha Tower</span>
              <span className="label text-[0.55rem] text-gold">Nuestra casa</span>
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 border-b border-l border-gold/60 sm:-bottom-6 sm:-left-6" />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          <SectionLabel index="06" es="Encuéntranos" en="Location" />
          <RevealLines
            className="mt-8 font-serif text-[clamp(2.5rem,6vw,5.8rem)] font-medium uppercase leading-[0.92]"
            lines={[
              "Your journey",
              <>
                starts <em className="text-gold-metal font-normal">here.</em>
              </>,
            ]}
          />
          <p data-fade className="mt-8 max-w-lg text-[1.02rem] leading-relaxed text-bone/70">
            Find us on the upper floors of Buddha Tower: glass-fronted training floors lit up above the street. Come for a tour, meet
            the coaches and feel the space for yourself.
          </p>

          <dl data-rows className="mt-12">
            {ROWS.map((r) => (
              <div data-row key={r.k} className="relative grid grid-cols-[7.5rem_1fr] gap-4 py-5 sm:grid-cols-[10rem_1fr]">
                <span data-row-line className="absolute inset-x-0 top-0 block h-px bg-line" />
                <dt>
                  <span className="label block text-[0.58rem] text-bone/80">{r.k}</span>
                  <span className="mt-1 block font-serif text-sm italic text-mute/80">{r.es}</span>
                </dt>
                <dd className={`whitespace-pre-line text-[0.98rem] ${r.placeholder ? "text-mute/60" : "text-bone"}`}>{r.v}</dd>
              </div>
            ))}
            <div data-row className="relative grid grid-cols-[7.5rem_1fr] gap-4 py-5 sm:grid-cols-[10rem_1fr]">
              <span data-row-line className="absolute inset-x-0 top-0 block h-px bg-line" />
              <dt>
                <span className="label block text-[0.58rem] text-bone/80">Social</span>
                <span className="mt-1 block font-serif text-sm italic text-mute/80">Síguenos</span>
              </dt>
              <dd>
                <a
                  href={CONTACT.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[0.98rem] text-bone transition-colors hover:text-gold-bright"
                >
                  Instagram · {CONTACT.instagram.handle}
                  <span className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </a>
              </dd>
            </div>
            <span className="block h-px bg-line" />
          </dl>

          <div data-fade className="mt-10 flex flex-col gap-3 xs:flex-row sm:gap-4">
            <MagneticButton onClick={() => openJoin({ mode: "visit" })} cursor="Book">
              Book a visit
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={() => showToast("Directions will be linked once the address is confirmed.")}>
              Get directions
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}

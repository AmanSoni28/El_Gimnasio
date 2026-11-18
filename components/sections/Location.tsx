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

const ROW_HOVER_LINE =
  "absolute inset-x-0 top-0 block h-px origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-bright to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100";
const ROW_HOVER_SHIFT = "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5";

/**
 * Motion language: the photo is unveiled bottom-up like a lift rising through the tower,
 * gold frame corners draw in, a light sweep glides across the glass floors and a beacon
 * pins the gym's floors. Details tick in row by row; the card tilts toward the pointer.
 */
export default function Location() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: "[data-building]", start: "top 75%", once: true } })
          .fromTo("[data-building]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" })
          .from("[data-building-photo]", { scale: 1.35, duration: 2.2, ease: "expo.out" }, 0.2)
          .from("[data-corner]", { scale: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 }, 1)
          .from("[data-beacon]", { autoAlpha: 0, y: 14, duration: 0.9 }, 1.3)
          .from("[data-beacon-line]", { scaleX: 0, transformOrigin: "left", duration: 0.9, ease: "expo.inOut" }, 1.45)
          .from("[data-caption]", { autoAlpha: 0, y: 10, duration: 0.8, stagger: 0.1 }, 1.4)
          .fromTo("[data-sweep]", { xPercent: -160 }, { xPercent: 360, duration: 2.4, ease: "power2.inOut", repeat: -1, repeatDelay: 5 }, 1.2);
        gsap.fromTo(
          "[data-building-img]",
          { scale: 1.12, yPercent: -3 },
          { scale: 1, yPercent: 3, ease: "none", scrollTrigger: { trigger: "[data-building]", start: "top bottom", end: "bottom top", scrub: true } },
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
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const card = root.current!.querySelector<HTMLElement>("[data-tilt]")!;
        const rx = gsap.quickTo(card, "rotationX", { duration: 1.2, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 1.2, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(((e.clientY - r.top) / r.height - 0.5) * -7);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        return () => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        };
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
        <div className="relative lg:col-span-5 [perspective:1400px]">
          <div data-tilt className="group relative [transform-style:preserve-3d]">
            <div data-building className="relative aspect-[945/1400] w-full overflow-hidden rounded-[3px] bg-ink-2">
              <div data-building-img className="absolute inset-0 will-change-transform">
                <div data-building-photo className="absolute inset-0">
                  <Image
                    src={exterior}
                    alt="Buddha Tower at dusk, with EL GIMNASIO — The Gym on its illuminated upper floors"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    placeholder="blur"
                    quality={90}
                    className="object-cover object-[50%_25%] saturate-[0.82] brightness-[0.9] transition-[filter] duration-1000 group-hover:saturate-100 group-hover:brightness-100"
                  />
                </div>
              </div>
              {/* Grade + vignette pull the bright façade into the site's dark, gold palette */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_45%,rgba(8,8,8,0.55)_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              {/* Light sweep across the glass */}
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-soft-light">
                <span data-sweep className="absolute -inset-y-1/4 left-0 block w-1/3 rotate-[18deg] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </div>

              {/* Beacon on the gym floors */}
              <div data-beacon className="absolute left-[22%] top-[16%] flex items-center">
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70" />
                  <span className="absolute -inset-2 rounded-full border border-gold/40" />
                  <span className="relative block h-2 w-2 rounded-full bg-gold-bright shadow-[0_0_14px_rgba(245,196,81,0.9)]" />
                </span>
                <span data-beacon-line className="block h-px w-10 bg-gold/70 sm:w-14" />
                <span className="rounded-[2px] border border-gold/30 bg-ink/60 px-3 py-2 backdrop-blur-md">
                  <span className="label block text-[0.5rem] text-gold">Estamos aquí</span>
                  <span className="mt-0.5 block font-serif text-sm italic text-bone">Upper floors</span>
                </span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <span data-caption className="label text-[0.55rem] text-bone/85">Buddha Tower</span>
                <span data-caption className="label text-[0.55rem] text-gold">Nuestra casa</span>
              </div>
            </div>
            {/* Gold frame corners */}
            <span
              data-corner
              aria-hidden
              className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 origin-bottom-left border-b border-l border-gold/60 sm:-bottom-6 sm:-left-6"
            />
            <span
              data-corner
              aria-hidden
              className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 origin-top-right border-r border-t border-gold/60 sm:-right-6 sm:-top-6"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          <SectionLabel index="07" es="Encuéntranos" en="Location" />
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
            {ROWS.map((r, i) => (
              <div data-row key={r.k} className="group relative grid grid-cols-[7.5rem_1fr] gap-4 py-5 sm:grid-cols-[10rem_1fr]">
                <span data-row-line className="absolute inset-x-0 top-0 block h-px bg-line" />
                <span className={ROW_HOVER_LINE} />
                <dt>
                  <span className="label block text-[0.58rem] text-bone/80">
                    <span className="mr-2 text-gold/70">0{i + 1}</span>
                    {r.k}
                  </span>
                  <span className="mt-1 block font-serif text-sm italic text-mute/80">{r.es}</span>
                </dt>
                <dd className={`whitespace-pre-line text-[0.98rem] ${ROW_HOVER_SHIFT} ${r.placeholder ? "text-mute/60" : "text-bone"}`}>{r.v}</dd>
              </div>
            ))}
            <div data-row className="group relative grid grid-cols-[7.5rem_1fr] gap-4 py-5 sm:grid-cols-[10rem_1fr]">
              <span data-row-line className="absolute inset-x-0 top-0 block h-px bg-line" />
              <span className={ROW_HOVER_LINE} />
              <dt>
                <span className="label block text-[0.58rem] text-bone/80">
                  <span className="mr-2 text-gold/70">0{ROWS.length + 1}</span>
                  Social
                </span>
                <span className="mt-1 block font-serif text-sm italic text-mute/80">Síguenos</span>
              </dt>
              <dd className={ROW_HOVER_SHIFT}>
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

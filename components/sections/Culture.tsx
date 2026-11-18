"use client";

import { useRef, useState } from "react";
import RevealLines from "@/components/animations/RevealLines";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionLabel from "@/components/ui/SectionLabel";
import { CONTACT } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFinePointer } from "@/lib/hooks";

type TileData = { src: string; poster: string; es: string; title: string; aspect: string; featured?: boolean };

const T = {
  boxing: { src: "/media/culture-boxing.mp4", poster: "/media/posters/culture-boxing.jpg", es: "Boxeo", title: "Fight-ready conditioning", aspect: "aspect-[3/4.4]" },
  group: { src: "/media/culture-group.mp4", poster: "/media/posters/culture-group.jpg", es: "Comunidad", title: "Energy you can feel", aspect: "aspect-[3/4]", featured: true },
  coach: { src: "/media/culture-coach.mp4", poster: "/media/posters/culture-coach.jpg", es: "Entrenadores", title: "Coaches on the floor", aspect: "aspect-[4/5]" },
  functional: { src: "/media/culture-functional.mp4", poster: "/media/posters/culture-functional.jpg", es: "Funcional", title: "Grip, hang, conquer", aspect: "aspect-[3/4.6]" },
  yoga: { src: "/media/yoga.mp4", poster: "/media/posters/yoga.jpg", es: "Equilibrio", title: "Control and balance", aspect: "aspect-[4/5]" },
} satisfies Record<string, TileData>;

function Tile({ t, n, className = "" }: { t: TileData; n: number; className?: string }) {
  const fine = useFinePointer();
  const [hover, setHover] = useState(false);
  const [tapped, setTapped] = useState(false);
  const playing = t.featured || (fine ? hover : tapped);

  return (
    <figure
      data-tile
      data-cursor={fine && !t.featured ? "Play" : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      onClick={() => !fine && setTapped((v) => !v)}
      className={`group relative overflow-hidden rounded-[3px] bg-ink-3 ${t.aspect} ${className}`}
    >
      <div data-tile-media className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.06]">
        <LazyVideo src={t.src} poster={t.poster} active={playing} threshold={0.4} className="h-full w-full object-cover" />
      </div>
      {/* Gold spotlight that follows the pointer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-100 bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),rgba(245,196,81,0.55),transparent_60%)]" />
      {/* Gold scan line that leads the reveal */}
      <span data-tile-scan aria-hidden className="pointer-events-none absolute inset-x-0 top-full block h-[2px] bg-gold-bright opacity-0 shadow-[0_0_24px_4px_rgba(245,196,81,0.7)]" />
      <div
        className={`absolute inset-0 transition-[background-color] duration-700 ${playing ? "bg-ink/10" : "bg-ink/45"} [filter:none]`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
      {/* Inset gold frame + index */}
      <div className="pointer-events-none absolute inset-3 rounded-[2px] border border-gold/0 transition-colors duration-700 group-hover:border-gold/45" />
      <span className="label pointer-events-none absolute left-4 top-4 flex items-center gap-2 text-[0.5rem] text-bone/70 sm:left-5 sm:top-5">
        <span className="text-gold">0{n}</span>
        <span className="block h-px w-4 bg-bone/40 transition-all duration-700 group-hover:w-8 group-hover:bg-gold" />
        <span>05</span>
      </span>
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div className="translate-y-1 transition-transform duration-700 ease-lux group-hover:translate-y-0">
          <p className="label text-[0.5rem] text-gold">{t.es}</p>
          <p className="mt-1 font-serif text-lg leading-tight sm:text-xl">{t.title}</p>
        </div>
        {!t.featured && (
          <span
            aria-hidden
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
              playing ? "border-gold bg-gold text-ink" : "border-bone/30 text-bone/70"
            }`}
          >
            {playing ? (
              <svg viewBox="0 0 10 10" className="h-2.5 w-2.5">
                <path d="M2 1.5v7M8 1.5v7" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            ) : (
              <svg viewBox="0 0 10 10" className="ml-0.5 h-2.5 w-2.5">
                <path d="M2 1l7 4-7 4z" fill="currentColor" />
              </svg>
            )}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * Motion language: layered collage whose columns travel at different speeds. Each film is
 * unveiled bottom-up behind a glowing gold scan line; on hover a gold spotlight follows the
 * pointer and a fine frame draws in. Closes with an invitation to follow the community.
 */
export default function Culture() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((col) => {
          const speed = parseFloat(col.dataset.speed || "0") * (window.innerWidth < 768 ? 0.4 : 1);
          gsap.fromTo(
            col,
            { y: -speed },
            { y: speed, ease: "none", scrollTrigger: { trigger: "[data-collage]", start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
        gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((tile, i) => {
          const q = gsap.utils.selector(tile);
          gsap
            .timeline({ delay: (i % 3) * 0.1, scrollTrigger: { trigger: tile, start: "top 92%", once: true } })
            .fromTo(tile, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, 0)
            .fromTo(q("[data-tile-scan]"), { top: "100%", autoAlpha: 1 }, { top: "0%", duration: 1.5, ease: "expo.inOut" }, 0)
            .to(q("[data-tile-scan]"), { autoAlpha: 0, duration: 0.4 }, 1.3)
            .from(q("[data-tile-media]"), { scale: 1.3, duration: 2, ease: "expo.out" }, 0.2)
            .from(q("figcaption, .label"), { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 1);
        });
        // Follow CTA: handle rises in, gold rule draws.
        gsap
          .timeline({ scrollTrigger: { trigger: "[data-follow]", start: "top 85%", once: true } })
          .from("[data-follow-line]", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.08 })
          .from("[data-follow-rule]", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0.2);
        gsap.from("[data-fade]", {
          y: 26,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="trainers"
      data-section="trainers"
      data-nav="trainers"
      data-title="Cultura"
      className="relative overflow-hidden bg-ink-2 pt-20 sm:pt-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 hairline opacity-40" />
      <div className="grid gap-8 gutter lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionLabel index="05" es="Entrenadores & Cultura" en="Training Culture" />
          <RevealLines
            className="mt-8 font-serif text-[clamp(2.5rem,6vw,5.8rem)] font-medium uppercase leading-[0.92]"
            lines={[
              "The people.",
              <>
                The <em className="text-gold-metal font-normal">energy.</em>
              </>,
            ]}
          />
        </div>
        <div className="flex items-end lg:col-span-4 lg:col-start-9">
          <p data-fade className="text-[0.98rem] leading-relaxed text-mute">
            Coaches who lead from the floor. A community that shows up, pushes hard and celebrates every rep. This is the culture you
            train in at EL GIMNASIO.
          </p>
        </div>
      </div>

      {/* Collage */}
      <div data-collage className="relative mt-12 grid grid-cols-2 gap-3 gutter pb-20 sm:mt-16 sm:gap-4 md:grid-cols-3 md:gap-6 sm:pb-32">
        <div data-speed="-40" className="flex flex-col gap-3 sm:gap-4 md:gap-6">
          <Tile t={T.boxing} n={1} />
          <div data-fade className="hidden border-l border-gold/50 py-2 pl-5 md:block">
            <p className="font-serif text-2xl italic leading-snug text-bone/90">
              “Show up. Do the work. <span className="text-gold-bright">Repeat.</span>”
            </p>
            <p className="label mt-3 text-[0.52rem] text-mute">El código del gimnasio</p>
          </div>
        </div>
        <div data-speed="50" className="flex flex-col gap-3 pt-14 sm:gap-4 md:gap-6 md:pt-28">
          <Tile t={T.group} n={2} />
          <Tile t={T.coach} n={3} />
        </div>
        <div data-speed="-80" className="col-span-2 grid grid-cols-2 gap-3 sm:gap-4 md:col-span-1 md:flex md:flex-col md:gap-6 md:pt-10">
          <Tile t={T.functional} n={4} />
          <Tile t={T.yoga} n={5} />
        </div>
      </div>

      {/* Follow the community: outlined handle fills with gold from the left on hover */}
      <a
        data-follow
        href={CONTACT.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="Follow"
        className="group relative block border-t border-line py-12 gutter sm:py-20"
      >
        <span data-follow-rule className="absolute inset-x-0 top-0 block h-px origin-left bg-gradient-to-r from-gold via-gold-bright to-transparent" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mask-line">
              <span data-follow-line className="label block text-[0.58rem] text-gold">
                Síguenos · Join the energy online
              </span>
            </span>
            <span className="mask-line mt-4">
              <span data-follow-line className="relative block font-serif text-[clamp(2.2rem,7vw,7rem)] lowercase leading-[1.05]">
                <span className="text-outline">{CONTACT.instagram.handle}</span>
                <span
                  aria-hidden
                  className="text-gold-metal absolute inset-0 [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-[1100ms] ease-lux group-hover:[clip-path:inset(0_0%_0_0)]"
                >
                  {CONTACT.instagram.handle}
                </span>
              </span>
            </span>
          </div>
          <span className="mask-line">
            <span
              data-follow-line
              className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-2xl text-gold transition-all duration-700 ease-lux group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-ink sm:h-20 sm:w-20"
            >
              ↗
            </span>
          </span>
        </div>
      </a>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import RevealLines from "@/components/animations/RevealLines";
import LazyVideo from "@/components/ui/LazyVideo";
import SectionLabel from "@/components/ui/SectionLabel";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFinePointer } from "@/lib/hooks";

type TileData = { src: string; poster: string; es: string; title: string; aspect: string; featured?: boolean };

const T = {
  boxing: { src: "/media/boxing.mp4", poster: "/media/posters/boxing.jpg", es: "Boxeo", title: "Fight-ready conditioning", aspect: "aspect-[3/4.4]" },
  group: { src: "/media/group.mp4", poster: "/media/posters/group.jpg", es: "Comunidad", title: "Energy you can feel", aspect: "aspect-[3/4]", featured: true },
  coach: { src: "/media/personal.mp4", poster: "/media/posters/personal.jpg", es: "Entrenadores", title: "Coaches on the floor", aspect: "aspect-square" },
  functional: { src: "/media/functional.mp4", poster: "/media/posters/functional.jpg", es: "Funcional", title: "Grip, hang, conquer", aspect: "aspect-[3/4.6]" },
  yoga: { src: "/media/yoga.mp4", poster: "/media/posters/yoga.jpg", es: "Equilibrio", title: "Control and balance", aspect: "aspect-[4/5]" },
} satisfies Record<string, TileData>;

function Tile({ t, className = "" }: { t: TileData; className?: string }) {
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
      onClick={() => !fine && setTapped((v) => !v)}
      className={`group relative overflow-hidden rounded-[3px] bg-ink-3 ${t.aspect} ${className}`}
    >
      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.06]">
        <LazyVideo src={t.src} poster={t.poster} active={playing} threshold={0.4} className="h-full w-full object-cover" />
      </div>
      <div
        className={`absolute inset-0 transition-[background-color] duration-700 ${playing ? "bg-ink/10" : "bg-ink/45"} [filter:none]`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
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

/** Motion language: layered collage whose columns travel at different speeds; tiles come alive on interaction. */
export default function Culture() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((col) => {
          const speed = parseFloat(col.dataset.speed || "0");
          gsap.fromTo(
            col,
            { y: -speed },
            { y: speed, ease: "none", scrollTrigger: { trigger: "[data-collage]", start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
        gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((tile, i) =>
          gsap.from(tile, {
            clipPath: "inset(18% 18% 18% 18%)",
            autoAlpha: 0,
            duration: 1.4,
            delay: (i % 3) * 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: tile, start: "top 92%", once: true },
          }),
        );
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
      className="relative overflow-hidden bg-ink-2 pt-28 sm:pt-36"
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
      <div data-collage className="relative mt-16 grid grid-cols-2 gap-3 gutter pb-28 sm:gap-4 md:grid-cols-3 md:gap-6 sm:pb-36">
        <div data-speed="-40" className="flex flex-col gap-3 sm:gap-4 md:gap-6">
          <Tile t={T.boxing} />
          <div data-fade className="hidden border-l border-gold/50 py-2 pl-5 md:block">
            <p className="font-serif text-2xl italic leading-snug text-bone/90">
              “Show up. Do the work. <span className="text-gold-bright">Repeat.</span>”
            </p>
            <p className="label mt-3 text-[0.52rem] text-mute">El código del gimnasio</p>
          </div>
        </div>
        <div data-speed="50" className="flex flex-col gap-3 pt-14 sm:gap-4 md:gap-6 md:pt-28">
          <Tile t={T.group} />
          <Tile t={T.coach} />
        </div>
        <div data-speed="-80" className="col-span-2 grid grid-cols-2 gap-3 sm:gap-4 md:col-span-1 md:flex md:flex-col md:gap-6 md:pt-10">
          <Tile t={T.functional} />
          <Tile t={T.yoga} />
        </div>
      </div>

      {/* Marquee band */}
      <div aria-hidden className="relative overflow-hidden border-y border-line py-6 sm:py-8">
        <div className="marquee-track flex w-max whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0 items-center">
              {["Fuerza", "Disciplina", "Excelencia", "Comunidad"].map((w) => (
                <span key={w} className="flex items-center">
                  <span className="px-6 font-serif text-[clamp(2.5rem,7vw,6.5rem)] uppercase leading-none text-outline sm:px-10">{w}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/logo-mark.webp" alt="" className="h-6 w-auto opacity-70 sm:h-8" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

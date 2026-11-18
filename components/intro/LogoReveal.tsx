"use client";

import { useImperativeHandle, useRef, type Ref } from "react";

/**
 * Geometry of the real logo, measured from the client's artwork and
 * normalised to the square crop centred on the rings (see /public/brand).
 */
export const LOGO = {
  iconCx: 0.5089,
  iconCy: 0.2871,
  iconW: 0.2357,
  outerR: 530 / 1120,
  innerR: 468 / 1120,
  /** Portal radius: just inside the inner ring's inner edge. */
  portalR: 0.402,
};

export type LogoRefs = {
  box: HTMLDivElement;
  svg: SVGSVGElement;
  strokes: SVGCircleElement[];
  rings: HTMLImageElement;
  icon: HTMLImageElement;
  title: HTMLDivElement;
  titleLines: HTMLDivElement[];
  rule: HTMLDivElement;
  tag: HTMLImageElement;
  shine: HTMLDivElement;
  glow: HTMLDivElement;
  flash: HTMLDivElement;
};

// Title line bands (top%, bottom%) inside the logo square.
const BANDS: [number, number][] = [
  [39.5, 50.2], // EL
  [51.2, 63.4], // GIMNASIO
];
const band = ([t, b]: [number, number]) => `inset(${t}% 0% ${100 - b}% 0%)`;

const layer = "pointer-events-none absolute inset-0 h-full w-full select-none";

export default function LogoReveal({ ref }: { ref: Ref<LogoRefs> }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const c1 = useRef<SVGCircleElement>(null);
  const c2 = useRef<SVGCircleElement>(null);
  const rings = useRef<HTMLImageElement>(null);
  const icon = useRef<HTMLImageElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement[]>([]);
  const rule = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLImageElement>(null);
  const shine = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    box: box.current!,
    svg: svg.current!,
    strokes: [c1.current!, c2.current!],
    rings: rings.current!,
    icon: icon.current!,
    title: title.current!,
    titleLines: lines.current,
    rule: rule.current!,
    tag: tag.current!,
    shine: shine.current!,
    glow: glow.current!,
    flash: flash.current!,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div ref={box} className="intro-logo relative will-change-transform">
        <div
          ref={glow}
          className="absolute -inset-[30%] rounded-full opacity-0 bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,rgba(212,175,55,0.06)_40%,transparent_68%)]"
        />

        {/* Drawn rings (vector), cross-faded into the real raster rings */}
        <svg ref={svg} viewBox="0 0 1120 1120" className={layer} aria-hidden>
          <defs>
            <linearGradient id="ringGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f7d774" />
              <stop offset="0.45" stopColor="#f5c451" />
              <stop offset="1" stopColor="#c9971f" />
            </linearGradient>
          </defs>
          <circle
            ref={c1}
            cx="560"
            cy="560"
            r="530"
            fill="none"
            stroke="url(#ringGold)"
            strokeWidth="17"
            pathLength={1}
            strokeDasharray="1 2"
            strokeDashoffset="1"
            transform="rotate(-90 560 560)"
          />
          <circle
            ref={c2}
            cx="560"
            cy="560"
            r="468"
            fill="none"
            stroke="url(#ringGold)"
            strokeWidth="16"
            pathLength={1}
            strokeDasharray="1 2"
            strokeDashoffset="1"
            transform="translate(1120 0) scale(-1 1) rotate(-90 560 560)"
          />
        </svg>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={rings} src="/brand/logo-rings.webp" alt="" className={`${layer} invisible`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={icon} src="/brand/logo-icon.webp" alt="" className={`${layer} invisible`} />

        <div ref={title} className={`${layer} invisible`}>
          {BANDS.map((b, i) => (
            <div key={i} className="absolute inset-0" style={{ clipPath: band(b) }}>
              <div
                ref={(el) => {
                  if (el) lines.current[i] = el;
                }}
                className="absolute inset-0 will-change-transform"
                style={{ clipPath: band(b) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo-title.webp" alt="" className={layer} />
              </div>
            </div>
          ))}
        </div>

        <div ref={rule} className={`${layer} invisible`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-rule.webp" alt="" className={layer} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={tag} src="/brand/logo-tag.webp" alt="" className={`${layer} invisible`} />

        <div ref={shine} className={`${layer} logo-shine`} />

        <div
          className="absolute aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${LOGO.iconCx * 100}%`, top: `${LOGO.iconCy * 100}%` }}
        >
          <div
            ref={flash}
            className="h-full w-full rounded-full opacity-0 bg-[radial-gradient(circle,rgba(255,236,180,0.9),rgba(245,196,81,0.25)_35%,transparent_70%)]"
          />
        </div>

        <h1 className="sr-only">EL GIMNASIO — The Gym</h1>
      </div>
    </div>
  );
}

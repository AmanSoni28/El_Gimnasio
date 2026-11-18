"use client";

import { useRef } from "react";
import { CONTACT, NAV } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";
import { showToast } from "@/lib/store";

const SOCIAL = [
  { label: "Instagram", href: CONTACT.instagram.url },
  { label: "Facebook", href: null },
  { label: "YouTube", href: null },
  { label: "WhatsApp", href: null },
];

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-wordmark]", {
          yPercent: 40,
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-wordmark]", start: "top 98%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-gold/20 bg-ink pt-20 sm:pt-24">
      <div className="grid gap-12 gutter sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-256.webp" alt="EL GIMNASIO logo" width={64} height={64} className="h-16 w-16" />
            <div>
              <p className="font-serif text-2xl font-semibold tracking-[0.12em]">EL GIMNASIO</p>
              <p className="label mt-1 text-[0.55rem] tracking-[0.45em] text-gold">The Gym</p>
            </div>
          </div>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-mute">Built by discipline. Defined by strength.</p>
          <p className="label mt-6 text-[0.55rem] text-gold/70">Fuerza • Disciplina • Excelencia</p>
        </div>

        <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-6">
          <p className="label mb-5 text-[0.58rem] text-bone/50">Explore</p>
          <ul className="space-y-3">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(n.id);
                  }}
                  className="group inline-flex items-center gap-2 text-sm text-bone/80 transition-colors hover:text-gold-bright"
                >
                  <span className="block h-px w-0 bg-gold transition-all duration-500 group-hover:w-4" />
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <p className="label mb-5 text-[0.58rem] text-bone/50">Contact</p>
          <ul className="space-y-3 text-sm text-mute/70">
            <li className="text-bone/80">{CONTACT.building}</li>
            <li>{CONTACT.address}</li>
            <li>{CONTACT.phone}</li>
            <li>{CONTACT.email}</li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="label mb-5 text-[0.58rem] text-bone/50">Follow</p>
          <ul className="space-y-3">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-sm text-bone/80 transition-colors hover:text-gold-bright">
                    {s.label} ↗
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => showToast(`${s.label} link will be added once confirmed.`)}
                    className="text-sm text-bone/50 transition-colors hover:text-gold-bright"
                  >
                    {s.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-4 border-t border-line py-6 gutter text-[0.72rem] text-mute/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 EL GIMNASIO — The Gym. All rights reserved.</p>
        <button
          type="button"
          onClick={() => scrollToId("home")}
          className="group inline-flex items-center gap-3 label text-[0.55rem] text-bone/60 transition-colors hover:text-gold-bright"
        >
          Back to top
          <span className="transition-transform duration-500 group-hover:-translate-y-1">↑</span>
        </button>
      </div>

      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p
          data-wordmark
          className="text-gold-metal -mb-[0.2em] whitespace-nowrap text-center font-serif text-[15.5vw] font-semibold uppercase leading-[0.9] tracking-[-0.01em] opacity-90"
        >
          El Gimnasio
        </p>
      </div>
    </footer>
  );
}

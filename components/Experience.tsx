"use client";

import { useEffect } from "react";
import Cursor from "@/components/animations/Cursor";
import ScrollProgress from "@/components/animations/ScrollProgress";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CinematicIntro from "@/components/intro/CinematicIntro";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import About from "@/components/sections/About";
import Culture from "@/components/sections/Culture";
import Experience from "@/components/sections/Experience";
import Facilities from "@/components/sections/Facilities";
import FinalCTA from "@/components/sections/FinalCTA";
import Hero from "@/components/sections/Hero";
import Journey from "@/components/sections/Journey";
import Location from "@/components/sections/Location";
import Marquee from "@/components/sections/Marquee";
import Programs from "@/components/sections/Programs";
import Showcase from "@/components/sections/Showcase";
import JoinModal from "@/components/ui/JoinModal";
import Toast from "@/components/ui/Toast";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { activeSection, introPhase, sectionMeta } from "@/lib/store";

/**
 * Site-wide scroll language, applied after every section has mounted (so pins above are measured):
 * - [data-scrub-text]: paragraphs light up word by word as they're read.
 * - [data-rise]: the section arrives as a rounded card that opens to full bleed.
 */
function useSiteMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const splits = gsap.utils.toArray<HTMLElement>("[data-scrub-text]").map((el) => {
        const split = SplitText.create(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 50%", scrub: true } },
        );
        return split;
      });
      gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el) =>
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 4% 0% 4% round 3rem 3rem 0 0)" },
          { clipPath: "inset(0% 0% 0% 0% round 0rem 0rem 0 0)", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: true } },
        ),
      );
      return () => splits.forEach((s) => s.revert());
    });
  });
}

/** Tracks which section crosses the middle of the viewport (nav highlight + indicator). */
function useSectionTracking() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const total = sections.length;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          activeSection.set(el.dataset.nav ?? "home");
          sectionMeta.set({ index: sections.indexOf(el) + 1, total, title: el.dataset.title ?? "" });
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
}

export default function Site() {
  useSectionTracking();
  useSiteMotion();

  // Decide once per browser session whether the intro plays (the inline
  // boot script already hid it pre-paint when it shouldn't).
  useEffect(() => {
    const mode = document.documentElement.dataset.intro;
    introPhase.set(mode === "play" ? "intro" : "done");
  }, []);

  return (
    <>
      <SmoothScroll />
      <CinematicIntro />
      <Cursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Experience />
        <Programs />
        <Showcase />
        <Facilities />
        <Culture />
        <Journey />
        <Location />
        <FinalCTA />
      </main>
      <Footer />
      <JoinModal />
      <Toast />
    </>
  );
}

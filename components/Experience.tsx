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
import Location from "@/components/sections/Location";
import Programs from "@/components/sections/Programs";
import Showcase from "@/components/sections/Showcase";
import JoinModal from "@/components/ui/JoinModal";
import Toast from "@/components/ui/Toast";
import { activeSection, introPhase, sectionMeta } from "@/lib/store";

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
        <About />
        <Experience />
        <Programs />
        <Showcase />
        <Facilities />
        <Culture />
        <Location />
        <FinalCTA />
      </main>
      <Footer />
      <JoinModal />
      <Toast />
    </>
  );
}

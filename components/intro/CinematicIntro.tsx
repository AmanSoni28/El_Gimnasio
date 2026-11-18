"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { introPhase, useStore } from "@/lib/store";
import type { DumbbellApi } from "./DumbbellScene";
import LogoReveal, { LOGO, type LogoRefs } from "./LogoReveal";

const DumbbellScene = dynamic(() => import("./DumbbellScene"), { ssr: false });

const SESSION_KEY = "elg-intro-seen";
type Mode = "3d" | "2d" | "reduced";

function detectMode(): Mode {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "2d";
  } catch {
    return "2d";
  }
  return "3d";
}

/** `?qa` in the URL exposes the master timeline so automated QA can seek frames. */
function exposeForQA(tl: gsap.core.Timeline) {
  if (!window.location.search.includes("qa")) return;
  tl.pause(0);
  (window as unknown as { __introTl: gsap.core.Timeline }).__introTl = tl;
}

function markSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private mode — intro simply plays again next time */
  }
}

/**
 * The cinematic intro:
 *   1. black void, gold dust, a breathing centre light
 *   2. two 3D dumbbell halves fly in from opposite edges
 *   3. mechanical assembly: impact, sparks, light pulse, camera shake, locking twist
 *   4. the dumbbell shrinks precisely onto the logo's own dumbbell icon while the
 *      real EL GIMNASIO logo builds up layer by layer
 *   5. the logo's ring becomes a portal that opens onto the hero
 */
export default function CinematicIntro() {
  const phase = useStore(introPhase, "pending");
  // Phase only leaves "pending" on the client, so window is safe in here.
  const active = phase === "intro" || phase === "revealing";
  const env = useMemo(
    () =>
      active
        ? { mode: detectMode(), lowPower: window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 }
        : null,
    [active],
  );
  const [forced2d, setForced2d] = useState(false);
  const mode: Mode | null = env ? (forced2d && env.mode === "3d" ? "2d" : env.mode) : null;
  const lowPower = env?.lowPower ?? false;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const logo = useRef<LogoRefs>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const finished = useRef(false);
  const revealed = useRef(false);
  const started = useRef(false);

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    introPhase.set("revealing");
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    reveal();
    markSeen();
    document.documentElement.setAttribute("data-intro", "done");
    introPhase.set("done");
  }, [reveal]);

  /* ─────────────── Shared: logo build-up + portal ─────────────── */
  const addLogoAndPortal = useCallback(
    (tl: gsap.core.Timeline, at: number, opts: { withIcon: boolean }) => {
      const l = logo.current!;
      const root = rootRef.current!;
      const L = l.box.getBoundingClientRect().width;

      // Rings draw on (outer clockwise, inner counter-clockwise)
      tl.to(l.strokes, { strokeDashoffset: 0, duration: 1.25, ease: "power2.inOut", stagger: 0.12 }, at - 0.55)
        .to(l.glow, { opacity: 1, duration: 1.2, ease: "power2.out" }, at - 0.4);

      if (opts.withIcon) {
        tl.fromTo(l.icon, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, at);
      }

      tl.set(l.title, { autoAlpha: 1 }, at + 0.1)
        .fromTo(l.titleLines, { yPercent: 13 }, { yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.13 }, at + 0.12)
        .fromTo(l.rule, { autoAlpha: 1, clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" }, at + 0.42)
        .fromTo(l.tag, { autoAlpha: 0, yPercent: 3 }, { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: "power3.out" }, at + 0.62)
        .to(l.rings, { autoAlpha: 1, duration: 0.5, ease: "power1.inOut" }, at + 0.35)
        .to(l.svg, { autoAlpha: 0, duration: 0.5 }, at + 0.75)
        .to(l.shine, { backgroundPosition: "-60% 0", duration: 1.1, ease: "power2.inOut" }, at + 0.85)
        .to(l.glow, { opacity: 0.55, scale: 1.08, duration: 0.9, ease: "sine.inOut" }, at + 0.9)
        .to(captionRef.current, { autoAlpha: 1, duration: 0.8 }, at + 0.5);

      /* Portal: the logo's ring becomes a window onto the hero, then opens. */
      const p = at + 1.75;
      const holeBase = L * LOGO.portalR; // just inside the inner ring
      const diag = Math.hypot(window.innerWidth, window.innerHeight) / 2;
      const kMax = (diag * 1.12) / holeBase;
      const hole = { k: 0 };
      const setHole = () => root.style.setProperty("--hole", `${(hole.k * holeBase).toFixed(1)}px`);

      tl.add(() => root.classList.add("is-portal"), p)
        .to([l.icon, l.title, l.rule, l.tag], { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: "power2.in" }, p)
        .to([l.shine, captionRef.current, skipRef.current], { autoAlpha: 0, duration: 0.35 }, p)
        .to(l.glow, { opacity: 0, duration: 0.4 }, p)
        .to(hole, { k: 1, duration: 0.6, ease: "power2.inOut", onUpdate: setHole }, p + 0.15)
        .add(reveal, p + 0.3)
        .to(hole, { k: kMax, duration: 1.05, ease: "expo.inOut", onUpdate: setHole }, p + 0.78)
        .to(l.box, { scale: kMax, duration: 1.05, ease: "expo.inOut" }, p + 0.78)
        .to(l.rings, { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, p + 1.2);
    },
    [reveal],
  );

  /* ─────────────── 3D timeline ─────────────── */
  const run3D = useCallback(
    (api: DumbbellApi) => {
      if (started.current || finished.current) return;
      started.current = true;
      const l = logo.current!;
      const stage = stageRef.current!;
      const L = l.box.getBoundingClientRect().width;

      const off = api.halfVisibleWidth() + 1.8;
      gsap.set(api.left.position, { x: -off, y: 0.55, z: -1.6 });
      gsap.set(api.right.position, { x: off, y: -0.55, z: -1.6 });
      gsap.set(api.left.rotation, { x: 0.5, y: 0.95, z: 0.35 });
      gsap.set(api.right.rotation, { x: -0.5, y: -0.95, z: -0.35 });
      gsap.set(api.leftSpin.rotation, { y: -Math.PI * 3 });
      gsap.set(api.rightSpin.rotation, { y: Math.PI * 3 });
      gsap.set(api.envRotation, { y: -1.1 });

      // Exact landing spot: the dumbbell icon inside the real logo.
      const s = (LOGO.iconW * L) / api.widthPx();
      const dx = (LOGO.iconCx - 0.5) * L;
      const dy = (LOGO.iconCy - 0.5) * L;

      const T = { approach: 0.45, drive: 1.9, impact: 2.3 };
      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;
      exposeForQA(tl);

      tl.to(loaderRef.current, { autoAlpha: 0, duration: 0.4 }, 0)
        .to(stage, { autoAlpha: 1, duration: 0.01 }, 0)
        // Scene 1 — atmosphere
        .to(api.dust, { opacity: 0.85, duration: 1.4, ease: "power1.out" }, 0)
        .to(api.glow.material, { opacity: 0.5, duration: 1.6, ease: "power2.out" }, 0.05)
        .fromTo(api.glow.scale, { x: 1.5, y: 1.5 }, { x: 7, y: 7, duration: 2.4, ease: "power2.out" }, 0.05)
        // Scene 2 — halves enter from opposite edges, mirrored
        .to(api.left.position, { x: -1.1, y: 0.06, z: 0, duration: 1.45, ease: "power3.out" }, T.approach)
        .to(api.right.position, { x: 1.1, y: -0.06, z: 0, duration: 1.45, ease: "power3.out" }, T.approach)
        .to([api.left.rotation, api.right.rotation], { x: 0, y: 0, z: 0, duration: 1.8, ease: "power2.inOut" }, T.approach)
        .to(api.envRotation, { y: 0, duration: 1.9, ease: "power2.out" }, T.approach)
        .to(api.leftSpin.rotation, { y: -0.7, duration: 1.45, ease: "power3.out" }, T.approach)
        .to(api.rightSpin.rotation, { y: 0.7, duration: 1.45, ease: "power3.out" }, T.approach)
        // Scene 3 — drive in and lock
        .to([api.left.position, api.right.position], { x: 0, y: 0, duration: T.impact - T.drive, ease: "power4.in" }, T.drive)
        .to([api.leftSpin.rotation, api.rightSpin.rotation], { y: 0, duration: T.impact - T.drive, ease: "power4.in" }, T.drive)
        .add(() => api.burst(), T.impact)
        .fromTo(api.shock.scale, { x: 0.25, y: 0.25 }, { x: 3.4, y: 3.4, duration: 0.95, ease: "expo.out" }, T.impact)
        .fromTo(api.shock.material, { opacity: 0.95 }, { opacity: 0, duration: 0.95, ease: "power2.out" }, T.impact)
        .fromTo(api.seam.material, { opacity: 1 }, { opacity: 0, duration: 1.1, ease: "power2.out" }, T.impact)
        .to(api.pulse, { intensity: 34, duration: 0.05, ease: "none" }, T.impact)
        .to(api.pulse, { intensity: 0, duration: 0.95, ease: "power2.out" }, T.impact + 0.05)
        .to(api.glow.material, { opacity: 1, duration: 0.06, ease: "none" }, T.impact)
        .to(api.glow.material, { opacity: 0.45, duration: 1.1, ease: "power2.out" }, T.impact + 0.06)
        .fromTo(api.shake, { amp: 0.085 }, { amp: 0, duration: 0.5, ease: "power2.out" }, T.impact)
        .fromTo(flashRef.current, { opacity: 0.32 }, { opacity: 0, duration: 0.7, ease: "power2.out" }, T.impact)
        // Locking twist: threads seat
        .to(api.leftSpin.rotation, { y: 0.45, duration: 0.3, ease: "back.out(3)" }, T.impact + 0.1)
        .to(api.rightSpin.rotation, { y: -0.45, duration: 0.3, ease: "back.out(3)" }, T.impact + 0.1)
        // Presentation turn + light sweep travelling across the metal
        .to(api.assembly.rotation, { y: 0.5, x: 0.24, duration: 0.85, ease: "power2.inOut" }, T.impact + 0.25)
        .to(api.envRotation, { y: 1.9, duration: 1.6, ease: "power2.inOut" }, T.impact + 0.15)
        .to(api.assembly.rotation, { y: 0, x: 0, duration: 0.75, ease: "power2.inOut" }, T.impact + 1.1)
        // Scene 4 — the dumbbell becomes the logo icon
        .to(stage, { x: dx, y: dy, scale: s, duration: 0.95, ease: "power3.inOut" }, T.impact + 1.25)
        .to(api.glow.material, { opacity: 0, duration: 0.6 }, T.impact + 1.25)
        .to(api.dust, { opacity: 0.35, duration: 0.8 }, T.impact + 1.25)
        .to(stage, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, T.impact + 2.12);

      const logoAt = T.impact + 2.1;
      tl.fromTo(logo.current!.icon, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, logoAt - 0.05)
        .fromTo(logo.current!.flash, { opacity: 0.9, scale: 0.6 }, { opacity: 0, scale: 1.6, duration: 0.7, ease: "power2.out" }, logoAt);
      addLogoAndPortal(tl, logoAt, { withIcon: false });
    },
    [addLogoAndPortal, finish],
  );

  /* ─────────────── 2D / reduced timelines ─────────────── */
  useEffect(() => {
    if (!mode || mode === "3d" || started.current) return;
    started.current = true;
    const l = logo.current!;
    gsap.set(loaderRef.current, { autoAlpha: 0 });

    if (mode === "reduced") {
      // No travel, no zoom: a calm fade of the real logo, then out.
      gsap.set([l.strokes], { strokeDashoffset: 0 });
      gsap.set([l.icon, l.title, l.rule, l.tag, l.rings], { autoAlpha: 1 });
      gsap.set(l.svg, { autoAlpha: 0 });
      gsap.set(l.rule, { clipPath: "inset(0% 0% 0% 0%)" });
      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;
      exposeForQA(tl);
      tl.fromTo(l.box, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "none" })
        .add(reveal, "+=0.9")
        .to(rootRef.current, { autoAlpha: 0, duration: 0.6, ease: "none" });
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;
    exposeForQA(tl);
    tl.to(l.glow, { opacity: 0.6, duration: 1.2 }, 0)
      .fromTo(l.icon, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out" }, 1.1)
      .fromTo(l.flash, { opacity: 0.9, scale: 0.6 }, { opacity: 0, scale: 1.6, duration: 0.7 }, 1.5);
    addLogoAndPortal(tl, 1.6, { withIcon: false });
  }, [mode, addLogoAndPortal, finish, reveal]);

  // Safety: if WebGL is slow to boot, fall back to the 2D reveal.
  useEffect(() => {
    if (mode !== "3d" || window.location.search.includes("qa")) return;
    const id = setTimeout(() => {
      if (!started.current) setForced2d(true);
    }, 8000);
    return () => clearTimeout(id);
  }, [mode]);

  const skip = useCallback(() => {
    if (finished.current) return;
    tlRef.current?.kill();
    reveal();
    gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut", onComplete: finish });
  }, [finish, reveal]);

  useEffect(() => {
    if (phase !== "intro") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, skip]);

  useEffect(() => () => void tlRef.current?.kill(), []);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      className="intro-root fixed inset-0 z-[100] overflow-hidden bg-ink"
      role="dialog"
      aria-label="EL GIMNASIO introduction"
      aria-live="polite"
    >
      {/* Soft vignette & warm centre */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)]" />

      {/* 3D stage — transformed as a whole to land on the logo icon */}
      <div ref={stageRef} className="invisible absolute inset-0 origin-center will-change-transform">
        {mode === "3d" && <DumbbellScene onReady={run3D} lowPower={lowPower} />}
      </div>

      <LogoReveal ref={logo} />

      {/* Impact flash */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_center,rgba(245,196,81,0.55),transparent_45%)]"
      />

      {/* Loader (only visible while the 3D scene boots) */}
      <div ref={loaderRef} className="absolute inset-x-0 bottom-[18%] flex flex-col items-center gap-4">
        <span className="label text-[0.6rem] text-mute/80">Cargando</span>
        <span className="relative block h-px w-24 overflow-hidden bg-bone/10">
          <span className="scroll-dot absolute inset-y-0 left-0 w-full bg-gold [animation-name:none] animate-[pulse_1.4s_ease-in-out_infinite]" />
        </span>
      </div>

      <div
        ref={captionRef}
        className="invisible absolute inset-x-0 bottom-[7%] text-center label text-[0.6rem] tracking-[0.5em] text-gold/80 sm:text-[0.66rem]"
      >
        Fuerza • Disciplina • Excelencia
      </div>

      <button
        ref={skipRef}
        type="button"
        onClick={skip}
        className="group absolute bottom-6 right-6 flex items-center gap-3 label text-[0.62rem] text-bone/60 transition-colors hover:text-gold-bright sm:bottom-8 sm:right-10"
      >
        Skip intro
        <span className="block h-px w-8 bg-current transition-all duration-500 group-hover:w-12" />
      </button>
    </div>
  );
}

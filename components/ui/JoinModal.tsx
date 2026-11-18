"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PROGRAMS } from "@/lib/content";
import { lenisRef } from "@/lib/scroll";
import { joinModal, toastStore, useStore } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;
const TIMES = ["Early morning", "Midday", "Evening"];

/**
 * Front-end-only enquiry flow. It never pretends to submit: on "send" it
 * explains this is a design preview and nothing was transmitted.
 */
export default function JoinModal() {
  const state = useStore(joinModal);
  return (
    <AnimatePresence>
      {state.open && <JoinDialog key="join" initialProgram={state.program} mode={state.mode ?? "join"} />}
    </AnimatePresence>
  );
}

function JoinDialog({ initialProgram, mode }: { initialProgram?: string; mode: "join" | "visit" }) {
  const [programs, setPrograms] = useState<string[]>(initialProgram ? [initialProgram] : []);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preview, setPreview] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const close = () => joinModal.set({ open: false });

  useEffect(() => {
    lenisRef.current?.stop();
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    const focusId = setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("button, input")?.focus(), 400);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && joinModal.set({ open: false });
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusId);
      window.removeEventListener("keydown", onKey);
      lenisRef.current?.start();
      document.body.style.overflow = "";
      prevFocus?.focus?.();
    };
  }, []);

  const toggle = (id: string) => setPrograms((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const canSend = programs.length > 0 && name.trim().length > 1;

  return (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
        >
          <button aria-label="Close" onClick={close} className="absolute inset-0 bg-ink/80 backdrop-blur-md" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-title"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.7, ease }}
            data-lenis-prevent
            className="grain relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-gold/20 bg-ink-2 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:rounded-3xl sm:p-10"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.12),transparent_60%)]" />
            <button
              onClick={close}
              aria-label="Close dialog"
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-bone/15 text-bone/70 transition-colors hover:border-gold hover:text-gold-bright"
            >
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {!preview ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canSend) setPreview(true);
                  }}
                  className="relative"
                >
                  <p className="label text-[0.6rem] text-gold">{mode === "visit" ? "Reserva una visita" : "Únete al movimiento"}</p>
                  <h2 id="join-title" className="mt-3 font-serif text-4xl uppercase leading-[0.95] sm:text-5xl">
                    {mode === "visit" ? (
                      <>
                        Book a <em className="text-gold-metal">visit</em>
                      </>
                    ) : (
                      <>
                        Join the <em className="text-gold-metal">movement</em>
                      </>
                    )}
                  </h2>
                  <p className="mt-4 max-w-md text-sm text-mute">
                    Tell us what you&apos;d like to train and when. Our team will help you choose the right start.
                  </p>

                  <fieldset className="mt-8">
                    <legend className="label mb-3 text-[0.6rem] text-bone/70">I&apos;m interested in</legend>
                    <div className="flex flex-wrap gap-2">
                      {PROGRAMS.map((p) => {
                        const on = programs.includes(p.id);
                        return (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => toggle(p.id)}
                            aria-pressed={on}
                            className={`rounded-full border px-4 py-2.5 text-[0.78rem] transition-all duration-300 ${
                              on ? "border-gold bg-gold text-ink" : "border-bone/15 text-bone/80 hover:border-gold/60"
                            }`}
                          >
                            {p.title}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="mt-6">
                    <legend className="label mb-3 text-[0.6rem] text-bone/70">Preferred time</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {TIMES.map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setTime(t)}
                          aria-pressed={time === t}
                          className={`rounded-xl border px-3 py-3 text-[0.75rem] transition-all duration-300 ${
                            time === t ? "border-gold text-gold-bright" : "border-bone/15 text-bone/70 hover:border-gold/50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="label mb-2 block text-[0.58rem] text-bone/60">Name</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        className="w-full border-b border-bone/20 bg-transparent py-3 text-bone outline-none transition-colors placeholder:text-bone/25 focus:border-gold"
                        placeholder="Your name"
                      />
                    </label>
                    <label className="block">
                      <span className="label mb-2 block text-[0.58rem] text-bone/60">Phone</span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        inputMode="tel"
                        autoComplete="tel"
                        className="w-full border-b border-bone/20 bg-transparent py-3 text-bone outline-none transition-colors placeholder:text-bone/25 focus:border-gold"
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  <div className="mt-9 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[0.72rem] text-mute/70">Select at least one program and add your name.</p>
                    <button
                      type="submit"
                      disabled={!canSend}
                      className="group relative overflow-hidden rounded-full bg-gold px-8 py-4 label text-[0.66rem] text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <span className="relative z-10">Send enquiry</span>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease }}
                  className="relative py-6 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/50">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-bright">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M12 7.5v5.5M12 15.8v.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="label mt-6 text-[0.6rem] text-gold">Modo de vista previa</p>
                  <h2 id="join-title" className="mt-3 font-serif text-4xl uppercase">Design preview</h2>
                  <p className="mx-auto mt-4 max-w-sm text-sm text-mute">
                    Thanks, {name.split(" ")[0]}. This website is a presentation preview, so online enquiries are not connected yet and
                    <strong className="font-semibold text-bone"> nothing has been sent</strong>. Enquiries will go live at launch.
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <button
                      onClick={() => setPreview(false)}
                      className="rounded-full border border-bone/20 px-6 py-3 label text-[0.6rem] text-bone/80 hover:border-gold"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        close();
                        toastStore.set(null);
                      }}
                      className="rounded-full bg-gold px-6 py-3 label text-[0.6rem] text-ink"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { toastStore, useStore } from "@/lib/store";

export default function Toast() {
  const msg = useStore(toastStore, null);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[95] flex justify-center px-4">
      <AnimatePresence>
        {msg && (
          <motion.div
            key={msg}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-w-md items-center gap-3 rounded-full border border-gold/30 bg-ink-2/95 px-5 py-3 text-[0.8rem] text-bone shadow-2xl backdrop-blur"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-bright" />
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

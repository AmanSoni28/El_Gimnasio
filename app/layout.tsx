import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Cormorant_Garamond, Manrope } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const display = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EL GIMNASIO — The Gym",
  description:
    "Built by discipline. Defined by strength. A premium training space for strength, boxing, yoga, functional and personal training.",
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

/**
 * Runs before first paint: decides whether the cinematic intro plays this
 * browser session, so the hero never flashes underneath it (and repeat
 * visits never flash the intro).
 */
const introBootScript = `(function(){try{var s=sessionStorage.getItem('elg-intro-seen');document.documentElement.setAttribute('data-intro',s?'skip':'play');}catch(e){document.documentElement.setAttribute('data-intro','play');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${display.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

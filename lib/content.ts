/**
 * Site content. Anything not confirmed by the client is an explicit
 * placeholder in [brackets]: no invented phone numbers, addresses or hours.
 */

export const NAV = [
  { id: "home", label: "Home", es: "Inicio" },
  { id: "about", label: "About", es: "Nosotros" },
  { id: "facilities", label: "Facilities", es: "Instalaciones" },
  { id: "programs", label: "Programs", es: "Programas" },
  { id: "trainers", label: "Trainers", es: "Entrenadores" },
  { id: "contact", label: "Contact", es: "Contacto" },
] as const;

export type NavId = (typeof NAV)[number]["id"];

export type Program = {
  id: string;
  index: string;
  title: string;
  es: string;
  description: string;
  video: string;
  poster: string;
  focus: string[];
};

export const PROGRAMS: Program[] = [
  {
    id: "strength",
    index: "01",
    title: "Strength Training",
    es: "Fuerza",
    description:
      "Progressive overload on plate-loaded stations, racks and free weights. Build raw, lasting power with structure behind every set.",
    video: "/media/strength.mp4",
    poster: "/media/posters/strength.jpg",
    focus: ["Hypertrophy", "Power", "Technique"],
  },
  {
    id: "boxing",
    index: "02",
    title: "Boxing",
    es: "Boxeo",
    description:
      "Footwork, combinations and conditioning. Sharpen your reflexes, build an engine and train with the intensity of a fighter.",
    video: "/media/boxing.mp4",
    poster: "/media/posters/boxing.jpg",
    focus: ["Footwork", "Combinations", "Conditioning"],
  },
  {
    id: "yoga",
    index: "03",
    title: "Yoga",
    es: "Yoga",
    description:
      "Strength through stillness. Mobility, balance and breath control for a body that moves well and recovers better.",
    video: "/media/yoga.mp4",
    poster: "/media/posters/yoga.jpg",
    focus: ["Mobility", "Balance", "Breath"],
  },
  {
    id: "functional",
    index: "04",
    title: "Functional Training",
    es: "Funcional",
    description:
      "Pull, hang, swing, carry. Real-world strength and athletic movement on our dedicated turf zone.",
    video: "/media/functional.mp4",
    poster: "/media/posters/functional.jpg",
    focus: ["Grip", "Agility", "Endurance"],
  },
  {
    id: "personal",
    index: "05",
    title: "Personal Training",
    es: "Entrenador Personal",
    description:
      "One-to-one coaching with a plan built around you: your goals, your schedule, your pace. Accountability, every session.",
    video: "/media/personal.mp4",
    poster: "/media/posters/personal.jpg",
    focus: ["1-to-1", "Custom Plan", "Accountability"],
  },
];

export const CONTACT = {
  building: "Buddha Tower",
  address: "[Street address — to be confirmed]",
  city: "[City, Postal code]",
  phone: "[Phone number]",
  email: "[Email address]",
  hours: "[Opening hours — to be confirmed]",
  instagram: { handle: "@el_gimnasio_thegym", url: "https://www.instagram.com/el_gimnasio_thegym/" },
};

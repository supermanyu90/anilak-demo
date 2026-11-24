import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadDeva } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as loadBeng } from "@remotion/google-fonts/NotoSansBengali";
import { loadFont as loadTamil } from "@remotion/google-fonts/NotoSansTamil";

const serif = loadCormorant("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
const sans = loadMontserrat("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;
const deva = loadDeva("normal", { weights: ["400", "500"], subsets: ["devanagari"] }).fontFamily;
const beng = loadBeng("normal", { weights: ["400", "500"], subsets: ["bengali"] }).fontFamily;
const tamil = loadTamil("normal", { weights: ["400", "500"], subsets: ["tamil"] }).fontFamily;

const indic = `${deva}, ${beng}, ${tamil}`;
export const SERIF = `${serif}, ${indic}, Georgia, serif`;
export const SANS = `${sans}, ${indic}, sans-serif`;

// Anilak's Soft UI palette
export const C = {
  bg: "#FFF5F5",
  ink: "#2D3436",
  ink2: "#5B6466",
  blush: "#E8B4B8",
  sage: "#A8D5BA",
  sageInk: "#2F6B4A",
  gold: "#D4AF37",
  goldInk: "#7A5F0E",
  mist: "#FBF1F0",
};

export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .18 0 0 0 0 .2 0 0 0 0 .21 0 0 0 .05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

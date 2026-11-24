import timings from "../public/clips/timings.json";

export type Scene = {
  id: keyof typeof timings;
  title: string;
  points: string[];
};

export const SCENES: Scene[] = [
  {
    id: "hero",
    title: "Live air, at a glance",
    points: [
      "Live US AQI, PM2.5 and PM10 from Open-Meteo",
      "Translated into plain terms: cigarettes per day and how far over the WHO limit",
      "India's CPCB AQI and the best time to step out",
    ],
  },
  {
    id: "ask",
    title: "Ask anything",
    points: [
      "Type or speak a question about a run, a commute or a symptom",
      "The intent engine reads the activity, its length and who is involved",
      "Three actions: a low-emission routine, an indoor air hack, and the exposure saved",
    ],
  },
  {
    id: "hindi",
    title: "Answers in your language",
    points: [
      "English, हिन्दी, मराठी, বাংলা and தமிழ்",
      "Sarvam AI voice: speech-to-text with auto-detect, and spoken replies",
      "The detected language sets the reply language",
    ],
  },
  {
    id: "emergency",
    title: "Safety comes first",
    points: [
      "Chest tightness or trouble breathing skips everything else",
      "Instant emergency guidance with one-tap 112 and 108 calls",
      "Vayu switches to a severe alert",
    ],
  },
  {
    id: "simulator",
    title: "Vayu reacts to the air",
    points: [
      "A 3D mascot whose smog cloud thickens as the AQI rises",
      "A protective shield appears above AQI 250",
      "Simulate any AQI and watch the advice change",
    ],
  },
  {
    id: "forecast",
    title: "Plan around the air",
    points: [
      "Hour-by-hour PM2.5 for the next 24 hours",
      "The cleanest two-hour daytime window, highlighted",
      "Hover any hour for the reading",
    ],
  },
  {
    id: "health",
    title: "What the AQI means for your body",
    points: [
      "Tap a band to see who is at risk, what happens and what to do",
      "Effects on the lungs, heart and brain, and on children and pregnancy",
    ],
  },
  {
    id: "home",
    title: "Make home a clean-air refuge",
    points: [
      "A 12-tip healthy-home checklist with a live score",
      "A purifier size calculator for your room",
      "Honest advice: plants are lovely, but filters do the work",
    ],
  },
  {
    id: "rules",
    title: "Rules & standards",
    points: [
      "Your air against India's limits (NAAQS) and the WHO's",
      "India's CPCB scale and Delhi-NCR's GRAP stages, live",
      "Links to CPCB, CAQM and the WHO",
    ],
  },
  {
    id: "myths",
    title: "Myths vs facts",
    points: [
      "Nine common misconceptions, one tap to flip",
      "Masks, plants, purifiers, rain and morning walks",
    ],
  },
];

export const FPS = 30;
export const INTRO = 7 * FPS;
export const OUTRO = 10 * FPS;
export const sceneFrames = (s: Scene) => Math.floor(timings[s.id].duration * FPS);
export const totalFrames = () => INTRO + SCENES.reduce((n, s) => n + sceneFrames(s), 0) + OUTRO;

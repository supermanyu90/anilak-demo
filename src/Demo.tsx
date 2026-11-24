import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { C, GRAIN, SANS, SERIF } from "./theme";
import { INTRO, OUTRO, SCENES, sceneFrames, type Scene } from "./content";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FADE = 14;

// Fade a whole block in at the start and out at the end of its sequence.
const useFade = (duration: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [0, FADE, duration - FADE, duration], [0, 1, 1, 0], clamp);
};
const rise = (f: number, delay: number, fps: number) => {
  const s = spring({ frame: f - delay, fps, config: { damping: 200 }, durationInFrames: 24 });
  return { opacity: s, transform: `translateY(${(1 - s) * 18}px)` };
};

const Badge: React.FC<{ size: number }> = ({ size }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.3, border: `2px solid ${C.blush}`, background: "#FBE9EA",
    display: "grid", placeItems: "center", fontFamily: SERIF, fontWeight: 700, fontSize: size * 0.5, color: C.ink,
  }}>अ</div>
);

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity: useFade(INTRO), alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={rise(f, 4, fps)}><Badge size={120} /></div>
      <div style={{ ...rise(f, 12, fps), fontFamily: SERIF, fontWeight: 700, fontSize: 190, color: C.ink, lineHeight: 1, marginTop: 28 }}>Anilak</div>
      <div style={{ ...rise(f, 24, fps), fontFamily: SANS, fontSize: 38, color: C.ink2, marginTop: 22 }}>
        A voice-first air quality assistant for Indian cities
      </div>
      <div style={{ ...rise(f, 40, fps), fontFamily: SANS, fontSize: 30, color: C.sageInk, marginTop: 34, display: "flex", gap: 26 }}>
        {["English", "हिन्दी", "मराठी", "বাংলা", "தமிழ்"].map((l) => (
          <span key={l} style={{ background: "#EEF7F1", border: `1px solid ${C.sage}`, borderRadius: 999, padding: "8px 24px" }}>{l}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const BrowserFrame: React.FC<{ id: string; scale: number }> = ({ id, scale }) => {
  const W = 1200, H = 675;
  return (
    <div style={{
      width: W, borderRadius: 22, overflow: "hidden", background: "#fff", transform: `scale(${scale})`,
      boxShadow: "0 2px 6px rgba(45,52,54,.06), 0 40px 80px -30px rgba(45,52,54,.35)", border: "1px solid rgba(232,180,184,.45)",
    }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 18px", background: C.mist, borderBottom: "1px solid rgba(45,52,54,.06)" }}>
        {["#E8B4B8", "#EBD58A", "#A8D5BA"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
        <span style={{ marginLeft: 18, fontFamily: SANS, fontSize: 17, color: C.ink2, background: "#fff", borderRadius: 8, padding: "5px 18px" }}>anilak.vercel.app</span>
      </div>
      <OffthreadVideo src={staticFile(`clips/${id}.mp4`)} muted style={{ width: W, height: H, display: "block" }} />
    </div>
  );
};

const FeatureScene: React.FC<{ scene: Scene; index: number; duration: number }> = ({ scene, index, duration }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(f, [0, duration], [0.985, 1.0], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ opacity: useFade(duration) }}>
      <div style={{ position: "absolute", left: 96, top: 0, bottom: 0, width: 540, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ ...rise(f, 6, fps), fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 4, color: C.goldInk }}>
          {String(index + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
        </div>
        <div style={{ ...rise(f, 12, fps), fontFamily: SERIF, fontWeight: 700, fontSize: 70, lineHeight: 1.02, color: C.ink, marginTop: 18 }}>
          {scene.title}
        </div>
        <div style={{ ...rise(f, 18, fps), width: 72, height: 4, borderRadius: 2, background: C.blush, margin: "30px 0 26px" }} />
        {scene.points.map((p, i) => (
          <div key={p} style={{ ...rise(f, 30 + i * 14, fps), display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <span style={{ flexShrink: 0, width: 12, height: 12, borderRadius: 6, background: C.sage, border: `2px solid ${C.sageInk}`, marginTop: 11 }} />
            <span style={{ fontFamily: SANS, fontSize: 27, lineHeight: 1.42, color: C.ink }}>{p}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 640, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
        <BrowserFrame id={scene.id} scale={scale} />
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stack = ["Open-Meteo air quality", "Sarvam AI · saaras v4 + bulbul v3", "Three.js", "Gemini (optional)", "Vercel"];
  const quality = ["ES modules", "19 unit tests", "ESLint", "GitHub Actions CI"];
  const chip = (t: string, tone: string, border: string) => (
    <span key={t} style={{ fontFamily: SANS, fontSize: 25, color: C.ink, background: tone, border: `1px solid ${border}`, borderRadius: 999, padding: "10px 24px" }}>{t}</span>
  );
  return (
    <AbsoluteFill style={{ opacity: useFade(OUTRO), alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={rise(f, 4, fps)}><Badge size={92} /></div>
      <div style={{ ...rise(f, 10, fps), fontFamily: SERIF, fontWeight: 700, fontSize: 96, color: C.ink, marginTop: 22, lineHeight: 1 }}>Breathe smarter.</div>
      <div style={{ ...rise(f, 22, fps), display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", maxWidth: 1800, marginTop: 48 }}>
        {stack.map((t) => chip(t, "#fff", "rgba(232,180,184,.6)"))}
      </div>
      <div style={{ ...rise(f, 32, fps), display: "flex", gap: 16, justifyContent: "center", marginTop: 18 }}>
        {quality.map((t) => chip(t, "#EEF7F1", C.sage))}
      </div>
      <div style={{ ...rise(f, 46, fps), fontFamily: SERIF, fontWeight: 700, fontSize: 64, color: C.sageInk, marginTop: 56 }}>anilak.vercel.app</div>
      <div style={{ ...rise(f, 56, fps), fontFamily: SANS, fontSize: 20, color: C.ink2, marginTop: 26 }}>
        General guidance, not medical advice. In an emergency call 112 or 108.
      </div>
    </AbsoluteFill>
  );
};

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let at = INTRO;
  const starts = SCENES.map((s) => { const start = at; at += sceneFrames(s); return start; });
  const progress = frame / durationInFrames;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ backgroundImage: GRAIN }} />
      <Audio
        src={staticFile("music/ambient.wav")}
        volume={(f) => interpolate(f, [0, 30, durationInFrames - 90, durationInFrames], [0, 0.55, 0.55, 0], clamp)}
      />
      <Sequence durationInFrames={INTRO} name="Intro"><Intro /></Sequence>
      {SCENES.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={sceneFrames(s)} name={s.title}>
          <FeatureScene scene={s} index={i} duration={sceneFrames(s)} />
        </Sequence>
      ))}
      <Sequence from={at} durationInFrames={OUTRO} name="Outro"><Outro /></Sequence>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${progress * 100}%`, background: C.blush }} />
    </AbsoluteFill>
  );
};

# Anilak: demo video

A 2½-minute feature walkthrough of [Anilak](https://anilak.vercel.app), the voice-first, multilingual air quality assistant, built with [Remotion](https://www.remotion.dev).

**Watch:** download `anilak-demo.mp4` from the [latest release](../../releases/latest).

## How it's made

1. **Capture:** `scripts/capture.mjs` drives the live site in headless Chrome (Playwright) and records one clip per feature through the DevTools screencast. Clips are encoded with Remotion's bundled ffmpeg into `public/clips/` with their durations in `timings.json`. Auto-speak is turned off so recording doesn't spend Sarvam credit.
2. **Music:** `scripts/music.mjs` synthesises an original ambient bed (Cmaj7, Am7, Fmaj7, G6 pads with a sparse melody and soft echo), so there are no licensing questions. The output is deterministic.
3. **Compose:** `src/Demo.tsx` lays out a title card, ten feature scenes (captions on the left, the clip in a browser frame on the right) and an end card, in Anilak's Soft UI palette.

## Commands

```bash
npm install
node scripts/music.mjs 150                 # regenerate public/music/ambient.wav (git-ignored)
node scripts/capture.mjs [scene]           # re-record all scenes, or one (needs Google Chrome)
npx remotion studio                        # preview
npx remotion render src/index.ts AnilakDemo out/anilak-demo.mp4
```

Caption text lives in `src/content.ts`, and the scene actions in `scripts/capture.mjs`.

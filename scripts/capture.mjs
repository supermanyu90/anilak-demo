// Records one short clip per feature from the live Anilak site using the system Chrome.
// Frames come from Chrome's DevTools screencast and are encoded with Remotion's bundled ffmpeg.
// Output: public/clips/<id>.mp4 and public/clips/timings.json ({ id: { duration } } in seconds).
import { chromium } from 'playwright-core';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const URL = 'https://anilak.vercel.app/';
const OUT = path.resolve('public/clips');
const SIZE = { width: 1600, height: 900 };
const only = process.argv[2]; // optional: record a single scene

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Visible cursor dot (headless recordings do not show the pointer).
const CURSOR = `
  addEventListener('DOMContentLoaded', () => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;' +
      'background:rgba(45,52,54,.28);border:2px solid rgba(45,52,54,.75);z-index:99999;pointer-events:none;transition:transform .12s';
    document.body.appendChild(d);
    addEventListener('mousemove', (e) => { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', () => { d.style.transform = 'scale(.7)'; }, true);
    addEventListener('mouseup', () => { d.style.transform = ''; }, true);
  });`;

async function center(page, selector) {
  const b = await page.locator(selector).first().boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
async function moveTo(page, selector, steps = 25) {
  const p = await center(page, selector);
  await page.mouse.move(p.x, p.y, { steps });
  return p;
}
async function clickOn(page, selector, pause = 700) {
  await moveTo(page, selector);
  await sleep(250);
  await page.locator(selector).first().click();
  await sleep(pause);
}
async function scrollToEl(page, selector, block = 'start', offset = 0) {
  await page.evaluate(([s, b, o]) => {
    const el = document.querySelector(s);
    const top = el.getBoundingClientRect().top + scrollY - (b === 'center' ? (innerHeight - el.offsetHeight) / 2 : 0) + o;
    scrollTo({ top, behavior: 'smooth' });
  }, [selector, block, offset]);
  await sleep(1300);
}
async function slide(page, selector, values, stepMs = 45) {
  for (const v of values) {
    await page.evaluate(([s, val]) => { const el = document.querySelector(s); el.value = val; el.dispatchEvent(new Event('input')); }, [selector, v]);
    await sleep(stepMs);
  }
}
const range = (a, b, step) => { const out = []; for (let v = a; step > 0 ? v <= b : v >= b; v += step) out.push(v); return out; };

const SCENES = {
  async hero(page) {
    await page.mouse.move(300, 250, { steps: 1 });
    await sleep(1500);
    await moveTo(page, '#stage', 40);
    await page.mouse.move(700, 200, { steps: 40 });
    await sleep(800);
    for (const s of ['#gCig', '#gWho', '#gInd', '#gBest']) { await moveTo(page, s, 18); await sleep(700); }
    await moveTo(page, '#aqiNum', 30);
    await sleep(2200);
  },
  async ask(page) {
    await clickOn(page, '#query', 300);
    await page.keyboard.type('Can I go for a 45 minute run in the park this evening?', { delay: 55 });
    await sleep(600);
    await page.keyboard.press('Enter');
    await sleep(1800);
    for (const s of ['#cards article:nth-child(1)', '#cards article:nth-child(2)', '#cards article:nth-child(3)']) { await moveTo(page, s, 30); await sleep(1500); }
    await sleep(1500);
  },
  async hindi(page) {
    await moveTo(page, '#lang');
    await page.selectOption('#lang', 'hi-IN');
    await sleep(1200);
    await clickOn(page, '#chips button:nth-child(2)', 2500);
    await moveTo(page, '#reply', 30);
    await sleep(2000);
    await moveTo(page, '#cards article:nth-child(3)', 30);
    await sleep(2500);
  },
  async emergency(page) {
    await sleep(600);
    await clickOn(page, '#chips button:nth-child(4)', 1500);
    await moveTo(page, '#emergency a', 30);
    await sleep(3500);
  },
  async simulator(page) {
    await page.evaluate(() => scrollTo({ top: 260, behavior: 'smooth' }));
    await sleep(1300);
    await moveTo(page, '#sim', 30);
    const now = await page.$eval('#sim', (el) => +el.value);
    await slide(page, '#sim', range(now, 30, -6));
    await sleep(1600);
    await slide(page, '#sim', range(30, 380, 5));
    await sleep(2600);
    await slide(page, '#sim', range(380, 160, -6));
    await sleep(1800);
  },
  async forecast(page) {
    await scrollToEl(page, '#forecast', 'center');
    const box = await page.locator('#fcChart').boundingBox();
    await page.mouse.move(box.x + 40, box.y + box.height * 0.6, { steps: 20 });
    for (let i = 0; i <= 23; i++) { await page.mouse.move(box.x + 40 + (box.width - 60) * (i / 23), box.y + box.height * 0.6, { steps: 6 }); await sleep(260); }
    await moveTo(page, '#fcWindow', 25);
    await sleep(2000);
  },
  async health(page) {
    await scrollToEl(page, '#hub', 'start', -10);
    await clickOn(page, '[data-tab=health]', 900);
    for (const i of [0, 5, 3]) await clickOn(page, `#scale button:nth-child(${i + 1})`, 1400);
    for (const i of [1, 4]) await clickOn(page, `#organs button:nth-child(${i + 1})`, 1700);
    await sleep(800);
  },
  async home(page) {
    await scrollToEl(page, '#hub', 'start', -10);
    await clickOn(page, '[data-tab=home]', 900);
    for (const i of [0, 2, 5, 9]) await clickOn(page, `#tips input >> nth=${i}`, 650);
    await moveTo(page, '#roomArea', 30);
    await slide(page, '#roomArea', range(14, 32, 1), 70);
    await sleep(2200);
  },
  async rules(page) {
    await scrollToEl(page, '#hub', 'start', -10);
    await clickOn(page, '[data-tab=rules]', 1500);
    await moveTo(page, '#limits', 30);
    await sleep(1500);
    await moveTo(page, '#cpcb', 30);
    await sleep(1500);
    await page.evaluate(() => scrollBy({ top: 420, behavior: 'smooth' }));
    await sleep(1200);
    for (const i of [2, 3, 0]) await clickOn(page, `#grapSteps button:nth-child(${i + 1})`, 1400);
    await sleep(600);
  },
  async myths(page) {
    await scrollToEl(page, '#hub', 'start', -10);
    await clickOn(page, '[data-tab=myths]', 900);
    for (const i of [1, 3, 6]) await clickOn(page, `.flip >> nth=${i}`, 2000);
    await sleep(1000);
  },
};

async function encode(frames, endMs, dir, outFile) {
  // Variable-rate frames -> constant 30 fps H.264 via an ffconcat list with per-frame durations.
  const lines = ['ffconcat version 1.0'];
  frames.forEach((f, i) => {
    const next = i + 1 < frames.length ? frames[i + 1].t : endMs / 1000;
    lines.push(`file f${String(i).padStart(5, '0')}.jpg`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`);
  });
  lines.push(`file f${String(frames.length - 1).padStart(5, '0')}.jpg`); // concat demuxer needs the last file repeated
  await writeFile(path.join(dir, 'list.txt'), lines.join('\n'));
  execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'),
    '-r', '30', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', outFile], { stdio: 'inherit' });
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const timings = {};
for (const [id, run] of Object.entries(SCENES)) {
  if (only && id !== only) continue;
  const dir = path.join(OUT, '_frames_' + id);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: SIZE, deviceScaleFactor: 1 });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#aqiSource')?.textContent.startsWith('Live') && document.querySelectorAll('.fc-bar').length > 0, null, { timeout: 30000 });
  await page.evaluate(() => { document.getElementById('autoSpeak').checked = false; }); // no Sarvam calls while recording
  await sleep(1500); // let tweens and fonts settle

  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  const writes = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const i = frames.length;
    frames.push({ t: metadata.timestamp });
    writes.push(writeFile(path.join(dir, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64')));
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: SIZE.width, maxHeight: SIZE.height, everyNthFrame: 1 });
  await sleep(300);
  await run(page);
  const endMs = Date.now();
  await cdp.send('Page.stopScreencast');
  await Promise.all(writes);
  await ctx.close();
  if (!frames.length) throw new Error('no frames captured for ' + id);
  // screencast timestamps are wall-clock seconds; align the end to the same clock
  await encode(frames, endMs, dir, path.join(OUT, id + '.mp4'));
  await rm(dir, { recursive: true, force: true });
  const duration = endMs / 1000 - frames[0].t;
  timings[id] = { duration: +duration.toFixed(2), frames: frames.length };
  console.log(`${id.padEnd(10)} ${duration.toFixed(1)}s  ${frames.length} frames`);
}
await browser.close();
const file = path.join(OUT, 'timings.json');
let existing = {};
try { existing = JSON.parse(await readFile(file, 'utf8')); } catch {}
await writeFile(file, JSON.stringify({ ...existing, ...timings }, null, 2));

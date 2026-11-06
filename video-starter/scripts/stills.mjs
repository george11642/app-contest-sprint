// Verification stills in one browser: node scripts/stills.mjs <outPrefix> <sec|f:frame> ...
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [prefix, ...ts] = process.argv.slice(2);
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { chromiumOptions });
const composition = await selectComposition({ serveUrl, id: "Hybrid", puppeteerInstance: browser, chromiumOptions });
fs.mkdirSync(path.dirname(prefix), { recursive: true });
for (const t of ts) {
  const frame = t.startsWith("f:") ? Number(t.slice(2)) : Math.round(Number(t) * 30);
  const output = `${prefix}_${String(frame).padStart(5, "0")}.jpg`;
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 85, puppeteerInstance: browser, chromiumOptions, scale: 0.5 });
  console.log(output);
}
await browser.close({ silent: true });

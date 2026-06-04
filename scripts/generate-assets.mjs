// One-off generator for the brutalist placeholder OG image + favicon.ico.
// Uses Playwright's chromium (already a dev dep) to render HTML → PNG, so we
// need NO build-time image libraries (TD5). Re-run after editing the wordmark:
//   node scripts/generate-assets.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PAPER = '#f4f1ea';
const INK = '#0b0b0b';
const NEON_PINK = '#ff2d95';
const NEON_GREEN = '#39ff14';
const GRADIENT = `linear-gradient(115deg, ${NEON_PINK} 10%, ${NEON_GREEN} 90%)`;

function dataUri(relPath) {
  const buf = readFileSync(new URL('../' + relPath, import.meta.url));
  return `data:font/woff2;base64,${buf.toString('base64')}`;
}
const display = dataUri('src/assets/fonts/anton-400.woff2');
const mono = dataUri('src/assets/fonts/ibm-plex-mono-400.woff2');

const fontFace = `
  @font-face { font-family:'AN'; src:url(${display}) format('woff2'); font-weight:400; }
  @font-face { font-family:'PM'; src:url(${mono}) format('woff2'); font-weight:400; }
`;

// Dark band-poster OG card: near-black stage, neon gradient kicker + dot, Anton headline.
const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontFace}
  *{margin:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{background:${INK};color:${PAPER};padding:76px;display:flex;flex-direction:column;justify-content:space-between;border:14px solid ${PAPER}}
  .kicker{font-family:'PM';font-weight:700;font-size:26px;letter-spacing:.2em;text-transform:uppercase;background-image:${GRADIENT};-webkit-background-clip:text;background-clip:text;color:transparent}
  h1{font-family:'AN';font-weight:400;font-size:128px;line-height:.9;letter-spacing:.005em;text-transform:uppercase;max-width:1040px}
  .mark{font-family:'AN';font-weight:400;font-size:46px;text-transform:uppercase;letter-spacing:.02em}
  .dot{background-image:${GRADIENT};-webkit-background-clip:text;background-clip:text;color:transparent}
</style></head><body>
  <div class="kicker">Organisationsingenieur · Agile Punk</div>
  <h1>Schluss mit Org&#8209;Theater.<br>Organisationen, die liefern.</h1>
  <div class="mark">RALPH CIB<span class="dot">.</span>IS</div>
</body></html>`;

const faviconSvg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');

const browser = await chromium.launch();
try {
  // --- OG image 1200x630 ---
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.setContent(ogHtml, { waitUntil: 'networkidle' });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: root + 'public/og-default.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await og.close();

  // --- favicon 32x32 PNG (from the SVG wordmark) ---
  const fav = await browser.newPage({ viewport: { width: 32, height: 32 }, deviceScaleFactor: 1 });
  await fav.setContent(
    `<!doctype html><html><body style="margin:0">${faviconSvg.replace('<svg', '<svg width="32" height="32"')}</body></html>`,
    { waitUntil: 'networkidle' },
  );
  const pngBuf = await fav.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: 32, height: 32 } });
  await fav.close();

  // Wrap the PNG in a single-image ICO container (ICO supports a PNG payload).
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8); // size of PNG data
  entry.writeUInt32LE(6 + 16, 12); // offset to PNG data
  writeFileSync(root + 'public/favicon.ico', Buffer.concat([header, entry, pngBuf]));

  console.log('Generated public/og-default.png and public/favicon.ico');
} finally {
  await browser.close();
}

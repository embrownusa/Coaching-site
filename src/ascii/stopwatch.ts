// @ts-nocheck
/*
 * ASCII stopwatch animation, made with Emily as a standalone artifact and
 * wrapped here so a page can start it on its own canvas and stop it on leave.
 * It sizes itself to the window, so give it a full-screen stage.
 */
export default function start(canvas: HTMLCanvasElement, imageUrl: string): () => void {
  let raf = 0
  let stopped = false


// ================================================================ settings
const FONT_SIZE = 10, FPS = 30;
const FONT = `${FONT_SIZE}px Menlo, Consolas, "DejaVu Sans Mono", "Courier New", monospace`;
const probe = document.createElement("canvas").getContext("2d");
probe.font = FONT;
const CW = Math.max(1, Math.round(probe.measureText("M").width)), CH = Math.round(FONT_SIZE * 1.15);
const ROWS = 150;
const COLS = Math.max(150, Math.min(640, Math.round(ROWS * CH / CW * innerWidth / Math.max(1, innerHeight))));
const N = COLS * ROWS, W = COLS * CW, H = ROWS * CH;

const settings = {
  glow: 0.65,        // bloom strength
  startAt: 1.8,      // seconds after load when the stopwatch starts
  trail: 55,         // degrees of blue afterglow behind the seconds hand
  hover: 2.5,        // gentle float, image pixels
};

const BUCKETS = [" ", ".'`", ":;,-~", "!/\\|()[]{}<>?+=", "tfjrxnuvczil", "XYUJCLQ0OZmwqpdbkhao", "#MW&8%B", "@$"];
const LEVELS = [0.06, 0.15, 0.30, 0.45, 0.60, 0.75, 0.90];

const RIDER = [0.86, 0.88, 0.92], BLUE = [0.12, 0.42, 1.0], TRACK = [0.55, 0.56, 0.60];

// source image (stopwatch cut-out, 794 x 942) and its dial, in image pixels
const IMG_W = 794, IMG_H = 942;
const DIAL = { cx: 430, cy: 575, R: 236 };            // white face
const PIV = [427, 573], SUB = [427, 485];             // seconds pivot, minutes sub-dial pivot

// ================================================================ math
const TAU = Math.PI * 2;
const clamp = (x, lo = 0, hi = 1) => (x < lo ? lo : x > hi ? hi : x);
function smoothstep(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }
function hash3(a, b, c) {
  let h = (Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
const h01 = (a, b, c) => hash3(a, b, c) / 4294967296;

// ================================================================ layout: where the rider sits on screen
let Hd = H * 0.86, Wd = Hd * IMG_W / IMG_H;
if (Wd > W * 0.62) { Wd = W * 0.62; Hd = Wd * IMG_H / IMG_W; }
const X0 = W * 0.5 - Wd / 2, Y0 = (H - Hd) / 2 + H * 0.01;
const PX = IMG_W / Wd;                              // image pixels per screen pixel

// ================================================================ buffers
const lum = new Float32Array(N), rgb = new Float32Array(N * 3), kind = new Uint8Array(N);
const reveal = new Float32Array(N);
for (let i = 0; i < N; i++) reveal[i] = h01(i, 3, 9);
function set(i, l, c, k = 0) { lum[i] = l; const j = i * 3; rgb[j] = c[0]; rgb[j + 1] = c[1]; rgb[j + 2] = c[2]; kind[i] = k; }
const leftEdge = new Int32Array(ROWS);            // leftmost rider column per row (-1 = none)

// mip of the cut-out at ~2 samples per character cell
let MW = 0, MH = 0, mipV = null, mipA = null;
function buildMip(img) {
  MW = Math.max(8, Math.round(Wd / CW * 2)); MH = Math.max(8, Math.round(Hd / CH * 2));
  const base = document.createElement("canvas"); base.width = img.width; base.height = img.height;
  const bx = base.getContext("2d"); bx.drawImage(img, 0, 0);
  bx.strokeStyle = bx.fillStyle = "rgb(238,238,238)"; bx.lineCap = "round";   // paint the printed hands out
  bx.lineWidth = 10; bx.beginPath(); bx.moveTo(379, 596); bx.lineTo(640, 464); bx.stroke();
  bx.lineWidth = 9; bx.beginPath(); bx.moveTo(427, 458); bx.lineTo(427, 518); bx.stroke();
  for (const [x, y] of [PIV, SUB]) { bx.beginPath(); bx.arc(x, y, 13, 0, TAU); bx.fill(); }
  let src = base, sw = img.width, sh = img.height;
  while (sw / 2 > MW && sh / 2 > MH) {             // halve step by step = clean box filter
    const c = document.createElement("canvas"); c.width = Math.round(sw / 2); c.height = Math.round(sh / 2);
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(src, 0, 0, c.width, c.height);
    src = c; sw = c.width; sh = c.height;
  }
  const c = document.createElement("canvas"); c.width = MW; c.height = MH;
  const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(src, 0, 0, MW, MH);
  const d = g.getImageData(0, 0, MW, MH).data;
  mipV = new Float32Array(MW * MH); mipA = new Float32Array(MW * MH);
  for (let k = 0; k < MW * MH; k++) {
    mipV[k] = (0.299 * d[k * 4] + 0.587 * d[k * 4 + 1] + 0.114 * d[k * 4 + 2]) / 255;
    mipA[k] = d[k * 4 + 3] / 255;
  }
}
let sV = 0, sA = 0;
function sample(u, v) {                           // u,v in image pixels -> bilinear (sV, sA)
  const x = u / IMG_W * MW - 0.5, y = v / IMG_H * MH - 0.5;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  sV = 0; sA = 0;
  for (let k = 0; k < 4; k++) {
    const xx = x0 + (k & 1), yy = y0 + (k >> 1);
    if (xx < 0 || yy < 0 || xx >= MW || yy >= MH) continue;
    const w = ((k & 1) ? fx : 1 - fx) * ((k >> 1) ? fy : 1 - fy), m = yy * MW + xx;
    sA += mipA[m] * w; sV += mipV[m] * mipA[m] * w;
  }
  if (sA > 1e-3) sV /= sA;
}

const hoverAt = (t) => settings.hover * Math.sin(TAU * t / 4.5);
function riderAt(u, v, t) { sample(u, v + hoverAt(t)); }

function segDist(px, py, ax, ay, bx, by) {           // distance from p to segment ab
  const dx = bx - ax, dy = by - ay, k = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy + 1e-9));
  return Math.hypot(px - ax - dx * k, py - ay - dy * k);
}
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const HAND = [0.55, 0.78, 1.0];

// ================================================================ scene
function scene(t) {
  lum.fill(0); kind.fill(0);
  const intro = smoothstep(0, 1.6, t), hov = hoverAt(t);
  const run = Math.max(0, t - settings.startAt);
  const secA = TAU * (run % 60) / 60, minA = TAU * (run % 1800) / 1800;   // clockwise from 12
  const sd = [Math.sin(secA), -Math.cos(secA)], md = [Math.sin(minA), -Math.cos(minA)];
  const thick = 0.55 * CH * PX;                       // hand half-width in image pixels (about one row)
  const trailA = settings.trail * Math.PI / 180 * smoothstep(0, 1.5, run);

  const r0 = Math.max(0, Math.floor(Y0 / CH) - 4), r1 = Math.min(ROWS, Math.ceil((Y0 + Hd) / CH) + 4);
  const c0 = Math.max(0, Math.floor(X0 / CW) - 2), c1 = Math.min(COLS, Math.ceil((X0 + Wd) / CW) + 2);
  const du = CW * PX * 0.9, dv = CH * PX * 0.9;
  for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {
    const i = r * COLS + c;
    if (reveal[i] > intro * 1.15) continue;
    const u = ((c + 0.5) * CW - X0) * PX, v = ((r + 0.5) * CH - Y0) * PX, vi = v + hov;
    riderAt(u, v, t);
    const a = sA;
    let val = sV;
    if (a < 0.4) continue;
    riderAt(u - du, v, t); const aL = sA;
    riderAt(u + du, v, t); const aR = sA;
    riderAt(u, v - dv, t); const aU = sA;
    riderAt(u, v + dv, t); const aD = sA;
    const edge = clamp((a - Math.min(aL, aR, aU, aD)) * 1.6);
    const fx = u - DIAL.cx, fy = vi - DIAL.cy, fr = Math.hypot(fx, fy);
    const face = fr < DIAL.R;
    let L, col = RIDER;
    if (face) {                                         // dial face inverted: dark face, glowing numerals
      L = 0.07 + 1.0 * Math.pow(clamp((0.93 - val) / 0.75), 0.8);
      // blue afterglow sweeping behind the seconds hand
      const ang = (Math.atan2(u - PIV[0], -(vi - PIV[1])) + TAU) % TAU;
      const behind = (secA - ang + TAU) % TAU;
      if (trailA > 0 && behind < trailA && fr < DIAL.R * 0.97) {
        const k = Math.pow(1 - behind / trailA, 1.6);
        col = lerp3(RIDER, BLUE, Math.min(1, 0.4 + k));
        L = Math.max(L, 0.1 + 0.32 * k);
      }
    } else {
      L = 0.12 + 1.0 * Math.pow(clamp((val - 0.04) / 0.85), 0.85);    // case, crown, ring
      L = Math.max(L, 0.42 * edge);
      const back = clamp((a - aL) * 2.2) * edge;
      if (back > 0.25) { col = lerp3(RIDER, BLUE, clamp(back * 1.2)); L = Math.max(L, 0.5 + 0.25 * back); }
    }
    // the live hands
    if (face) {
      const ds = segDist(u, vi, PIV[0] - sd[0] * 52, PIV[1] - sd[1] * 52, PIV[0] + sd[0] * 228, PIV[1] + sd[1] * 228);
      const dm = segDist(u, vi, SUB[0] - md[0] * 16, SUB[1] - md[1] * 16, SUB[0] + md[0] * 34, SUB[1] + md[1] * 34);
      if (ds < thick) { L = 1; col = HAND; }
      if (dm < thick) { L = 0.95; col = HAND; }
      if (Math.hypot(u - PIV[0], vi - PIV[1]) < thick * 1.4 || Math.hypot(u - SUB[0], vi - SUB[1]) < thick * 1.1) { L = 1; col = [1, 1, 1]; }
    }
    set(i, clamp(L) * (0.6 + 0.4 * intro), col, 1);
  }

  // drifting dust motes
  const off = Math.floor(t * 12);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    if (lum[i] > 0.05) continue;
    if (hash3(c, r + off, 77) % 1000 < 2) set(i, 0.15 * intro, r % 5 === 0 ? BLUE : TRACK, 3);
  }
}

// ================================================================ glyphs -> pixels
const view = canvas, ctx = view.getContext("2d");
view.width = W; view.height = H;
const CHARS = BUCKETS.join(""), START = [], COUNT = BUCKETS.map((b) => b.length);
BUCKETS.reduce((s, b, k) => { START[k] = s; return s + b.length; }, 0);
const MASKS = [...CHARS].map((ch) => {
  const g = document.createElement("canvas"); g.width = CW; g.height = CH;
  const gx = g.getContext("2d");
  gx.font = FONT; gx.textBaseline = "top"; gx.fillStyle = "#fff"; gx.fillText(ch, 0, 0);
  const d = gx.getImageData(0, 0, CW, CH).data, m = new Uint8Array(CW * CH);
  for (let k = 0; k < m.length; k++) m[k] = d[k * 4 + 3];
  return m;
});
const ascii = document.createElement("canvas"); ascii.width = W; ascii.height = H;
const actx = ascii.getContext("2d");
const img = actx.createImageData(W, H), px32 = new Uint32Array(img.data.buffer);
const glowA = document.createElement("canvas"), glowB = document.createElement("canvas"), glowC = document.createElement("canvas");
[[glowA, 2], [glowB, 4], [glowC, 8]].forEach(([g, s]) => { g.width = Math.ceil(W / s); g.height = Math.ceil(H / s); });

function draw(frame) {
  px32.fill(0);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c, L = lum[i];
    let level = 0;
    while (level < LEVELS.length && L >= LEVELS[level]) level++;
    if (level === 0) continue;
    const fidx = kind[i] === 1 ? Math.floor(frame / 8) : Math.floor(frame / 3);   // rider shimmers slower
    const m = MASKS[START[level] + hash3(r, c, fidx) % COUNT[level]];
    const k = (0.45 + 0.75 * L) * 1.6, j = i * 3;
    const pr = Math.min(255, 255 * rgb[j] * k) | 0, pg = Math.min(255, 255 * rgb[j + 1] * k) | 0, pb = Math.min(255, 255 * rgb[j + 2] * k) | 0;
    const rgb24 = (pb << 16) | (pg << 8) | pr;
    let o0 = r * CH * W + c * CW, mi = 0;
    for (let y = 0; y < CH; y++, o0 += W) for (let x = 0; x < CW; x++, mi++) {
      const v = m[mi];
      if (v) px32[o0 + x] = (v << 24) | rgb24;
    }
  }
  actx.putImageData(img, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(ascii, 0, 0);
  if (settings.glow > 0) {
    let src = ascii;
    for (const g of [glowA, glowB, glowC]) {
      const gx = g.getContext("2d");
      gx.imageSmoothingEnabled = true; gx.clearRect(0, 0, g.width, g.height);
      gx.drawImage(src, 0, 0, g.width, g.height); src = g;
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = Math.min(1, settings.glow);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(glowC, 0, 0, W, H);
    ctx.restore();
  }
}

// ================================================================ run
const source = new Image();
source.onload = () => {
  buildMip(source);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {   // one still frame, no animation
    scene(6); draw(180); return;
  }
  let t0 = performance.now(), lastDraw = -1e9;
  function tick(now) {
    if (stopped) return;
    if (now - lastDraw >= 1000 / FPS - 2) {
      lastDraw = now;
      const t = (now - t0) / 1000;
      scene(t);
      draw(Math.floor(t * FPS));
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
};
source.src = imageUrl;


  return () => {
    stopped = true
    cancelAnimationFrame(raf)
    source.onload = null
  }
}

// @ts-nocheck
/*
 * ASCII cyclist animation, made with Emily as a standalone artifact and
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
  trailSpeed: 34,    // blue trail flow, cells per second
  trackSpeed: 22,    // track texture flow, cells per second
  wheelRev: 0.45,    // wheel revolutions per second
};

const BUCKETS = [" ", ".'`", ":;,-~", "!/\\|()[]{}<>?+=", "tfjrxnuvczil", "XYUJCLQ0OZmwqpdbkhao", "#MW&8%B", "@$"];
const LEVELS = [0.06, 0.15, 0.30, 0.45, 0.60, 0.75, 0.90];

const RIDER = [0.86, 0.88, 0.92], BLUE = [0.12, 0.42, 1.0], TRACK = [0.55, 0.56, 0.60];

// source image (cyclist cut-out, 764 x 778) and its wheels in image pixels
const IMG_W = 764, IMG_H = 778;
const WHEELS = [{ cx: 191, cy: 549, R: 112 }, { cx: 553, cy: 511, R: 113 }];

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
const X0 = W * 0.6 - Wd / 2, Y0 = (H - Hd) / 2 + H * 0.01;
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
  let src = img, sw = img.width, sh = img.height;
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

// rider sample with wheel spin + a gentle body sway
function riderAt(u, v, t) {
  for (const w of WHEELS) {
    const dx = u - w.cx, dy = v - w.cy, d = Math.hypot(dx, dy);
    if (d < w.R * 1.03) {
      const a = -TAU * settings.wheelRev * t, ca = Math.cos(a), sa = Math.sin(a);
      sample(w.cx + dx * ca - dy * sa, w.cy + dx * sa + dy * ca);
      if (d < w.R * 0.8) sV = Math.min(sV, 0.03 + 0.09 * Math.pow(0.5 + 0.5 * Math.cos(5 * Math.atan2(dy, dx) + a * 5), 4));
      if (d < w.R * 0.14) sV = Math.max(sV, 0.25);          // hub
      return;
    }
  }
  // everything above the wheels breathes a little: torso rocks ~1.5px, arms/head follow
  const body = smoothstep(470, 300, v);
  const sway = Math.sin(TAU * t / 2.2) * 1.6 * body + Math.sin(TAU * t / 5.3 + v * 0.02) * 1.2 * body;
  sample(u - sway * 0.6, v - sway);
}

// ================================================================ scene
const TRACK_LINES = [0.27, 0.33, 0.46, 0.77, 0.92];
function scene(t) {
  lum.fill(0); kind.fill(0); leftEdge.fill(-1);
  const intro = smoothstep(0, 1.6, t);

  // --- rider
  const r0 = Math.max(0, Math.floor(Y0 / CH) - 2), r1 = Math.min(ROWS, Math.ceil((Y0 + Hd) / CH) + 2);
  const c0 = Math.max(0, Math.floor(X0 / CW) - 2), c1 = Math.min(COLS, Math.ceil((X0 + Wd) / CW) + 2);
  const du = CW * PX * 0.9, dv = CH * PX * 0.9;
  for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {
    const i = r * COLS + c;
    if (reveal[i] > intro * 1.15) continue;
    const u = ((c + 0.5) * CW - X0) * PX, v = ((r + 0.5) * CH - Y0) * PX;
    riderAt(u, v, t);
    const a = sA, val = sV;
    if (a < 0.4) continue;
    // edge test: how much of the neighbourhood is empty
    riderAt(u - du, v, t); const aL = sA;
    riderAt(u + du, v, t); const aR = sA;
    riderAt(u, v - dv, t); const aU = sA;
    riderAt(u, v + dv, t); const aD = sA;
    const edge = clamp((a - Math.min(aL, aR, aU, aD)) * 1.6);
    let L = 0.08 + 1.05 * Math.pow(clamp((val - 0.04) / 0.8), 0.9);
    L = Math.max(L, 0.42 * edge);
    let col = RIDER;
    const back = clamp((a - aL) * 2.2) * edge;               // trailing (left) edges catch blue light
    if (back > 0.25) {
      const k = clamp(back * 1.2);
      col = [RIDER[0] + (BLUE[0] - RIDER[0]) * k, RIDER[1] + (BLUE[1] - RIDER[1]) * k, RIDER[2] + (BLUE[2] - RIDER[2]) * k];
      L = Math.max(L, 0.5 + 0.25 * back);
    }
    set(i, clamp(L) * (0.6 + 0.4 * intro), col, 1);
    if (leftEdge[r] < 0) leftEdge[r] = c;
  }

  // --- background track lines, streaming left
  const slope = -0.035 * W / H;
  for (const f of TRACK_LINES) {
    for (let c = 0; c < COLS; c++) {
      const yc = (f * H + slope * ((c + 0.5) * CW - W / 2) * (H / W)) / CH;
      for (let r = Math.floor(yc - 1); r <= Math.ceil(yc + 1); r++) {
        if (r < 0 || r >= ROWS) continue;
        const i = r * COLS + c;
        if (kind[i]) continue;
        const d = Math.abs(r + 0.5 - yc);
        if (d > 0.8) continue;
        const ph = Math.floor((c + t * settings.trackSpeed) / 2);
        const n = 0.55 + 0.45 * h01(ph, Math.round(f * 100), 4);
        set(i, (0.10 + 0.16 * (1 - d / 0.8)) * n * intro, TRACK);
      }
    }
  }

  // --- blue speed trails peeling off the back of the rider
  for (let r = 0; r < ROWS; r++) {
    const le = leftEdge[r];
    if (le < 0) continue;
    const lane = h01(r, 0, 11);
    if (lane > 0.42) continue;                                 // only some rows carry a trail
    const spd = settings.trailSpeed * (0.7 + 0.6 * h01(r, 1, 11));
    const reach = COLS * (0.12 + 0.3 * h01(r, 2, 11)) * (0.75 + 0.25 * Math.sin(TAU * t / 4 + r * 0.3));
    const seg = 4 + Math.floor(h01(r, 3, 11) * 10);
    for (let c = le - 1; c >= 0 && c > le - reach; c--) {
      const i = r * COLS + c;
      if (kind[i]) continue;
      const ph = Math.floor((c + t * spd) / seg);
      if (h01(ph, r, 12) < 0.35) continue;                     // gaps flowing with the segment
      const fall = 1 - (le - c) / reach;
      set(i, Math.max(lum[i], (0.12 + 0.55 * fall * fall) * intro), BLUE, 2);
    }
  }

  // --- drifting dust motes
  const off = Math.floor(t * 30);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    if (lum[i] > 0.05) continue;
    if (hash3(c + off, r, 77) % 1000 < 2) set(i, 0.16 * intro, r % 7 === 0 ? BLUE : TRACK, 3);
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

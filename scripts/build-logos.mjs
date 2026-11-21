// Logo "pin + huella": isologo (horizontal, vertical, cuadrado), logotipo, símbolo, íconos de app e imagen social.
// Nombre en Outfit 600 (minúsculas), eslogan en Outfit 500. Textos convertidos a trazos.
//   node scripts/build-logos.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import opentype from "opentype.js"
import sharp from "sharp"

const TEAL = "#0f766e", ORANGE = "#c2410c", ORANGE_LIGHT = "#fdba74", CREAM = "#faf8f3", MUTED = "#3d5655"
const NAME = ["busco mi", "mascota"], SLOGAN = "Juntos, de vuelta a casa"

const font = (f) => {
  const b = readFileSync(f)
  const o = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength))
  o.tables.gsub = null
  return o
}
const bold = font("scripts/fonts/outfit-600.woff"), med = font("scripts/fonts/outfit-500.woff")
const n = (v) => +v.toFixed(2)
const D = (cmds) => cmds.map((c) => {
  if (c.type === "Z") return "Z"
  const p = c.type === "M" || c.type === "L" ? [c.x, c.y] : c.type === "Q" ? [c.x1, c.y1, c.x, c.y] : [c.x1, c.y1, c.x2, c.y2, c.x, c.y]
  return c.type + p.map(n).join(" ")
}).join("")
const w = (t, s, f = bold, ls = 0) => f.getAdvanceWidth(t, s, { letterSpacing: ls / s })
const txt = (t, x, y, s, fill, f = bold, ls = 0) => `<path fill="${fill}" d="${D(f.getPath(t, x, y, s, { letterSpacing: ls / s }).commands)}"/>`
const centered = (t, cx, y, s, fill, f = bold, ls = 0) => txt(t, cx - w(t, s, f, ls) / 2, y, s, fill, f, ls)

// Símbolo en caja 100 x 124: pin con huella recortada y un punto de suelo naranja (la mascota encontrada).
const V = {
  color: { pin: TEAL, ground: ORANGE, a: TEAL, b: ORANGE, slogan: MUTED, fond: null },
  claro: { pin: CREAM, ground: ORANGE_LIGHT, a: CREAM, b: ORANGE_LIGHT, slogan: CREAM, fond: TEAL },
  blanco: { pin: "#fff", ground: "#fff", a: "#fff", b: "#fff", slogan: "#fff", fond: null },
  negro: { pin: "#000", ground: "#000", a: "#000", b: "#000", slogan: "#000", fond: null },
}
const SW = 100, SH = 124
const toe = (cx, cy, rx, ry, a) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${cx} ${cy})"/>`
const paw = toe(50, 59, 15, 11.5, 0) + toe(31.5, 47, 5.5, 7.5, -28) + toe(43, 36.5, 5.8, 8.2, -9) + toe(57, 36.5, 5.8, 8.2, 9) + toe(68.5, 47, 5.5, 7.5, 28)
const symbol = (v) => `<mask id="p"><rect width="${SW}" height="${SH}" fill="#fff"/><g fill="#000">${paw}</g></mask>` +
  `<path mask="url(#p)" fill="${v.pin}" d="M50 112C50 112 8 78 8 46a42 42 0 1 1 84 0C92 78 50 112 50 112Z"/>` +
  `<ellipse cx="50" cy="118.5" rx="17" ry="4.2" fill="${v.ground}"/>`
const place = (v, x, y, h) => `<g transform="translate(${n(x)} ${n(y)}) scale(${n(h / SH)})">${symbol(v)}</g>`
const sw = (h) => (h * SW) / SH
const doc = (W, H, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Busco mi mascota. ${SLOGAN}">${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ""}${body}</svg>\n`

const cap = (s) => (bold.charToGlyph("b").getBoundingBox().y2 / bold.unitsPerEm) * s // altura del ascendente "b"
const SS = (s) => s * 0.3 // tamaño del eslogan respecto al nombre
const sl = (cx, y, s, fill) => centered(SLOGAN, cx, y, SS(s), fill, med, 0.4)
const slL = (x, y, s, fill) => txt(SLOGAN, x, y, SS(s), fill, med, 0.4)

// Símbolo arriba, nombre en una línea bicolor y eslogan, centrado. fixed = lienzo cuadrado centrado en vertical.
function stack(v, symH, sz, M, fixed) {
  const wt = w("busco mi ", sz) + w("mascota", sz), gap = 28
  const blockH = symH + gap + cap(sz) + 34 + SS(sz) * 0.72
  const W = fixed ? 1080 : Math.ceil(Math.max(wt, sw(symH)) + M * 2), H = fixed ? 1080 : Math.ceil(blockH + M * 2)
  const top = fixed ? (H - blockH) / 2 : M, yA = top + symH + gap + cap(sz), x0 = W / 2 - wt / 2
  return {
    w: W, h: H,
    body: place(v, W / 2 - sw(symH) / 2, top, symH) + txt("busco mi", x0, yA, sz, v.a) + txt("mascota", x0 + w("busco mi ", sz), yA, sz, v.b) +
      sl(W / 2, yA + 34 + SS(sz) * 0.72, sz, v.slogan),
  }
}

const layouts = {
  "isologo-horizontal"(v) {
    const sz = 62, M = 20, symH = 150, lh = sz * 0.98, tx = M + sw(symH) + 30
    const blockH = cap(sz) + lh + 14 + SS(sz) * 0.72, top = M + (symH - blockH) / 2
    const yA = top + cap(sz), yB = yA + lh, yS = yB + 14 + SS(sz) * 0.72
    const W = Math.ceil(tx + Math.max(w(NAME[0], sz), w(NAME[1], sz), w(SLOGAN, SS(sz), med, 0.4)) + M)
    return { w: W, h: symH + M * 2, body: place(v, M, M, symH) + txt(NAME[0], tx, yA, sz, v.a) + txt(NAME[1], tx, yB, sz, v.b) + slL(tx, yS, sz, v.slogan) }
  },
  "isologo-vertical"(v) { return stack(v, 220, 76, 40) },
  "isologo-cuadrado"(v) { return stack(v, 440, 120, 0, true) },
  "logotipo-horizontal"(v) {
    const sz = 84, M = 30, wt = w("busco mi ", sz) + w("mascota", sz), W = Math.ceil(wt + M * 2)
    const yA = M + cap(sz), yS = yA + 20 + SS(sz) * 0.72
    return { w: W, h: Math.ceil(yS + M), body: txt("busco mi", M, yA, sz, v.a) + txt("mascota", M + w("busco mi ", sz), yA, sz, v.b) + slL(M, yS, sz, v.slogan) }
  },
}

const out = "public/brand"
mkdirSync(out, { recursive: true })
const sheet = []
for (const [name, fn] of Object.entries(layouts)) {
  for (const [vk, v] of Object.entries(V)) {
    const suf = vk === "color" ? "" : `-${vk}`, { w: W, h: H, body } = fn(v), svg = doc(W, H, body, v.fond)
    writeFileSync(`${out}/${name}${suf}.svg`, svg)
    await sharp(Buffer.from(svg), { density: 300 }).resize({ width: Math.min(1600, W * 2) }).png().toFile(`${out}/${name}${suf}.png`)
    sheet.push({ name, vk, W, H, body, fond: v.fond })
  }
}
// Símbolo solo por versión.
for (const [vk, v] of Object.entries(V)) {
  writeFileSync(`${out}/simbolo${vk === "color" ? "" : `-${vk}`}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}">${v.fond ? `<rect width="${SW}" height="${SH}" fill="${v.fond}"/>` : ""}${symbol(v)}</svg>\n`)
}
writeFileSync("public/logo_symbol.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" role="img" aria-label="Busco mi mascota">${symbol(V.color)}</svg>\n`)
writeFileSync("src/app/icon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}">${symbol(V.color)}</svg>\n`)

// Ícono cuadrado (app, avatar de redes): fondo teal, símbolo crema. pad = margen.
const appIcon = (S, pad) => {
  const h = S * (1 - pad * 2)
  return doc(S, S, place(V.claro, (S - sw(h)) / 2, (S - h) / 2, h), TEAL)
}
writeFileSync(`${out}/simbolo-cuadrado.svg`, appIcon(1080, 0.2))
writeFileSync(`${out}/social-avatar.svg`, appIcon(1080, 0.2))
await sharp(Buffer.from(appIcon(1080, 0.2))).png().toFile(`${out}/social-avatar.png`)
mkdirSync("public/icons", { recursive: true })
for (const s of [72, 96, 128, 144, 152, 180, 192, 384, 512]) {
  await sharp(Buffer.from(appIcon(512, 0.14)), { density: 384 }).resize(s, s).png().toFile(`public/icons/icon-${s}x${s}.png`)
}
await sharp(Buffer.from(appIcon(512, 0.28))).png().toFile("public/icons/maskable-512x512.png")

// Imagen social 1200x630.
{
  const x0 = 620, yA = 300
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${CREAM}"/><rect width="1200" height="14" fill="${TEAL}"/>${place(V.color, 110, 85, 460)}${txt("busco mi", x0, yA, 84, TEAL)}${txt("mascota", x0, yA + 100, 84, ORANGE)}${slL(x0, yA + 170, 84 * 1.1, MUTED)}</svg>`
  await sharp(Buffer.from(og)).png().toFile("public/og.png")
}

// Lámina de revisión: una fila por pieza, las 4 versiones.
{
  const CW = 460; let y = 20, body = ""
  for (const name of Object.keys(layouts)) {
    const rowH = name === "isologo-cuadrado" ? 440 : 220
    Object.keys(V).forEach((vk, i) => {
      const p = sheet.find((q) => q.name === name && q.vk === vk), k = Math.min((CW - 30) / p.W, rowH / p.H)
      const bg = p.fond || (vk === "blanco" ? "#0b2b2a" : null), x = 20 + i * CW
      if (bg) body += `<rect x="${x - 8}" y="${y - 8}" width="${p.W * k + 16}" height="${p.H * k + 16}" rx="10" fill="${bg}"/>`
      body += `<g transform="translate(${x} ${y}) scale(${k})">${p.body}</g>`
    })
    y += rowH + 40
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CW * 4 + 20} ${y}" width="${CW * 4 + 20}" height="${y}"><rect width="100%" height="100%" fill="${CREAM}"/>${body}</svg>`
  await sharp(Buffer.from(svg), { density: 90 }).png().toFile(`${out}/revision.png`)
}
console.log("Logos generados")

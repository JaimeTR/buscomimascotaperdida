// Genera los 3 modelos de logo (isologo + logotipo, color y claro) y una lámina comparativa.
//   node scripts/build-models.mjs
// Salida: public/brand/modelos/modelo-N/*.svg|png, opciones.png y simbolo-perro/gato.svg
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { NAME, SLOGAN, VIEW, TEAL, ORANGE, MUTED, CREAM } from "./brand-core.mjs"
import { bold, medium, width, path, doc } from "./brand-text.mjs"
import { model1, model2, model3, dogOnly, catOnly, variants } from "./brand-models.mjs"

const SL = SLOGAN
// Escribe tramos de color seguidos en una línea; devuelve el svg y su ancho.
const run = (parts, x, y, size, ls = 0, font = bold) => {
  let cx = x, svg = ""
  for (const [text, fill] of parts) { svg += path(font, text, cx, y, size, fill, ls); cx += width(font, text, size, ls) }
  return { svg, w: cx - x }
}
const sym = (fn, v, x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / VIEW})">${fn(v)}</g>`

// ───── Modelo 1: Título, horizontal. Modelo 2: minúsculas, horizontal. Modelo 3: mayúsculas, vertical ─────
const MODELS = [
  {
    fn: model1,
    isologo(v) {
      const S = 230, tx = 8 + S * 0.8 + 22, size = 70
      const a = run([[NAME[0], v.wordA]], tx, 106, size), b = run([[NAME[1], v.wordB]], tx, 172, size)
      const sl = path(medium, SL.toUpperCase(), tx, 218, 22, v.slogan, 3)
      const W = Math.ceil(tx + Math.max(a.w, b.w, width(medium, SL.toUpperCase(), 22, 3)) + 24)
      return { w: W, h: 246, body: sym(this.fn, v, 0, 8, S) + a.svg + b.svg + sl }
    },
    logotipo(v) {
      const size = 120, pad = 40, a = run([[NAME[0] + " ", v.wordA], [NAME[1], v.wordB]], pad, 130, size)
      const sw = width(medium, SL.toUpperCase(), 30, 5), W = Math.ceil(a.w + pad * 2)
      return { w: W, h: 250, body: a.svg + path(medium, SL.toUpperCase(), (W - sw) / 2, 196, 30, v.slogan, 5) }
    },
  },
  {
    fn: model2,
    isologo(v) {
      const S = 230, tx = 8 + S * 0.8 + 22, size = 72
      const a = run([["busco mi", v.wordA]], tx, 106, size), b = run([["mascota", v.wordB]], tx, 174, size)
      const dot = `<circle cx="${tx + b.w + 12}" cy="${174 - 7}" r="7.5" fill="${v.wordB}"/>`
      const low = SL.toLowerCase()
      const sl = path(medium, low, tx, 220, 28, v.slogan, 0.5)
      const W = Math.ceil(tx + Math.max(a.w, b.w + 24, width(medium, low, 28, 0.5)) + 24)
      return { w: W, h: 246, body: sym(this.fn, v, 0, 8, S) + a.svg + b.svg + dot + sl }
    },
    logotipo(v) {
      const size = 118, pad = 40
      const a = run([["busco mi ", v.wordA], ["mascota", v.wordB]], pad, 128, size)
      const low = SL.toLowerCase(), W = Math.ceil(a.w + pad * 2 + 26)
      const dot = `<circle cx="${pad + a.w + 14}" cy="${128 - 10}" r="9.5" fill="${v.wordB}"/>`
      return { w: W, h: 230, body: a.svg + dot + path(medium, low, pad + 4, 188, 34, v.slogan, 1) }
    },
  },
  {
    fn: model3,
    isologo(v) {
      const S = 220, size = 62, ls = 6
      const a = run([["BUSCO MI ", v.wordA], ["MASCOTA", v.wordB]], 0, 0, size, ls)
      const sw = width(medium, SL.toUpperCase(), 21, 6), W = Math.ceil(Math.max(a.w, sw, S) + 80)
      const x0 = (W - a.w) / 2
      const a2 = run([["BUSCO MI ", v.wordA], ["MASCOTA", v.wordB]], x0, S + 82, size, ls)
      return { w: W, h: S + 154, body: sym(this.fn, v, (W - S) / 2, 4, S) + a2.svg + path(medium, SL.toUpperCase(), (W - sw) / 2, S + 128, 21, v.slogan, 6) }
    },
    logotipo(v) {
      const size = 100, ls = 9, pad = 50
      const a = run([["BUSCO MI", v.wordA]], 0, 0, size, ls), b = run([["MASCOTA", v.wordB]], 0, 0, size, ls)
      const sw = width(medium, SL.toUpperCase(), 26, 8), W = Math.ceil(Math.max(a.w, b.w, sw) + pad * 2)
      const a2 = run([["BUSCO MI", v.wordA]], (W - a.w) / 2, 112, size, ls), b2 = run([["MASCOTA", v.wordB]], (W - b.w) / 2, 216, size, ls)
      return { w: W, h: 300, body: a2.svg + b2.svg + path(medium, SL.toUpperCase(), (W - sw) / 2, 268, 26, v.slogan, 8) }
    },
  },
]

const root = "public/brand/modelos"
mkdirSync(root, { recursive: true })
const pieces = []
for (const [i, m] of MODELS.entries()) {
  const dir = `${root}/modelo-${i + 1}`
  mkdirSync(dir, { recursive: true })
  for (const [vk, v] of Object.entries(variants)) {
    const suf = vk === "claro" ? "-claro" : ""
    for (const kind of ["isologo", "logotipo"]) {
      const { w, h, body } = m[kind](v)
      const svg = doc(w, h, body, v.fond)
      writeFileSync(`${dir}/${kind}${suf}.svg`, svg)
      await sharp(Buffer.from(svg), { density: 300 }).resize({ width: 1600 }).png().toFile(`${dir}/${kind}${suf}.png`)
      pieces.push({ i, vk, kind, w, h, body, fond: v.fond })
    }
  }
  writeFileSync(`${dir}/simbolo.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}">${m.fn(variants.color)}</svg>\n`)
}

// Símbolos sueltos: solo perro y solo gato.
for (const [name, fn] of [["perro", dogOnly], ["gato", catOnly]]) {
  writeFileSync(`${root}/simbolo-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}">${fn(variants.color)}</svg>\n`)
}

// Lámina comparativa: 3 columnas (modelos) × [isologo, logotipo, isologo claro, logotipo claro].
const COL = 700, PAD = 30
const label = (t, x, y) => path(bold, t, x, y, 34, TEAL)
let sheet = `<rect width="${COL * 3}" height="1480" fill="${CREAM}"/>`
for (const [i] of MODELS.entries()) {
  const x0 = i * COL
  sheet += label(`MODELO ${i + 1}`, x0 + PAD, 56)
  let y = 90
  for (const [vk, kind] of [["color", "isologo"], ["color", "logotipo"], ["claro", "isologo"], ["claro", "logotipo"]]) {
    const p = pieces.find((q) => q.i === i && q.vk === vk && q.kind === kind)
    const k = (COL - PAD * 2) / p.w, hh = p.h * k
    if (p.fond) sheet += `<rect x="${x0 + PAD - 10}" y="${y - 10}" width="${COL - PAD * 2 + 20}" height="${hh + 20}" rx="14" fill="${p.fond}"/>`
    sheet += `<g transform="translate(${x0 + PAD} ${y}) scale(${k})">${p.body}</g>`
    y += hh + 36
  }
  if (i > 0) sheet += `<rect x="${x0 - 1}" y="20" width="2" height="1440" fill="#e3ded2"/>`
}
const sheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COL * 3} 1480" width="${COL * 3}" height="1480">${sheet}</svg>`
await sharp(Buffer.from(sheetSvg), { density: 200 }).resize({ width: 2400 }).png().toFile(`${root}/opciones.png`)

// Lámina de símbolos sueltos (perro, gato) para revisar rápido.
const tile = (x, fn, bg) => `<g transform="translate(${x} 0)"><rect width="300" height="300" fill="${bg}"/><g transform="scale(2.5)">${fn(bg === TEAL ? variants.claro : variants.color)}</g></g>`
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300">${tile(0, dogOnly, CREAM)}${tile(300, catOnly, CREAM)}${tile(600, dogOnly, TEAL)}${tile(900, catOnly, TEAL)}</svg>`)).png().toFile(`${root}/solos.png`)
// ───── Piezas definitivas (modelo elegido: 1) en public/brand/ ─────
const CHOSEN = 0
const out = "public/brand"
for (const [vk, v] of Object.entries(variants)) {
  const suf = vk === "claro" ? "-claro" : ""
  for (const kind of ["isologo", "logotipo"]) {
    const { w, h, body } = MODELS[CHOSEN][kind](v)
    const svg = doc(w, h, body, v.fond)
    writeFileSync(`${out}/${kind}${suf}.svg`, svg)
    await sharp(Buffer.from(svg), { density: 300 }).resize({ width: 1600 }).png().toFile(`${out}/${kind}${suf}.png`)
  }
}
const fn = MODELS[CHOSEN].fn
// Avatar de redes 1080 (recorte circular seguro).
{
  const S = 6.4, off = (1080 - VIEW * S) / 2
  const svg = doc(1080, 1080, `<g transform="translate(${off} ${off}) scale(${S})">${fn(variants.claro)}</g>`, TEAL)
  writeFileSync(`${out}/social-avatar.svg`, svg); await sharp(Buffer.from(svg)).png().toFile(`${out}/social-avatar.png`)
}
// Cuadrado de publicación 1080: símbolo, nombre, eslogan y dominio.
{
  const S = 4.4, size = 104, sl = 32, ls = 6
  const a = NAME[0] + " ", wa = width(bold, a, size), wn = wa + width(bold, NAME[1], size)
  const wsl = width(medium, SL.toUpperCase(), sl, ls), x0 = (1080 - wn) / 2
  const dom = "buscomimascotaperdida.com"
  const body =
    `<rect width="1080" height="18" fill="${TEAL}"/>` +
    `<g transform="translate(${(1080 - VIEW * S) / 2} 100) scale(${S})">${fn(variants.color)}</g>` +
    path(bold, a, x0, 770, size, TEAL) + path(bold, NAME[1], x0 + wa, 770, size, ORANGE) +
    path(medium, SL.toUpperCase(), (1080 - wsl) / 2, 850, sl, MUTED, ls) +
    `<rect x="340" y="920" width="400" height="76" rx="38" fill="${ORANGE}"/>` +
    path(bold, dom, 540 - width(bold, dom, 25) / 2, 968, 25, "#ffffff")
  const svg = doc(1080, 1080, body, CREAM)
  writeFileSync(`${out}/social-cuadrado.svg`, svg); await sharp(Buffer.from(svg)).png().toFile(`${out}/social-cuadrado.png`)
}
console.log("Modelos generados en", root)

// Logos definitivos: isologo y logotipo, horizontal y vertical, en color y en versión clara,
// más avatar y cuadrado para redes. Nombre en Braze (mayúsculas, dos líneas); eslogan en Poppins.
//   node scripts/build-logos.mjs
// Salida: public/brand/*.svg|png, simbolo-perro.svg, simbolo-gato.svg y revision.png (lámina de control)
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { NAME, SLOGAN, VIEW, TEAL, ORANGE, MUTED, CREAM } from "./brand-core.mjs"
import { width, path, doc, poppins } from "./brand-text.mjs"
import { symbol, dogOnly, catOnly, variants } from "./brand-models.mjs"

const A = NAME[0].toUpperCase(), B = NAME[1].toUpperCase(), SL = SLOGAN
const sym = (v, x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / VIEW})">${symbol(v)}</g>`
const slogan = (x, y, size, fill, ls = 0.5) => path(SL, x, y, size, fill, ls, poppins)
const sloganW = (size, ls = 0.5) => width(SL, size, ls, poppins)

// Todas las piezas devuelven { w, h, body }. El símbolo ocupa x≈24..103, y≈4..106 dentro de su cuadro 120.
const layouts = {
  // Símbolo a la izquierda; nombre en dos líneas y eslogan a la derecha.
  "isologo-horizontal"(v) {
    const S = 290, tx = S * 0.86 + 6, size = 78, ls = 3, sl = 25
    const W = Math.ceil(tx + Math.max(width(A, size, ls), width(B, size, ls), sloganW(sl)) + 28), y1 = 122
    return {
      w: W, h: 262,
      body: sym(v, -6, 0, S) + path(A, tx, y1, size, v.wordA, ls) + path(B, tx, y1 + 82, size, v.wordB, ls) +
        slogan(tx, y1 + 82 + 50, sl, v.slogan),
    }
  },
  // Símbolo arriba, nombre en dos líneas y eslogan debajo, todo centrado.
  "isologo-vertical"(v) {
    const S = 300, size = 70, ls = 3, sl = 25
    const w1 = width(A, size, ls), w2 = width(B, size, ls), ws = sloganW(sl), W = Math.ceil(Math.max(w1, w2, ws) + 96)
    return {
      w: W, h: S + 230,
      body: sym(v, (W - S) / 2, 0, S) + path(A, (W - w1) / 2, S + 60, size, v.wordA, ls) + path(B, (W - w2) / 2, S + 60 + 78, size, v.wordB, ls) +
        slogan((W - ws) / 2, S + 60 + 78 + 52, sl, v.slogan),
    }
  },
  // Solo tipografía, alineada a la izquierda (formato apaisado).
  "logotipo-horizontal"(v) {
    const size = 100, ls = 3, sl = 30, pad = 44
    const W = Math.ceil(Math.max(width(A, size, ls), width(B, size, ls), sloganW(sl)) + pad * 2)
    return {
      w: W, h: 290,
      body: path(A, pad, 118, size, v.wordA, ls) + path(B, pad, 118 + 104, size, v.wordB, ls) + slogan(pad, 118 + 104 + 56, sl, v.slogan),
    }
  },
  // Solo tipografía, centrada y apilada (formato vertical).
  "logotipo-vertical"(v) {
    const size = 112, ls = 4, sl = 32, pad = 44
    const w1 = width(A, size, ls), w2 = width(B, size, ls), ws = sloganW(sl), W = Math.ceil(Math.max(w1, w2, ws) + pad * 2)
    return {
      w: W, h: 330,
      body: path(A, (W - w1) / 2, 126, size, v.wordA, ls) + path(B, (W - w2) / 2, 252, size, v.wordB, ls) + slogan((W - ws) / 2, 252 + 58, sl, v.slogan),
    }
  },
}

const out = "public/brand"
mkdirSync(out, { recursive: true })
const sheet = []
for (const [name, fn] of Object.entries(layouts)) {
  for (const [vk, v] of Object.entries(variants)) {
    const suf = vk === "claro" ? "-claro" : ""
    const { w, h, body } = fn(v)
    const svg = doc(w, h, body, v.fond)
    writeFileSync(`${out}/${name}${suf}.svg`, svg)
    await sharp(Buffer.from(svg), { density: 300 }).resize({ width: 1600 }).png().toFile(`${out}/${name}${suf}.png`)
    sheet.push({ name, vk, w, h, body, fond: v.fond })
  }
}

// Símbolos sueltos: solo perro y solo gato.
for (const [name, fn] of [["perro", dogOnly], ["gato", catOnly]]) {
  writeFileSync(`${out}/simbolo-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}">${fn(variants.color)}</svg>\n`)
}

// Avatar de redes 1080 (recorte circular seguro).
{
  const S = 6.4, off = (1080 - VIEW * S) / 2
  const svg = doc(1080, 1080, `<g transform="translate(${off} ${off}) scale(${S})">${symbol(variants.claro)}</g>`, TEAL)
  writeFileSync(`${out}/social-avatar.svg`, svg); await sharp(Buffer.from(svg)).png().toFile(`${out}/social-avatar.png`)
}
// Cuadrado de publicación 1080: símbolo, nombre en dos líneas, eslogan y dominio.
{
  const S = 4.4, size = 96, ls = 3, sl = 34, v = variants.color
  const w1 = width(A, size, ls), w2 = width(B, size, ls), ws = sloganW(sl)
  const dom = "BUSCOMIMASCOTAPERDIDA.COM", wd = width(dom, 22, 2)
  const body =
    `<rect width="1080" height="18" fill="${TEAL}"/>` +
    `<g transform="translate(${(1080 - VIEW * S) / 2} 60) scale(${S})">${symbol(v)}</g>` +
    path(A, (1080 - w1) / 2, 690, size, TEAL, ls) + path(B, (1080 - w2) / 2, 790, size, ORANGE, ls) +
    slogan((1080 - ws) / 2, 856, sl, MUTED) +
    `<rect x="${540 - (wd + 80) / 2}" y="920" width="${wd + 80}" height="72" rx="36" fill="${ORANGE}"/>` +
    path(dom, 540 - wd / 2, 966, 22, "#ffffff", 2)
  const svg = doc(1080, 1080, body, CREAM)
  writeFileSync(`${out}/social-cuadrado.svg`, svg); await sharp(Buffer.from(svg)).png().toFile(`${out}/social-cuadrado.png`)
}

// Lámina de revisión: las 4 piezas en color y claras (2 columnas).
{
  const COL = 900, PAD = 36
  let y = 30, body = ""
  for (const pair of [["isologo-horizontal", "isologo-vertical"], ["logotipo-horizontal", "logotipo-vertical"]]) {
    for (const vk of ["color", "claro"]) {
      let x = PAD, rowH = 0
      for (const name of pair) {
        const p = sheet.find((s) => s.name === name && s.vk === vk)
        const k = Math.min((COL - PAD * 2) / p.w, 340 / p.h), hh = p.h * k
        if (p.fond) body += `<rect x="${x - 12}" y="${y - 12}" width="${p.w * k + 24}" height="${hh + 24}" rx="14" fill="${p.fond}"/>`
        body += `<g transform="translate(${x} ${y}) scale(${k})">${p.body}</g>`
        x += COL; rowH = Math.max(rowH, hh)
      }
      y += rowH + 44
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COL * 2} ${y}" width="${COL * 2}" height="${y}"><rect width="${COL * 2}" height="${y}" fill="${CREAM}"/>${body}</svg>`
  await sharp(Buffer.from(svg), { density: 150 }).resize({ width: 2200 }).png().toFile(`${out}/revision.png`)
}
console.log("Logos generados en", out)

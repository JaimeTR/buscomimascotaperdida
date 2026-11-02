// Logos definitivos: isologo (horizontal, vertical y cuadrado) y logotipo (horizontal y vertical), en color y
// en versión clara, más avatar y cuadrado de publicación para redes. Nombre en Braze (mayúsculas, dos
// líneas); eslogan en Poppins mayúsculas, del mismo ancho que la línea "BUSCO MI".
//   node scripts/build-logos.mjs
// Salida: public/brand/*.svg|png, simbolo-perro.svg, simbolo-gato.svg y revision.png (lámina de control)
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { NAME, VIEW, TEAL, ORANGE, MUTED, CREAM } from "./brand-core.mjs"
import { width, path, doc, sloganPath, fitSlogan, capHeight, poppins } from "./brand-text.mjs"
import { symbol, dogOnly, catOnly, variants, place, placedWidth } from "./brand-models.mjs"

const A = NAME[0].toUpperCase(), B = NAME[1].toUpperCase()
const capSlogan = (nw) => capHeight(fitSlogan(nw).size, poppins)

// Todas las piezas devuelven { w, h, body }.
const layouts = {
  // Símbolo a la izquierda. Su alto es exactamente el del bloque de texto: de la parte alta de
  // "BUSCO MI" a la base del eslogan.
  "isologo-horizontal"(v) {
    const size = 78, ls = 3, M = 24, X = 20, cap = capHeight(size), gap = cap * 0.42
    const nw = width(A, size, ls), capS = capSlogan(nw)
    const yA = M + cap, yB = yA + cap + gap, yS = yB + gap * 1.15 + capS
    const symH = yS - M, tx = X + placedWidth(symH) + 36
    return {
      w: Math.ceil(tx + nw + X), h: Math.ceil(yS + M),
      body: place(symbol(v), X, M, symH) + path(A, tx, yA, size, v.wordA, ls) + path(B, tx, yB, size, v.wordB, ls) +
        sloganPath(nw, tx, yS, v.slogan),
    }
  },
  // Símbolo arriba, nombre en dos líneas y eslogan debajo, todo centrado.
  "isologo-vertical"(v) {
    const size = 70, ls = 3, M = 24, symH = 300, cap = capHeight(size), gap = cap * 0.42
    const nw = width(A, size, ls), w2 = width(B, size, ls), capS = capSlogan(nw)
    const W = Math.ceil(Math.max(nw, placedWidth(symH)) + 120)
    const yA = M + symH + 56 + cap, yB = yA + cap + gap, yS = yB + gap * 1.15 + capS
    return {
      w: W, h: Math.ceil(yS + M),
      body: place(symbol(v), (W - placedWidth(symH)) / 2, M, symH) + path(A, (W - nw) / 2, yA, size, v.wordA, ls) +
        path(B, (W - w2) / 2, yB, size, v.wordB, ls) + sloganPath(nw, (W - nw) / 2, yS, v.slogan),
    }
  },
  // Formato 1:1: todo centrado con aire parejo arriba y abajo.
  "isologo-cuadrado"(v) {
    return { w: 1080, h: 1080, body: squareStack(v, false) }
  },
  // Solo tipografía, alineada a la izquierda (formato apaisado).
  "logotipo-horizontal"(v) {
    const size = 100, ls = 3, pad = 44, cap = capHeight(size), gap = cap * 0.42
    const nw = width(A, size, ls), capS = capSlogan(nw)
    const yA = pad + cap, yB = yA + cap + gap, yS = yB + gap * 1.15 + capS
    return {
      w: Math.ceil(nw + pad * 2), h: Math.ceil(yS + pad),
      body: path(A, pad, yA, size, v.wordA, ls) + path(B, pad, yB, size, v.wordB, ls) + sloganPath(nw, pad, yS, v.slogan),
    }
  },
  // Solo tipografía, centrada y apilada (formato vertical).
  "logotipo-vertical"(v) {
    const size = 112, ls = 4, pad = 44, cap = capHeight(size), gap = cap * 0.42
    const nw = width(A, size, ls), w2 = width(B, size, ls), capS = capSlogan(nw), W = Math.ceil(nw + pad * 2)
    const yA = pad + cap, yB = yA + cap + gap, yS = yB + gap * 1.15 + capS
    return {
      w: W, h: Math.ceil(yS + pad),
      body: path(A, (W - nw) / 2, yA, size, v.wordA, ls) + path(B, (W - w2) / 2, yB, size, v.wordB, ls) +
        sloganPath(nw, (W - nw) / 2, yS, v.slogan),
    }
  },
}

// Composición 1080x1080: símbolo, nombre en dos líneas, eslogan y (opcional) pastilla con el dominio.
// Se calcula la altura total y se centra verticalmente.
function squareStack(v, pill) {
  const S = 1080, size = 112, ls = 3, symH = 430, cap = capHeight(size), gap = cap * 0.4
  const nw = width(A, size, ls), w2 = width(B, size, ls), capS = capSlogan(nw)
  const dom = "BUSCOMIMASCOTAPERDIDA.COM", wd = width(dom, 22, 2), pillH = 72
  const total = symH + 56 + cap + gap + cap + gap * 1.2 + capS + (pill ? 52 + pillH : 0)
  const top = (S - total) / 2 + (pill ? 9 : 0)
  const yA = top + symH + 56 + cap, yB = yA + cap + gap, yS = yB + gap * 1.2 + capS
  let body = pill ? `<rect width="${S}" height="18" fill="${TEAL}"/>` : ""
  body += place(symbol(v), (S - placedWidth(symH)) / 2, top, symH) + path(A, (S - nw) / 2, yA, size, v.wordA, ls) +
    path(B, (S - w2) / 2, yB, size, v.wordB, ls) + sloganPath(nw, (S - nw) / 2, yS, v.slogan)
  if (pill) {
    const py = yS + 52
    body += `<rect x="${S / 2 - (wd + 80) / 2}" y="${py}" width="${wd + 80}" height="${pillH}" rx="36" fill="${ORANGE}"/>` +
      path(dom, S / 2 - wd / 2, py + pillH / 2 + capHeight(22) / 2, 22, "#ffffff", 2)
  }
  return body
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
    await sharp(Buffer.from(svg), { density: 300 }).resize({ width: Math.min(1600, w * 2) }).png().toFile(`${out}/${name}${suf}.png`)
    sheet.push({ name, vk, w, h, body, fond: v.fond })
  }
}

// Símbolos sueltos: solo perro y solo gato.
for (const [name, fn] of [["perro", dogOnly], ["gato", catOnly]]) {
  writeFileSync(`${out}/simbolo-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}">${fn(variants.color)}</svg>\n`)
}

// Avatar de redes 1080 (recorte circular seguro): símbolo centrado.
{
  const h = 600
  const svg = doc(1080, 1080, place(symbol(variants.claro), (1080 - placedWidth(h)) / 2, (1080 - h) / 2, h), TEAL)
  writeFileSync(`${out}/social-avatar.svg`, svg); await sharp(Buffer.from(svg)).png().toFile(`${out}/social-avatar.png`)
}
// Cuadrado de publicación 1080: la composición cuadrada más la pastilla con el dominio.
{
  const svg = doc(1080, 1080, squareStack(variants.color, true), CREAM)
  writeFileSync(`${out}/social-cuadrado.svg`, svg); await sharp(Buffer.from(svg)).png().toFile(`${out}/social-cuadrado.png`)
}

// Lámina de revisión (no se usa en la web): todas las piezas en color y claras.
{
  const COL = 900, PAD = 36
  let y = 30, body = ""
  for (const pair of [["isologo-horizontal", "isologo-vertical"], ["isologo-cuadrado", "logotipo-horizontal"], ["logotipo-vertical"]]) {
    for (const vk of ["color", "claro"]) {
      let x = PAD, rowH = 0
      for (const name of pair) {
        const p = sheet.find((s) => s.name === name && s.vk === vk)
        const k = Math.min((COL - PAD * 2) / p.w, 400 / p.h), hh = p.h * k
        if (p.fond) body += `<rect x="${x - 12}" y="${y - 12}" width="${p.w * k + 24}" height="${hh + 24}" rx="14" fill="${p.fond}"/>`
        else if (name === "isologo-cuadrado") body += `<rect x="${x}" y="${y}" width="${p.w * k}" height="${hh}" fill="none" stroke="#e3ded2"/>`
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

// Logos definitivos: isologo (horizontal, vertical y cuadrado) y logotipo (horizontal y vertical), en color y
// en versión clara, más avatar y cuadrado de publicación para redes. Nombre en Braze (mayúsculas, dos
// líneas); eslogan en Poppins mayúsculas, del mismo ancho que la línea "BUSCO MI".
//   node scripts/build-logos.mjs
// Salida: public/brand/*.svg|png, simbolo-perro.svg, simbolo-gato.svg y revision.png (lámina de control)
import { mkdirSync, writeFileSync } from "node:fs"
import sharp from "sharp"
import { NAME, VIEW, TEAL, ORANGE, CREAM, MUTED } from "./brand-core.mjs"
import { width, path, doc, sloganPath, fitSlogan, capHeight, poppins } from "./brand-text.mjs"
import { INK } from "./brand-core.mjs"
import { symbol, dogOnly, catOnly, variants, place, placedWidth, BBOX } from "./brand-models.mjs"

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
    const suf = vk === "color" ? "" : `-${vk}`
    const { w, h, body } = fn(v)
    const svg = doc(w, h, body, v.fond)
    writeFileSync(`${out}/${name}${suf}.svg`, svg)
    await sharp(Buffer.from(svg), { density: 300 }).resize({ width: Math.min(1600, w * 2) }).png().toFile(`${out}/${name}${suf}.png`)
    sheet.push({ name, vk, w, h, body, fond: v.fond })
  }
}

// Símbolo solo (sin texto), recortado a su caja, en cada versión de color.
const TIGHT = `${BBOX.x0 - 1} ${BBOX.y0 - 1} ${BBOX.w + 2} ${BBOX.h + 2}`
for (const [vk, v] of Object.entries(variants)) {
  const suf = vk === "color" ? "" : `-${vk}`
  writeFileSync(`${out}/simbolo${suf}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${TIGHT}">${v.fond ? `<rect x="${BBOX.x0 - 1}" y="${BBOX.y0 - 1}" width="${BBOX.w + 2}" height="${BBOX.h + 2}" fill="${v.fond}"/>` : ""}${symbol(v)}</svg>
`)
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

// Láminas de revisión (no se usan en la web). El fondo de vista previa de blanco/negro no forma parte del archivo.
const PAIRS = [["isologo-horizontal", "isologo-vertical"], ["isologo-cuadrado", "logotipo-horizontal"], ["logotipo-vertical"]]
async function sheetPng(file, keys, backdrop) {
  const COL = 900, PAD = 36
  let y = 30, body = ""
  for (const pair of PAIRS) {
    for (const vk of keys) {
      let x = PAD, rowH = 0
      for (const name of pair) {
        const p = sheet.find((q) => q.name === name && q.vk === vk)
        const k = Math.min((COL - PAD * 2) / p.w, 400 / p.h), hh = p.h * k
        const back = p.fond || backdrop[vk]
        if (back) body += `<rect x="${x - 12}" y="${y - 12}" width="${p.w * k + 24}" height="${hh + 24}" rx="14" fill="${back}"/>`
        else if (name === "isologo-cuadrado") body += `<rect x="${x}" y="${y}" width="${p.w * k}" height="${hh}" fill="none" stroke="#e3ded2"/>`
        body += `<g transform="translate(${x} ${y}) scale(${k})">${p.body}</g>`
        x += COL; rowH = Math.max(rowH, hh)
      }
      y += rowH + 44
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COL * 2} ${y}" width="${COL * 2}" height="${y}"><rect width="${COL * 2}" height="${y}" fill="${CREAM}"/>${body}</svg>`
  await sharp(Buffer.from(svg), { density: 150 }).resize({ width: 2200 }).png().toFile(`${out}/${file}`)
}
await sheetPng("revision.png", ["color", "claro"], {})
await sheetPng("revision-monocromo.png", ["blanco", "negro"], { blanco: "#0b2b2a" })

// ───── Guía de marca visual (una sola imagen): logo, versiones, paleta, tipografía y símbolo ─────
{
  const W = 2000, M = 80
  const P = (t, x, y, size, fill = INK) => path(t, x, y, size, fill, 0, poppins) // texto Poppins
  const H = (t, x, y, size, fill = TEAL, ls = 2) => path(t, x, y, size, fill, ls) // texto Braze
  const lum = (hex) => [1, 3, 5].reduce((a, i, k) => a + parseInt(hex.slice(i, i + 2), 16) * [0.299, 0.587, 0.114][k], 0)
  const part = (name, vk, x, y, hMax, wMax) => {
    const q = sheet.find((z) => z.name === name && z.vk === vk), k = Math.min(hMax / q.h, wMax / q.w)
    return `<g transform="translate(${x + (wMax - q.w * k) / 2} ${y + (hMax - q.h * k) / 2}) scale(${k})">${q.body}</g>`
  }
  let y = 70, body = ""
  const section = (title) => { body += `<rect x="${M}" y="${y}" width="10" height="38" rx="5" fill="${ORANGE}"/>` + H(title, M + 30, y + 34, 38); y += 80 }

  // Cabecera
  body += part("isologo-horizontal", "color", M, y, 190, 720) + H("GUÍA DE MARCA", 960, y + 90, 78) +
    P("Busco mi mascota · identidad visual y sistema de diseño", 962, y + 140, 28, MUTED)
  y += 270

  section("VERSIONES DEL LOGO")
  const tiles = [["color", CREAM, "Color · sobre fondo claro"], ["claro", TEAL, "Claro · sobre teal"], ["blanco", "#0b2b2a", "Blanco · monocromo"], ["negro", "#ffffff", "Negro · monocromo"]]
  const tw = (W - M * 2 - 3 * 30) / 4
  tiles.forEach(([vk, bg, label], i) => {
    const x = M + i * (tw + 30)
    body += `<rect x="${x}" y="${y}" width="${tw}" height="480" rx="20" fill="${bg}" stroke="#e3ded2"/>` + part("isologo-vertical", vk, x + 20, y + 20, 440, tw - 40) + P(label, x + 4, y + 520, 24)
  })
  y += 590

  section("PALETA DE COLOR")
  const sw = [["Teal", "#0f766e", "Primario: marca, enlaces, botones"], ["Teal profundo", "#115e59", "Hover, fondos oscuros"], ["Naranja", "#c2410c", "Acento y un solo CTA por vista"],
    ["Naranja claro", "#fdba74", "Acento sobre teal"], ["Crema", "#faf8f3", "Fondo de la web"], ["Tinta", "#0b2b2a", "Texto principal"],
    ["Gris teal", "#3d5655", "Texto secundario"], ["Éxito", "#1d724a", "Encontrado, confirmaciones"], ["Alerta", "#935f06", "En revisión"], ["Error", "#b81e1e", "Errores y eliminar"]]
  const cw = (W - M * 2 - 4 * 24) / 5
  sw.forEach(([n, hex, use], i) => {
    const x = M + (i % 5) * (cw + 24), yy = y + Math.floor(i / 5) * 250, fg = lum(hex) > 150 ? INK : "#ffffff"
    body += `<rect x="${x}" y="${yy}" width="${cw}" height="150" rx="18" fill="${hex}" stroke="#e3ded2"/>` + P(n, x + 22, yy + 62, 30, fg) + P(hex.toUpperCase(), x + 22, yy + 112, 26, fg) + P(use, x + 4, yy + 186, 20, MUTED)
  })
  y += 540

  section("TIPOGRAFÍA")
  const half = (W - M * 2 - 40) / 2
  body += `<rect x="${M}" y="${y}" width="${half}" height="400" rx="20" fill="#ffffff" stroke="#e3ded2"/>` + H("BM", M + 40, y + 190, 190, TEAL, 0) +
    H("BRAZE", M + 40, y + 260, 40, INK) + P("Nombre y títulos cortos · solo MAYÚSCULAS", M + 40, y + 306, 24, MUTED) + H("ABCDEFGHIJKLM 0123456789", M + 40, y + 360, 34, TEAL, 1)
  const x2 = M + half + 40
  body += `<rect x="${x2}" y="${y}" width="${half}" height="400" rx="20" fill="#ffffff" stroke="#e3ded2"/>` + P("Aa", x2 + 40, y + 190, 190, TEAL) +
    P("Poppins", x2 + 40, y + 260, 40, INK) + P("Interfaz, párrafos y eslogan · 400 / 500 / 600 / 700", x2 + 40, y + 306, 24, MUTED) + P("Juntos, de vuelta a casa. 0123456789", x2 + 40, y + 360, 34, TEAL)
  y += 470

  section("SÍMBOLO")
  const v = variants.color
  let xs = M
  for (const [h, label] of [[200, "200 px"], [96, "96 px"], [48, "48 px"], [24, "24 px (mínimo)"]]) {
    const w = placedWidth(h)
    body += place(symbol(v), xs, y + 200 - h, h) + P(label, xs, y + 250, 22, MUTED)
    xs += Math.max(w, 150) + 60
  }
  body += `<g transform="translate(${xs + 40} ${y}) scale(1.7)">${dogOnly(v)}</g>` + `<g transform="translate(${xs + 270} ${y}) scale(1.7)">${catOnly(v)}</g>` + P("Perro y gato sueltos", xs + 40, y + 250, 22, MUTED)
  y += 330

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${y}" width="${W}" height="${y}"><rect width="${W}" height="${y}" fill="${CREAM}"/>${body}</svg>`
  writeFileSync(`${out}/guia-de-marca.svg`, svg)
  await sharp(Buffer.from(svg), { density: 110 }).resize({ width: 2000 }).png().toFile(`${out}/guia-de-marca.png`)
}
console.log("Logos generados en", out)

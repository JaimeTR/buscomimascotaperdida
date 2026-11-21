// Fotos de stock (Pexels, licencia gratuita para uso comercial, sin atribución obligatoria).
// Archivos optimizados en public/img/stock. Créditos y enlaces: docs/creditos-imagenes.md.
export type StockImage = { src: string; width: number; height: number; alt: string }

export const STOCK = {
    reencuentro: { src: "/img/stock/reencuentro-atardecer.webp", width: 1400, height: 933, alt: "Una mujer abraza a su perro dorado al atardecer" },
    perritoDuena: { src: "/img/stock/perrito-y-duena.webp", width: 800, height: 1200, alt: "Una joven besa a su perrito de pelo rizado" },
    paseo: { src: "/img/stock/paseo-en-el-parque.webp", width: 1200, height: 812, alt: "Una mujer sonríe mientras carga a su perro en un parque" },
    gatoTejado: { src: "/img/stock/gato-en-el-tejado.webp", width: 1200, height: 800, alt: "Un gato asomado entre un muro y un tejado mira a la cámara" },
    gatoRetrato: { src: "/img/stock/gato-retrato.webp", width: 800, height: 1205, alt: "Retrato de un gato atigrado de ojos verdes" },
    voluntaria: { src: "/img/stock/voluntaria-con-perro.webp", width: 1200, height: 800, alt: "Una voluntaria recibe el cariño de un perro" },
    veterinarios: { src: "/img/stock/veterinarios-voluntarios.webp", width: 1200, height: 800, alt: "Un veterinario y dos voluntarios atienden a un perro" },
} satisfies Record<string, StockImage>

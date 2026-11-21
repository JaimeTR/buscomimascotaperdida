# Catálogo de componentes reutilizables

Tokens y marca: ver `DESIGN.md` y `docs/marca.md`. Todo usa los tokens de `globals.css` (`bg-card`, `text-primary`, `--shadow-soft`, `--shadow-lift`).

## UI base (`src/components/ui`)
| Componente | Uso |
|---|---|
| `Button` | Variantes: default, outline, ghost, link, `cta` (naranja, acción principal). |
| `PageHeader` | Título (Outfit) + texto de apoyo. |
| `EmptyState` | Estado vacío con icono, texto y acción. |
| `StatCard` | Cifra + etiqueta en paneles. |
| `Reveal` | Aparición animada al hacer scroll (framer-motion, respeta `prefers-reduced-motion`). Props: `delay`, `as`. |

## Mascotas
| Componente | Uso |
|---|---|
| `PetCard` | Tarjeta de reporte con hover (elevación + zoom de foto). |
| `StatusBadge` | Perdido / Encontrado / Reunido. |
| `PetFilters` | Filtros de búsqueda. |
| `PetsSearch` (`components/pets-search.tsx`) | Listado con buscador, filtros y `ad` (slot de anuncio) en la barra lateral. |

## Anuncios y aliados (`src/components/ads`, `src/lib/ads.ts`)
- `AdSlot placement variant` (servidor): muestra un anuncio activo al azar o `HouseAd` (invitación a anunciar). Espacios: `home_banner`, `detail_sidebar`, `listing_inline`, `ads_page`.
- `AdCard` variantes `card | banner | side`; siempre rotulado «Anuncio», `rel="sponsored"`, clics contados vía `/anuncios/ir/[id]`.
- `PromoRequestForm` (`components/promo`): solicitud de anuncio/aliado/voluntario; requiere sesión.

## Módulo de promoción
- Solicitudes → `/admin/promociones`; el admin aprueba y crea el anuncio. Gestión en `/admin/anuncios` y `/admin/aliados`.
- No hay pago en línea: el cobro se coordina manualmente. Los precios de `PLANS` son **provisionales**.

## Imágenes
- Fotos de stock locales en `public/img/stock`, referenciadas desde `src/lib/stock-images.ts`. Créditos en `docs/creditos-imagenes.md`.
- Imágenes remotas de usuarios/anunciantes: `next/image` con `unoptimized`.

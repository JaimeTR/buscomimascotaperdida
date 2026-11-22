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
| `PetCard` | Tarjeta de reporte (`hover-lift`, zoom de foto, insignia `featured`). |
| `StatusBadge` | Perdido / Encontrado / Reunido. |
| `PetFilters` | IA + filtros: fila centrada en escritorio; en móvil Lugar, Mascota y botón «Filtros» (hoja completa). |
| `PetsSearch` (`components/pets-search.tsx`) | Banner con «Consultar a nuestra IA» y filtros, lista paginada (`useInfinitePets`) con llamados a reportar (`pets/report-ctas.tsx`) entre bloques de 12. |

## Formularios en modal y campos
| Componente | Uso |
|---|---|
| `FormDialog` + `OpenFormButton` (`ui/form-dialog.tsx`) | Modal grande de formulario (panel de información + formulario; hoja en móvil). Las páginas solo ponen botones que lo abren por evento. |
| `IconField` + `iconFieldClass` (`ui/icon-field.tsx`) | Campo con icono a la izquierda que reacciona al foco. |
| `ContactDialog`, `PromoDialog`, `BoostDialog` | Modales ya armados: contacto, aliados/anuncios y «Destacar mi caso». |

## Mascota (`src/components/pet`)
`PetGallery`, `ContactCard`, `SightingTimeline`. Compartir: `SocialShare variant="button"`. Ver `docs/perfil-mascota-y-contacto.md`.

## Apoyo voluntario y anuncios
- `BoostFields` / `submitBoost` (`components/boost`): monto, método, comprobante y registro del impulso. Ver `docs/apoyo-voluntario.md`.
- `FeaturedPets` (portada), `FeaturedPopup` (aviso flotante), `FeaturedAds` (anuncios de negocios destacados), `AdCard`, `HouseAd`, `AdSlot placement variant`. Espacios: `home_banner`, `detail_sidebar`, `listing_inline` (`ads_page` quedó sin uso: ya no hay lista pública).
- Anuncios y solicitudes: se aprueban en `/admin/promociones`; el aporte confirmado ordena. **No hay planes fijos ni cobro en línea.**

## Imágenes
- Fotos de stock locales en `public/img/stock`, referenciadas desde `src/lib/stock-images.ts`. Créditos en `docs/creditos-imagenes.md`.
- Imágenes remotas de usuarios/anunciantes: `next/image` con `unoptimized`.

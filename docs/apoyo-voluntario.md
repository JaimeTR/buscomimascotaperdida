# Apoyo voluntario y casos destacados

No hay planes ni precios fijos. Cualquier persona (o negocio) puede aportar **el monto que quiera** por Yape o Plin; un administrador lo verifica y confirma. El monto confirmado solo decide **el orden**: a mayor aporte, más adelante se muestra.

## Flujo
1. **Al reportar** (`/reportar`, paso 4 «Apoyo voluntario») o **desde su reporte** («Destacar mi caso», modal para el dueño): se elige S/ 5, 10, 20, 50 u otro monto, se ve el número de Yape/Plin (copiar) y se puede adjuntar el comprobante. «No por ahora» publica igual.
2. Se crea un **impulso** (`pet_boosts`, estado `pending`). El comprobante va al bucket privado `boost-proofs` (carpeta = id del usuario; solo el admin lo lee).
3. En `/admin/impulsos` el equipo ve el comprobante, **confirma el monto** y los días de vigencia (30 por defecto) → estado `approved`, o rechaza.
4. Solo con impulso aprobado y vigente el caso sale como **destacado**.

## Dónde aparece
| Lugar | Detalle |
|---|---|
| Portada | Sección «Mascotas destacadas» tras el banner (`components/home/featured-pets.tsx`), ordenada por monto confirmado. Sin destacados no se dibuja. |
| Aviso flotante | `components/featured-popup.tsx`: tras ~18 s en páginas que no son portada, reportar, panel, admin, avistamiento ni cartel. Muestra el de mayor aporte aún no cerrado en la sesión (nunca el que ya se ve). Datos desde `GET /api/featured` (dinámico, caché CDN 5 min). |
| Tarjetas y detalle | Insignia «Destacado» (`PetCard featured`, «Caso destacado» en el detalle). |

## Datos
- `pet_boosts`: `amount_claimed` (lo que dice la persona), `amount_confirmed` (lo fija el admin), `method`, `proof_path`, `status`, `starts_at`, `ends_at`. RLS: la persona solo inserta para **sus** reportes y siempre `pending`; solo el admin actualiza.
- `featured_pets(p_limit)` (SQL, `security definer`): suma los montos confirmados vigentes por caso y ordena de mayor a menor (empate: el más reciente). Solo casos visibles y activos.
- Negocios: `ads.amount` y `promo_requests.amount`; `getAds` ordena por `amount` y luego fecha. Al aprobar una solicitud el admin fija el aporte confirmado.
- Migración: `supabase/migrations/20261122150000_pet_boosts_voluntary_support.sql`.

## Anuncios de negocios (`/anuncios`)
Página solo de promoción: banner, beneficios, montos sugeridos (S/ 20, 50, 100, 200; solo guía), cómo funciona y solicitud (modal). **No hay lista pública de anuncios.** Los anuncios publicados por el admin salen como «Destacados» en la portada (`ads/featured-ads.tsx`). `/promocionar` redirige a `/anuncios`.

## Apoyo mensual (idea, sin cobro automático)
En `/contacto` → «Apoyo mensual (voluntario)»: Amigo S/ 10, Aliado S/ 25, Guardián S/ 50 al mes. Abre el formulario en «Ya apoyé» con monto y casilla «cada mes» (`contact_messages.monthly`). Se coordina por mensaje y la persona envía su Yape cada mes. Si más adelante se quiere cobro automático haría falta una pasarela (Culqi, Niubiz…).

## Configuración (Vercel)
`NEXT_PUBLIC_YAPE_NUMBER`, `NEXT_PUBLIC_PLIN_NUMBER`, `NEXT_PUBLIC_SUPPORT_HOLDER`. Sin ellos los formularios dicen «estamos activando los medios de pago».

## Pendiente / ideas
- Avisar por correo a la persona cuando su aporte se confirme.
- Mostrar al dueño el estado de su impulso en el panel.
- Sección pública de agradecimiento a colaboradores (quienes marcaron «pueden mencionar mi apoyo»).

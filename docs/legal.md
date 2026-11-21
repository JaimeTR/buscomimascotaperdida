# Páginas legales

| Ruta | Archivo | Base |
|---|---|---|
| `/terminos` | `src/app/terminos/page.tsx` | Términos de uso, moderación, anuncios, ley peruana |
| `/privacidad` | `src/app/privacidad/page.tsx` | Ley 29733 y D.S. 003-2013-JUS: datos, finalidad, encargados, ARCO |
| `/cookies` | `src/app/cookies/page.tsx` | Cookies y almacenamiento local realmente usados |
| `/libro-de-reclamaciones` | `src/app/libro-de-reclamaciones/page.tsx` | Ley 29571 (por correo, respuesta en 15 días hábiles) |

Maquetación común: `src/components/legal-page.tsx` (la fecha `LEGAL_UPDATED` y el correo `LEGAL_EMAIL` están en un solo lugar). Enlazadas en el footer y en el sitemap.

## Mantener al día
- Nuevo proveedor (analítica, pagos, otro login): añadirlo en "Con quién los compartimos" de privacidad y en cookies si usa cookies.
- Nuevo dato en perfil o reportes: "Datos que recopilamos".
- Algo nuevo en `localStorage` o cookies: tabla de `/cookies`.
- Cambiar `LEGAL_UPDATED` en cada edición.

## Pendientes que requieren datos tuyos o abogado
- **Razón social, RUC y domicilio** del titular: la política identifica al responsable solo por correo. Conviene que un abogado revise los textos.
- **Registro del banco de datos personales** ante la Autoridad Nacional de Protección de Datos Personales.
- **Libro de reclamaciones** formal (hoja virtual con datos del proveedor) si hay promociones de pago.
- Condiciones de los **planes de promoción** (precios, reembolsos) cuando se cobre.
- **Eliminar cuenta**: disponible en Mi perfil → Seguridad; actualizar la política si cambia el alcance del borrado.

# Contacto, formularios en modal y bandeja de mensajes

## Regla de interfaz
Las páginas **no muestran formularios en línea**: solo botones. Cada botón abre un **modal grande** (`FormDialog`, `<dialog>` nativo) con un panel de información a la izquierda y el formulario a la derecha; en móvil es una hoja que sube desde abajo. El formulario se monta de cero en cada apertura.

- `OpenFormButton form="…" detail={{…}}` (cliente) dispara el evento `bmm:open-form`. `FormDialog id="…"` escucha el suyo. `openOnLoad` abre solo con datos (p. ej. `/contacto?tipo=apoyo`).
- Modales: `contacto` (`contact/contact-dialog.tsx`), `aliados` y `anuncios` (`promo/promo-dialog.tsx`), `impulso` (`boost/boost-dialog.tsx`).
- Campos con icono: `ui/icon-field.tsx` (`IconField` + `iconFieldClass`); también en ingresar y registro.

## `/contacto`
Banner · canales directos (solo los configurados) · «Súmate a la red» (aliado, voluntario, colaborar: cada tarjeta abre el modal con su tipo) · «Apoya el proyecto» (Yape/Plin, apoyo mensual) · «Escríbenos» · preguntas frecuentes (con JSON-LD FAQPage).

Tipos del formulario (`lib/contact-kinds.ts`): consulta, aliado, voluntario, colaborar, apoyo, grupo. «Ya apoyé» permite monto, comprobante (imagen o PDF, 5 MB), «cada mes» y «pueden mencionar mi apoyo».

## Mensajes (`contact_messages`)
- `POST /api/contact` (multipart): valida con Zod, **campo trampa** `website`, **límite 5 por hora por IP** (`lib/rate-limit.ts`), sube el comprobante al bucket privado `contact-attachments` y guarda el mensaje con la clave pública (RLS: cualquiera inserta, solo admin lee/actualiza).
- Admin: `/admin/mensajes` (leer, comprobante por enlace temporal de 10 min, marcar leído/atendido).
- Migración: `20261122120000_contact_messages.sql` (+ columna `monthly` en la de apoyo voluntario).
- No se envía correo al recibir un mensaje: se consulta la bandeja. (Pendiente: aviso por correo al admin.)

## Grupo de colaboradores
Un solo número para todo (administrador). «Pedir acceso al grupo por WhatsApp» abre `wa.me/<número>` con el mensaje ya escrito pidiendo acceso. Si hay un enlace directo de invitación se define `NEXT_PUBLIC_COLLAB_GROUP_URL` y lo reemplaza.

## Solicitudes de aliados y anuncios (`promo_requests`)
Server Action `submitPromoRequest` (`app/anuncios/actions.ts`): exige sesión, máximo 5 pendientes por persona. El admin las atiende en `/admin/promociones`.

## Variables (Vercel)
`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_CONTACT_WHATSAPP` (solo dígitos con 51), `NEXT_PUBLIC_COLLAB_GROUP_URL` (opcional). Lo no definido no se muestra. Tras cambiarlas, redesplegar.

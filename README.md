This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Configuración

Copia `.env.example` a `.env.local` y completa las variables en tu entorno local.
En producción, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
son obligatorias. `RESEND_API_KEY` y `HUGGINGFACE_API_KEY` son opcionales, pero
deben configurarse si se habilitan sus servicios. `NEXT_PUBLIC_APP_URL` debe
apuntar al dominio público de producción para que funcionen los callbacks de
autenticación.

No guardes valores reales en `.env.example`, README, ni otros archivos
documentales.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abre la URL que indique la terminal para ver la aplicación.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Comprobación de configuración

Antes de desplegar, ejecuta:

```bash
npm run check:production-config
```

La comprobación falla si encuentra URLs locales o valores sensibles no
placeholder en la documentación.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

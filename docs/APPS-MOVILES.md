# Apps móviles (PWA, Android, iPhone)

## PWA (hecho)
Manifest con `id`, `display_override`, iconos maskable y atajos. Service worker solo en producción.
`viewport-fit=cover` activo para respetar notch y barra de gestos. En iOS el aviso de instalación
muestra las instrucciones "Compartir → Añadir a inicio" a los 30 s.

## Android (TWA, la web publicada dentro de una app)
Requisitos: Java 17+ y Android SDK (Bubblewrap los descarga), cuenta Google Play (25 USD, una vez).

1. `cd android && npx @bubblewrap/cli init --manifest=https://buscomimascotaperdida.com/manifest.json`
   (acepta `twa-manifest.json` ya preparado) y luego `npx @bubblewrap/cli build`.
   Crea `android.keystore` — **guárdalo fuera de git** y haz copia; sin él no hay actualizaciones.
2. `npx @bubblewrap/cli fingerprint` → copia la huella SHA-256.
3. En Vercel: variable `ANDROID_SHA256_FINGERPRINTS=<huella>` (separa varias con coma; añade también
   la huella de Play App Signing). Redeploy. Verifica `https://buscomimascotaperdida.com/.well-known/assetlinks.json`.
4. Sube `app-release-bundle.aab` a Play Console (pruebas internas primero).
   Ficha: política de privacidad `/privacidad`, captura de pantallas, clasificación de contenido.

## iPhone (Capacitor)
Necesita Mac con Xcode (o servicio en la nube) y Apple Developer (99 USD/año).
Apple rechaza webs envueltas sin valor nativo (guideline 4.2): añadir push nativo, cámara y compartir.
Login social: usar el navegador del sistema (`@capacitor/browser`) para OAuth. Pendiente.

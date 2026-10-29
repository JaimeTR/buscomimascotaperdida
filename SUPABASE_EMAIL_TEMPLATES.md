
# Plantillas de Correo para Supabase (Diseño Mejorado)

Copia y pega el código HTML correspondiente en cada sección del panel de Supabase:
**Authentication -> Email Templates**

---

## 1. Confirm Sign Up (Confirmar Registro)
**Subject:** `¡Confirma tu cuenta en BuscoMiMascota!`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { text-align: center; padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; }
    .logo { width: 60px; height: 60px; border-radius: 50%; display: block; margin: 0 auto 15px; }
    .title { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .body { padding: 40px 30px; text-align: center; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 99px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); transition: background-color 0.2s; }
    .button:hover { background-color: #1d4ed8; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    .link { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg" alt="Logo" class="logo">
        <h1 class="title">BuscoMiMascota<span style="color: #2563eb;">Perdida</span></h1>
      </div>
      <div class="body">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">¡Casi estamos listos! 🐾</h2>
        <p class="text">Hola, gracias por registrarte. Para comenzar a ayudar a la comunidad y reportar mascotas, por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo.</p>
        
        <a href="{{ .ConfirmationURL }}" class="button">Confirmar mi Correo</a>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">O copia y pega este enlace: <br> <a href="{{ .ConfirmationURL }}" class="link">{{ .ConfirmationURL }}</a></p>
      </div>
    </div>
    <div class="footer">
      <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Invite User (Invitar Usuario)
**Subject:** `¡Te han invitado a BuscoMiMascota!`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { text-align: center; padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; }
    .logo { width: 60px; height: 60px; border-radius: 50%; display: block; margin: 0 auto 15px; }
    .title { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .body { padding: 40px 30px; text-align: center; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 99px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg" alt="Logo" class="logo">
        <h1 class="title">BuscoMiMascota<span style="color: #2563eb;">Perdida</span></h1>
      </div>
      <div class="body">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Has sido invitado 💌</h2>
        <p class="text">Alguien te ha invitado a unirte a la red más grande de ayuda para mascotas perdidas. Haz clic abajo para aceptar la invitación y configurar tu cuenta.</p>
        
        <a href="{{ .ConfirmationURL }}" class="button">Aceptar Invitación</a>
      </div>
    </div>
    <div class="footer">
      <p>Si no esperabas esta invitación, puedes ignorar este mensaje.</p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Magic Link (Enlace Mágico)
**Subject:** `Tu enlace de acceso rápido a BuscoMiMascota`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { text-align: center; padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; }
    .logo { width: 60px; height: 60px; border-radius: 50%; display: block; margin: 0 auto 15px; }
    .title { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .body { padding: 40px 30px; text-align: center; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 99px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg" alt="Logo" class="logo">
        <h1 class="title">BuscoMiMascota<span style="color: #2563eb;">Perdida</span></h1>
      </div>
      <div class="body">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Acceso sin contraseña ✨</h2>
        <p class="text">Has solicitado iniciar sesión con un enlace mágico. Haz clic en el botón de abajo para entrar directamente a tu cuenta.</p>
        
        <a href="{{ .ConfirmationURL }}" class="button">Iniciar Sesión Ahora</a>
      </div>
    </div>
    <div class="footer">
      <p>Este enlace expirará pronto. Si no lo solicitaste, ignóralo.</p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Change Email Address (Cambiar Correo)
**Subject:** `Confirma el cambio de tu correo electrónico`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { text-align: center; padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; }
    .logo { width: 60px; height: 60px; border-radius: 50%; display: block; margin: 0 auto 15px; }
    .title { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .body { padding: 40px 30px; text-align: center; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 99px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg" alt="Logo" class="logo">
        <h1 class="title">BuscoMiMascota<span style="color: #2563eb;">Perdida</span></h1>
      </div>
      <div class="body">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Solicitud de cambio de correo 📧</h2>
        <p class="text">Has solicitado cambiar tu dirección de correo electrónico a esta. Haz clic abajo para confirmar el cambio.</p>
        
        <a href="{{ .ConfirmationURL }}" class="button">Confirmar Cambio de Correo</a>
      </div>
    </div>
    <div class="footer">
      <p>Si no solicitaste este cambio, por favor contacta a soporte.</p>
    </div>
  </div>
</body>
</html>
```

---

## 5. Reset Password (Restablecer Contraseña)
**Subject:** `Restablece tu contraseña en BuscoMiMascota`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { text-align: center; padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9; }
    .logo { width: 60px; height: 60px; border-radius: 50%; display: block; margin: 0 auto 15px; }
    .title { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .body { padding: 40px 30px; text-align: center; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background-color: #f97316; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 99px; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3); }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <img src="https://img.freepik.com/vector-gratis/lindo-perro-sacando-lengua-ilustracion-icono-dibujos-animados_138676-2709.jpg" alt="Logo" class="logo">
        <h1 class="title">BuscoMiMascota<span style="color: #2563eb;">Perdida</span></h1>
      </div>
      <div class="body">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">¿Olvidaste tu contraseña? 🔑</h2>
        <p class="text">No te preocupes, nos pasa a todos. Haz clic en el botón de abajo para crear una nueva contraseña y recuperar tu cuenta.</p>
        
        <a href="{{ .ConfirmationURL }}" class="button">Restablecer Contraseña</a>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">Si no solicitaste esto, puedes ignorar este correo y tu contraseña seguirá siendo la misma.</p>
      </div>
    </div>
    <div class="footer">
      <p>Enviado con ❤️ por el equipo de BuscoMiMascota.</p>
    </div>
  </div>
</body>
</html>
```

---

## 6. Reauthentication (Reautenticación)
(Este template es menos común pero aquí lo tienes por si acaso)

```html
<p>Tu código de seguridad es: {{ .Token }}</p>
```
*(Supabase suele usar un token numérico simple para esto, mejor mantenerlo minimalista o usar el diseño de Magic Link cambiando el texto)*

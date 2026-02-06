# Mercapleno (Full Stack)

Proyecto full stack con frontend en React y backend en Node.js + Express + MySQL. Incluye autenticación con verificación por correo, recuperación de contraseña, catálogo, carrito, ventas, reportes y PDF.

**Estructura Del Proyecto**
- `mercapleno-react` (frontend)
- `mercapleno-backend` (backend)

Si estás leyendo este README desde `mercapleno-react`, el backend está en `../mercapleno-backend`.

**Requisitos**
- Node.js 18 o superior
- npm
- MySQL 8 o compatible

**Instalación**
Backend:
1. Abre una terminal en `mercapleno-backend`.
2. Instala dependencias.
3. Crea el archivo `.env`.
4. Ajusta la conexión a BD en `mercapleno-backend/db.js`.
5. Aplica los cambios de BD.
6. Inicia el servidor.

```bash
cd mercapleno-backend
npm install
npm start
```

Frontend:
1. Abre una terminal en `mercapleno-react`.
2. Instala dependencias.
3. Inicia el frontend.

```bash
cd mercapleno-react
npm install
npm start
```

Backend corre en `http://localhost:4000`.
Frontend corre en `http://localhost:3000`.

**Variables De Entorno**
Archivo: `mercapleno-backend/.env`

```env
RESEND_API_KEY=tu_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
APP_NAME=mercapleno
EMAIL_VERIFICATION_TTL_MIN=15
PASSWORD_RESET_TTL_MIN=15
```

- `RESEND_API_KEY`: API key de Resend.
- `RESEND_FROM_EMAIL`: correo remitente. Para pruebas puedes usar `onboarding@resend.dev`.
- `APP_NAME`: nombre del sistema para los correos.
- `EMAIL_VERIFICATION_TTL_MIN`: minutos de validez del código de verificación.
- `PASSWORD_RESET_TTL_MIN`: minutos de validez del código de recuperación.

**Base De Datos**
Cambios aplicados a la tabla `usuarios` para verificación de correo y recuperación de contraseña.

Archivo: `mercapleno-backend/sql/auth_email_setup.sql`

```sql
ALTER TABLE usuarios
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN email_verification_code VARCHAR(64) NULL,
  ADD COLUMN email_verification_expires DATETIME NULL,
  ADD COLUMN password_reset_code VARCHAR(64) NULL,
  ADD COLUMN password_reset_expires DATETIME NULL;

UPDATE usuarios SET email_verified = 1 WHERE email_verified = 0;
```

Ejecutar el script (ejemplo):

```bash
mysql -u root -p mercapleno < mercapleno-backend/sql/auth_email_setup.sql
```

**Flujo De Autenticación**
1. Registro crea el usuario con `email_verified = 0`.
2. Se envía un código por correo.
3. El usuario verifica el código en `/verificar`.
4. Solo usuarios verificados pueden iniciar sesión.
5. La recuperación de contraseña usa un código temporal por correo en `/recuperar`.

**Códigos De Seguridad**
- Admin: `123`
- Empleado: `456`

Esto se controla en `mercapleno-react/src/Login.jsx`.

**Roles**
- `1`: Administrador
- `2`: Empleado
- `3`: Cliente

**Rutas Principales**
Base: `http://localhost:4000`

Autenticación:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`

Catálogo y ventas (requiere token):
- `GET /api/sales/products`
- `GET /api/sales/categories`
- `POST /api/sales/orders`

Reportes (requiere token):
- `GET /api/sales/reports/ventas-mes`
- `GET /api/sales/reports/top-productos`
- `GET /api/sales/reports/resumen`
- `GET /api/sales/reports/resumen-mes`
- `GET /api/sales/reports/pdf-resumen`

Administración:
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

Inventario y productos:
- `GET /api/productos`
- `POST /api/movimientos/*`

**PDF Y Tickets**
- El PDF de reportes se descarga o se imprime desde Estadísticas (usa token).
- El ticket de compra se genera en frontend y solo muestra el nombre del producto.

**Correo Con Resend**
- En modo pruebas, Resend permite enviar desde `onboarding@resend.dev` a tu propio correo verificado.
- Para enviar a cualquier destinatario necesitas verificar un dominio en Resend y usar un `RESEND_FROM_EMAIL` de ese dominio.

**Notas**
- El token JWT se guarda en `localStorage`.
- El secreto JWT está hardcodeado en `mercapleno-backend/routes/authMiddleware.js` y `mercapleno-backend/routes/usuarios.js` y debe coincidir.
- Si ves el error `RESEND_API_KEY not configured`, revisa el `.env`.
- Ajusta la URL del backend si cambias el puerto.

**Comandos Útiles**
```bash
# Backend
cd mercapleno-backend
npm install
npm start

# Frontend
cd mercapleno-react
npm install
npm start
```

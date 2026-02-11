# Mercapleno (Full Stack)

Proyecto full stack con frontend en React y backend en Node.js + Express + MySQL. Incluye autenticacion con verificacion por correo, recuperacion de contrasena, catalogo, carrito, ventas, reportes y PDF.

**Estructura Del Proyecto**
- `mercapleno-react` (frontend)
- `mercapleno-backend` (backend)

Si estas leyendo este README desde `mercapleno-react`, el backend esta en `../mercapleno-backend`.

**Requisitos**
- Node.js 18 o superior
- npm
- MySQL 8 o compatible

**Instalacion**
Backend:
1. Abre una terminal en `mercapleno-backend`.
2. Instala dependencias.
3. Crea o edita el archivo `.env`.
4. Ajusta la conexion a BD en `mercapleno-backend/db.js`.
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

**Variables De Entorno (Nodemailer)**
Archivo: `mercapleno-backend/.env`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM_EMAIL=tu_correo@gmail.com
APP_NAME=mercapleno
EMAIL_VERIFICATION_TTL_MIN=15
PASSWORD_RESET_TTL_MIN=15
```

- `SMTP_HOST`: servidor SMTP.
- `SMTP_PORT`: puerto del SMTP (587 para STARTTLS, 465 para SSL).
- `SMTP_SECURE`: `true` si usas SSL (puerto 465), `false` para STARTTLS.
- `SMTP_USER`: usuario SMTP (normalmente el correo).
- `SMTP_PASS`: password SMTP (en Gmail usar App Password).
- `SMTP_FROM_EMAIL`: correo remitente.
- `APP_NAME`: nombre del sistema para los correos.
- `EMAIL_VERIFICATION_TTL_MIN`: minutos de validez del codigo de verificacion.
- `PASSWORD_RESET_TTL_MIN`: minutos de validez del codigo de recuperacion.

Opcional: puedes usar `SMTP_SERVICE` (por ejemplo `gmail`) en lugar de `SMTP_HOST` si tu proveedor lo soporta.

**Base De Datos**
Cambios aplicados a la tabla `usuarios` para verificacion de correo y recuperacion de contrasena.

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

**Flujo De Autenticacion**
1. Registro crea el usuario con `email_verified = 0`.
2. Se envia un codigo por correo.
3. El usuario verifica el codigo en `/verificar`.
4. Solo usuarios verificados pueden iniciar sesion.
5. La recuperacion de contrasena usa un codigo temporal por correo en `/recuperar`.

**Codigos De Seguridad**
- Admin: `123`
- Empleado: `456`

Esto se controla en `mercapleno-react/src/Login.jsx`.

**Roles**
- `1`: Administrador
- `2`: Empleado
- `3`: Cliente

**Rutas Principales**
Base: `http://localhost:4000`

Autenticacion:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`

Catalogo y ventas (requiere token):
- `GET /api/sales/products`
- `GET /api/sales/categories`
- `POST /api/sales/orders`

Reportes (requiere token):
- `GET /api/sales/reports/ventas-mes`
- `GET /api/sales/reports/top-productos`
- `GET /api/sales/reports/resumen`
- `GET /api/sales/reports/resumen-mes`
- `GET /api/sales/reports/pdf-resumen`

Administracion:
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

Inventario y productos:
- `GET /api/productos`
- `POST /api/movimientos/*`

**Swagger / OpenAPI**
- Especificacion: `mercapleno-react/public/openapi.yaml`
- UI: `http://localhost:3000/swagger/index.html`
- Si cambias el host/puerto del backend, actualiza `servers.url` en `mercapleno-react/public/openapi.yaml`

**PDF Y Tickets**
- El PDF de reportes se descarga o se imprime desde Estadisticas (usa token).
- El ticket de compra se genera en frontend y solo muestra el nombre del producto.

**Correo Con Nodemailer**
- Usa cualquier proveedor SMTP (Gmail, Outlook, Mailgun, etc.).
- En Gmail necesitas habilitar 2FA y crear un App Password.
- Si ves el error `SMTP not configured`, revisa el `.env`.

**Notas**
- El token JWT se guarda en `localStorage`.
- El secreto JWT esta hardcodeado en `mercapleno-backend/routes/authMiddleware.js` y `mercapleno-backend/routes/usuarios.js` y debe coincidir.
- Ajusta la URL del backend si cambias el puerto.

**Comandos Utiles**
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

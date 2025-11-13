# Backend — API (Express + MongoDB)

Este directorio contiene la API REST del proyecto. Está implementada con Express (ES modules) y usa Mongoose para acceder a MongoDB.

## Rápido vistazo

- Archivo principal: `server.js`
- Conexión DB: `config/db.js` (usa `process.env.MONGO_URI`)
- Rutas de autenticación: `routes/authRoutes.js`
- Controladores: `controllers/authController.js`
- Modelo de usuario: `models/User.js` (colección `usuarios`)

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## Variables de entorno

Crear un `.env` en `backend/` con al menos:

- `MONGO_URI` — URI de tu MongoDB
- `JWT_SECRET` — clave secreta para firmar tokens JWT
- `PORT` — opcional, puerto para la API (por defecto 4000)

## Instalar y ejecutar

Instalar dependencias:

```powershell
cd backend
npm install
```

Modo desarrollo (si tienes `nodemon`):

```powershell
npm run dev
```

O para producción:

```powershell
npm start
```

La API escuchará (por defecto) en `http://localhost:4000`.

## Endpoints principales (resumen)

Base: `http://localhost:4000/api/auth`

- POST `/register` — registrar usuario
  - Body (JSON): `{ "username": "usuario", "email": "a@b.com", "password": "secreto", "nombre": "Nombre" }`
  - Respuesta: 201 con objeto `data` del usuario (sin password)

- POST `/login` — iniciar sesión
  - Body (JSON): `{ "identifier": "email_o_username", "password": "secreto" }`
  - Respuesta: 200 con `token` (JWT) y `data` del usuario

- GET `/me` — obtener perfil actual (protegido)
  - Header: `Authorization: Bearer <token>`
  - Respuesta: 200 con `data` del usuario

- PUT `/profile` — actualizar perfil (protegido)
  - Body puede contener: `nombre`, `avatar`, `username`, `email`, `passwordActual`, `nuevoPassword`

- DELETE `/profile` — eliminar perfil (protegido)
  - Body (JSON): `{ "password": "tu_contraseña" }` para confirmar eliminación

## Ejemplos rápidos (curl)

Registro:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"123456"}'
```

Login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"demo","password":"123456"}'
```

Obtener perfil (ejemplo con token):

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

## Notas de implementación y observaciones

- El modelo `User` define la colección explícita `usuarios`.
- `config/db.js` imprime usuarios al conectar — es útil para desarrollo pero puede eliminarse en producción.
- Asegúrate de definir `JWT_SECRET` en el entorno para evitar errores al hacer login.

Si quieres, puedo generar un archivo `docs/API.md` con ejemplos más completos (Postman collection o OpenAPI/Swagger mínimo).

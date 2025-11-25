**Documentación de la Arquitectura del Proyecto**

Resumen técnico y descripción de la aplicación "MarketPlace Ubisoft" (backend + frontend).

**Resumen**:
- **Backend**: API REST construida con Node.js, Express y Mongoose (MongoDB). Autenticación con JWT.
- **Frontend**: Single Page Application con React y Vite (`my-react-spa/`). Consume la API del backend.

**Componentes Principales**
- **Servidor (backend/)**: entrada en `server.js`. Usa `dotenv`, `cors`, `morgan`, `express.json()` y conecta a MongoDB usando `backend/config/db.js`.
- **Modelos (Mongoose)**: `User` y `Skin` en `backend/models/`.
- **Controladores**: lógica por recurso en `backend/controllers/` (p. ej. `authController.js`, `skinController.js`).
- **Rutas**: se exponen en `backend/routes/` y se montan en `server.js`:
  - `/api/auth` → `authRoutes.js` (registro, login, perfil)
  - `/api/skins` → `skinRoutes.js` (explorar, subir, comprar, descargar, administrar)
- **Middleware**: `backend/middleware/authMiddleware.js` protege rutas que requieren token JWT.
- **Frontend (my-react-spa/)**: React (Vite), con `AuthContext`, `ProtectedRoute` y páginas para explorar, gestionar y autenticarse.

Arquitectura en una línea: Client (React) ⟷ REST API (Express + JWT) ⟷ MongoDB (Mongoose).

**Flujos clave**
- Autenticación (login/register): el usuario envía credenciales a `/api/auth/login` o `/api/auth/register`. El backend valida, genera un JWT con `JWT_SECRET` y lo devuelve al cliente. El cliente lo envía en `Authorization: Bearer <token>` para rutas protegidas.
- Subir skin: usuario autenticado POST `/api/skins/` con metadatos + `urlArchivo`. El backend crea un documento `Skin`, lo asocia con `User.skinsSubidas`.
- Comprar skin: usuario autenticado POST `/api/skins/:id/buy`. Se valida saldo (`User.wallet`), se actualizan `User.skinsCompradas`, `User.wallet`, y `Skin.compras`.
- Descargar skin: POST `/api/skins/:id/download` valida que el usuario tenga derecho (gratis, creador o comprado) y devuelve `urlArchivo`.

**Modelos**
- `User` (colección `usuarios`): `username`, `email`, `password` (hashed), `nombre`, `avatar`, `fechaRegistro`, `skinsSubidas` (ObjectId[] → Skin), `skinsCompradas`, `skinsDescargadas`, `wallet` (Number).
- `Skin` (colección `skin`): `nombre`, `descripcion`, `precio`, `imagen`, `categoria`, `usuarioCreador` (ObjectId → User), `fechaCreacion`, `descargas`, `compras`, `urlArchivo`, `tags`, `activo`.

**Endpoints principales (resumen)**
- Auth
  - `POST /api/auth/register` — registrar usuario
  - `POST /api/auth/login` — login (devuelve JWT)
  - `GET /api/auth/me` — obtener perfil (protegido)
  - `PUT /api/auth/profile` — actualizar perfil (protegido)
  - `DELETE /api/auth/profile` — eliminar perfil (protegido)
- Skins
  - `GET /api/skins` — listar / filtrar skins
  - `GET /api/skins/:id` — obtener skin
  - `POST /api/skins` — subir skin (protegido)
  - `POST /api/skins/:id/buy` — comprar skin (protegido)
  - `POST /api/skins/:id/download` — descargar skin (protegido)
  - `GET /api/skins/user/my-skins` — obtener skins del usuario (protegido)
  - `PUT /api/skins/:id` — actualizar (protegido)
  - `DELETE /api/skins/:id` — eliminar (protegido)

**Configuración y variables de entorno**
- Archivo `.env` esperado en `backend/` con variables mínimas:
  - `MONGO_URI` — URI de conexión a MongoDB
  - `JWT_SECRET` — secreto para tokens JWT
  - `PORT` — puerto del servidor (opcional, default: 4000)

**Ejecución local**
- Backend:
  - `cd backend`
  - `npm install`
  - `npm run dev` (usa `nodemon` en `package.json` si está instalado)
- Frontend:
  - `cd my-react-spa`
  - `npm install`
  - `npm run dev` (levanta Vite)

**Consideraciones de seguridad**
- Nunca comitear `.env` con `JWT_SECRET` o `MONGO_URI` en claro.
- Usar HTTPS en producción y proteger cookies/localStorage donde se guarde el token.
- Limitar tamaño de peticiones (ya hay `limit: '10mb'` en `express.json`).
- Validación y sanitización adicional de inputs (por ejemplo, comprobaciones más estrictas de `urlArchivo`).

**Escalabilidad y mejoras recomendadas**
- Externalizar almacenamiento de archivos (S3, GCS) en lugar de URLs directas a archivos embebidos.
- Añadir cola para procesar archivos pesados (ej. creación de previews) con RabbitMQ/Redis.
- Implementar paginación en `GET /api/skins` para listas grandes.
- Añadir tests unitarios e integración para endpoints críticos (auth, compra, descarga).

**Observabilidad / Operaciones**
- Logging: `morgan('dev')` en desarrollo; en producción usar un logger estructurado (p. ej. `winston` o `pino`).
- Monitoreo: agregar métricas (Prometheus) y alertas básicas para errores 5xx o latencia.

**Diagrama simplificado**

Client (React SPA)
   |
   | HTTPS (Bearer JWT)
   v
Express API (server.js)
   |- Routes: /api/auth, /api/skins
   |- Controllers: authController, skinController
   |- Middleware: authMiddleware (JWT)
   v
MongoDB (Mongoose)

**Archivos relevantes**
- `backend/server.js`
- `backend/config/db.js`
- `backend/models/User.js`, `backend/models/Skin.js`
- `backend/controllers/*Controller.js`
- `backend/routes/*.js`
- `backend/middleware/authMiddleware.js`
- `my-react-spa/src/*` (App, context, pages, components)

---

Si quieres, puedo:
- Generar un `docs/API.md` con ejemplos de requests/responses (Postman/HTTPie).
- Añadir diagramas más visuales (Mermaid) y añadirlos al `README.md`.
- Crear un checklist de seguridad y un `deploy.md` con pasos para desplegar en Heroku/Vercel/Azure.

Archivo generado automáticamente: `docs/architecture.md`

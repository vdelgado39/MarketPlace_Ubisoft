# MarketPlace Ubisoft - Proyecto

Repositorio para el proyecto "MarketPlace Ubisoft" (backend + frontend React + Vite).

Este documento resume cómo ejecutar el proyecto localmente, variables de entorno necesarias y dónde encontrar la documentación específica de backend y frontend.

## Estructura principal

- `backend/` — API REST con Express, Mongoose (MongoDB) y autenticación JWT.
- `my-react-spa/` — Single Page Application en React (Vite) que consume la API del backend.

## Requisitos

- Node.js 18+ (o la versión recomendada para las dependencias listadas)
- MongoDB accesible (URI de conexión)

## Variables de entorno principales

Crear un archivo `.env` en `backend/` con al menos estas variables:

- `MONGO_URI` — URI de conexión a MongoDB
- `JWT_SECRET` — clave secreta para firmar tokens JWT
- `PORT` — (opcional) puerto donde correr el backend (por defecto 4000)

Ejemplo mínimo de `.env`:

```
MONGO_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=tu_clave_secreta_aqui
PORT=4000
```

## Cómo ejecutar (desarrollo)

1. Instalar dependencias del backend:

```powershell
cd backend; npm install
```

2. Iniciar backend en modo desarrollo (con `nodemon` si está instalado):

```powershell
cd backend; npm run dev
```

3. Instalar dependencias del frontend y levantar la SPA:

```powershell
cd my-react-spa; npm install
npm run dev
```

La SPA por defecto usará `vite` en `http://localhost:5173` (u otro puerto que Vite asigne). Asegúrate de configurar en el frontend la URL base del API si no usa la misma máquina o puerto.

## Documentación adicional

- `backend/README.md` — instrucciones detalladas y referencia rápida de la API.
- `my-react-spa/README.md` — instrucciones del frontend (scripts y configuración Vite).

Si quieres que genere ejemplos de Postman/HTTPie o un archivo `docs/API.md` con ejemplos concretos de requests/responses, dímelo y lo agrego.

---

Estado actual:

- Endpoints de autenticación disponibles en `/api/auth`:
  - `POST /api/auth/register` — registrar usuario
  - `POST /api/auth/login` — iniciar sesión (devuelve token JWT)
  - `GET /api/auth/me` — obtener perfil (protegido)
  - `PUT /api/auth/profile` — actualizar perfil (protegido)
  - `DELETE /api/auth/profile` — eliminar perfil (protegido)

Más detalles en `backend/README.md`.

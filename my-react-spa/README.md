# Frontend — my-react-spa (React + Vite)

Esta carpeta contiene la Single Page Application del MarketPlace implementada con React y Vite.

## Resumen

- Vite como bundler y servidor de desarrollo.
- `react-router-dom` para enrutado.
- `axios` usado para llamadas a la API (revisar `src/services` o componentes para la configuración del baseURL).
- Contexto de autenticación: `src/context/AuthContext.jsx`.

## Ejecutar localmente

Instalar dependencias:

```powershell
cd my-react-spa
npm install
```

Levantar servidor de desarrollo:

```powershell
npm run dev
```

Construir para producción:

```powershell
npm run build
npm run preview
```

Lint:

```powershell
npm run lint
```

## Configurar la API

Por defecto el frontend espera que la API del backend esté disponible en `http://localhost:4000`.
Busca en la carpeta `src/services` (o en los ficheros donde se usan `axios`) la propiedad `baseURL` para ajustar la URL del backend si es necesario.

## Rutas principales en la UI

- `/` — Inicio
- `/explorar-skins` — Explorar skins (pública)
- `/gestionar-skins` — Gestión personal (protegida)
- `/login` — Login
- `/register` — Registro
- `/profile` — Perfil (protegida)

Las rutas protegidas usan un componente `ProtectedRoute` que depende del `AuthContext`.

## Notas rápidas

- Para pruebas de integración local: registra un usuario vía la API (`/api/auth/register`), luego inicia sesión y copia el `token` en localStorage si quieres simular la sesión.
- Si quieres, puedo añadir un archivo `.env.example` en `my-react-spa` con variables como `VITE_API_BASE_URL` y mostrar cómo usarlo en `axios`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

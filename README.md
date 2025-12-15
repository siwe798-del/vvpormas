# Banca en Línea B×+ - React TypeScript

Aplicación web de banca en línea convertida de AngularJS a React con TypeScript.

## Requisitos

- Node.js 18+ 
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

Para ejecutar el servidor de desarrollo en localhost:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
src/
├── components/      # Componentes React
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Login.tsx
│   ├── Password.tsx
│   └── Container.tsx
├── services/       # Servicios y lógica de negocio
│   ├── api.service.ts
│   └── config.service.ts
├── types/          # Definiciones de tipos TypeScript
│   └── index.ts
├── App.tsx         # Componente principal
├── main.tsx        # Punto de entrada
└── index.css       # Estilos globales

public/
└── config.json     # Archivo de configuración
```

## Configuración

Edita `public/config.json` para configurar la URL del servidor API:

```json
{
  "ipServer": "http://localhost:8080/api",
  "name": "Omnisuite",
  "app": "omnisuite",
  "images": "assets/images/"
}
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Tecnologías Utilizadas

- React 18
- TypeScript
- Vite
- React Router
- Axios

## Notas

- Los assets originales (CSS, imágenes, fuentes) se mantienen en sus carpetas originales
- La aplicación utiliza sessionStorage para manejar el estado de sesión
- El routing está configurado con React Router v6





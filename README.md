# Design Motion Lab

Base React + TypeScript + Vite para construir un generador de diseno con componentes reutilizables y control fino de microanimaciones.

## Requisitos

- Node.js 20 o superior

## Instalacion

```bash
npm install
```

## Comandos

```bash
npm run dev
```

Inicia el servidor local en `http://localhost:5173`.

```bash
npm run build
```

Compila TypeScript y genera la version de produccion.

```bash
npm run lint
```

Revisa calidad basica de TypeScript/React.

```bash
npm run check
```

Ejecuta lint y build.

## Estructura

```text
.
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig*.json
└── src/
    ├── app/
    ├── components/
    ├── features/
    ├── lib/
    ├── styles/
    ├── main.tsx
    └── vite-env.d.ts
```

## Variables de entorno

Puedes copiar `.env.example` a `.env` para ajustar valores publicos de Vite.

## Arquitectura inicial

- `src/app`: composicion global de la experiencia.
- `src/components`: primitives reutilizables de UI.
- `src/features/design-generator`: logica, tipos y componentes del generador.
- `src/lib`: utilidades compartidas.
- `src/styles`: tokens globales y estilos base.

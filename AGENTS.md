# AGENTS.md — Biblioteca Manuel Córdova

## Stack y comandos

- **Astro 5 + Tailwind CSS 4** — output estático, no SSR
- `npm run dev` — desarrollo local (puerto 4321)
- `npm run build` — build a `dist/`
- `npm run preview` — preview del build local

## Fuente de verdad

- `src/data/libros.json` — array de libros (6 en V1)
- `src/data/site.json` — contacto de Manuel, placeholders `MANUEL_*_AQUI` (completar antes del deploy)

## Restricciones duras (NO violar)

- CERO frameworks UI (no React, Vue, Svelte, Solid)
- CERO librerías de iconos (SVG inline en `Icon.astro`)
- CERO librerías de animación (CSS nativo)
- CERO dark mode en V1
- NO generar carátulas con IA — usar `cover: null` + `BookCardPlaceholder`
- NO inventar datos de Manuel — usar los placeholders
- NO crear el proyecto en Cloudflare Pages (Manuel lo hace con sus credenciales)
- NO agregar analytics, formularios con backend, carrito, o pagos

## Datos de contacto en site.json

Reemplazar estos placeholders ANTES del deploy:
- `MANUEL_EMAIL_AQUI`
- `MANUEL_WHATSAPP_AQUI` (formato: `56987654321` sin `+`)
- `MANUEL_BIO_AQUI`

## Formato de precios

CLP con `Intl.NumberFormat('es-CL', {style: 'currency', currency: 'CLP', maximumFractionDigits: 0})` → `$45.000`

## Slug generation

Usar NFD + remove combining marks para quitar acentos. Ejemplo: `"Estática en la Construcción"` → `"estatica-en-la-construccion"`

## Carátulas

- Formato: WebP, max 600px ancho, calidad 85
- Guardar en `src/assets/covers/{id}.webp`
- Si no se encuentra → `cover: null` (mostrar `BookCardPlaceholder`)
- Orden de búsqueda: editorial → Casa del Libro → Amazon → Iberlibro → Open Library

## Filtros en home

Vanilla JS en `BookFilter.astro`, filtran por `data-*` attributes del DOM. NO usar librerías.

## SEO

- `@astrojs/sitemap` genera `dist/sitemap-index.xml`
- `public/robots.txt` apunta al sitemap
- JSON-LD Schema.org `Book` en cada página de detalle
- `<html lang="es-CL">`

## Git

- Commits: `git commit` (NO usar `npx`, `npm run`, o wrappers)
- Push: `git push` (NO usar `npx` para ejecutar git)

## Deploy

- Cloudflare Pages (proyecto: `manuel-cordova`)
- Build command: `npm run build`
- Output directory: `dist`
- Node: `20`
- No adapter Astro necesario (static output)

## Referencias

- Spec completo: `spec.md`
- Listado de libros y referencias: `LIBROS.md`
- Excel source: `Material/Libros Técnicos para Venta Manuel Córdova.xlsx` (solo TEV0001-TEV0006 en V1)

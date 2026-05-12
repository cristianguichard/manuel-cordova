# Especificación — Sitio "Biblioteca Manuel Córdova"

**Cliente:** Manuel Córdova
**Tipo:** Sitio catálogo público (sin e-commerce)
**Stack obligatorio:** Astro 5 + Tailwind CSS 4, sin dependencias adicionales (excepto sitemap oficial de Astro y fuente Inter)
**Ejecutor:** MiniMax en OpenCode
**Hosting destino:** Cloudflare Pages (proyecto: `manuel-cordova`)
**Idioma:** Español de Chile (es-CL)
**Fecha del spec:** 2026-05-09

---

## 0. Contexto y propósito

Manuel Córdova quiere vender una colección de libros técnicos (construcción, ingeniería estructural, matemáticas aplicadas, gestión de operaciones). El sitio es un **catálogo público** donde los compradores ven los libros, sus datos y se contactan directamente con Manuel vía WhatsApp o email — **no hay checkout online, ni carrito, ni pagos integrados**.

El catálogo arranca con **6 libros reales** del Excel `Material/Libros Técnicos para Venta Manuel Córdova.xlsx`. El sitio debe estar **diseñado para escalar** a 200+ libros sin refactor cuando Manuel agregue más.

---

## 1. Arquitectura del proyecto

### Stack

- **Astro 5** (última estable) — Static Site Generator, output estático puro
- **Tailwind CSS 4** vía la integración oficial (`@astrojs/tailwind` o `@tailwindcss/vite` según versión más estable a la fecha)
- **`@astrojs/sitemap`** — única integración extra permitida (oficial, bajo peso, gana mucho en SEO)
- **`@fontsource-variable/inter`** — fuente Inter variable, autohospedada (no Google Fonts CDN)
- **CERO frameworks de UI** (no React, no Vue, no Svelte, no Solid)
- **CERO librerías de iconos** (SVG inline)
- **CERO librerías de animación** (transiciones CSS nativas)

### Tipo de sitio

Static Site Generator. Todo HTML pre-renderizado en build time. Sin backend, sin SSR, sin server-side rendering.

### Estructura de carpetas

```
manuel-cordova/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Home + grilla del catálogo
│   │   ├── libros/[slug].astro      # Detalle dinámico de cada libro
│   │   └── 404.astro                # Página de error
│   ├── components/
│   │   ├── Layout.astro             # Header + footer + meta tags
│   │   ├── BookCard.astro           # Tarjeta de libro en grilla
│   │   ├── BookCardPlaceholder.astro# Fallback CSS cuando no hay carátula
│   │   ├── BookFilter.astro         # Filtros (buscador, tema, año, orden) — vanilla JS
│   │   ├── ContactButtons.astro     # Email + WhatsApp con mensaje pre-armado
│   │   └── Icon.astro               # SVG inline reutilizable
│   ├── data/
│   │   ├── libros.json              # Source of truth — los libros
│   │   └── site.json                # Datos de contacto y bio de Manuel
│   ├── assets/
│   │   └── covers/                  # Carátulas locales (.webp)
│   └── styles/
│       └── global.css               # Tailwind imports + tokens custom
├── public/
│   ├── favicon.svg
│   ├── og-image.png                 # Imagen de Open Graph para compartir
│   └── robots.txt
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── README.md                        # Guía de uso para Manuel
└── LIBROS.md                        # Listado de los 6 libros con referencias
```

### Páginas

1. **Home (`/`)** — Hero con bio breve + grilla de libros con filtros + CTA general de contacto
2. **Detalle (`/libros/{slug}`)** — Página por libro con info completa, carátula grande, descripción, precio, botones de contacto, JSON-LD Schema.org
3. **404 (`/404`)** — Error mínimo con link a home

---

## 2. Modelo de datos

### Source of truth: `src/data/libros.json`

Es un array de objetos. Cada objeto representa un libro con este schema:

```json
{
  "id": "TEV0001",
  "slug": "estatica-en-la-construccion",
  "titulo": "Estática en la Construcción",
  "autor": "Kurt Hirschfeld",
  "editorial": "Reverté S.A.",
  "anio": 1975,
  "edicion": "Tercera Edición",
  "paginas": 1587,
  "tapa": "dura",
  "tema": "Construcción / Ingeniería Estructural",
  "codigoTema": "TE",
  "isbn": "978-84-291-2051-6",
  "idioma": "Español",
  "precio": 45000,
  "moneda": "CLP",
  "estado": "Usado - Buen estado",
  "descripcion": "Curso clásico de estática para estudiantes de ingeniería civil, basado en el programa de la Universidad Técnica de Aachen.",
  "observaciones": "Tercera Edición. 1.587 páginas. Tapa dura",
  "cover": {
    "src": "/covers/tev0001.webp",
    "alt": "Portada del libro Estática en la Construcción de Kurt Hirschfeld",
    "fuente": "Editorial Reverté",
    "url_origen": "https://www.reverte.com/libro/estatica-en-la-construccion_81331/"
  },
  "referencias": [
    {"sitio": "Casa del Libro", "url": "https://www.casadellibro.com/libro-estatica-en-la-construccion/9788429120516/440915"},
    {"sitio": "Amazon España", "url": "https://www.amazon.es/Est%C3%A1tica-en-Construcci%C3%B3n-K-Hirschfeld/dp/8429120513"}
  ],
  "destacado": false,
  "disponible": true
}
```

### Reglas de campos

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | string | sí | Código del Excel (TEV0001, etc.) |
| `slug` | string | sí | kebab-case sin acentos, único, generado del título |
| `titulo` | string | sí | Tal cual del Excel |
| `autor` | string | sí | Nombre completo |
| `editorial` | string | sí | |
| `anio` | number | sí | 4 dígitos |
| `edicion` | string | no | Ej: "Tercera Edición" |
| `paginas` | number | no | Solo número |
| `tapa` | "dura" \| "blanda" \| null | no | |
| `tema` | string | sí | Texto descriptivo (no solo código) |
| `codigoTema` | string | sí | Código del Excel: "TE" para técnicos |
| `isbn` | string \| null | no | Con guiones, formato 13 o 10 |
| `idioma` | string | sí | Default "Español" |
| `precio` | number | sí | Número entero, sin símbolos |
| `moneda` | string | sí | "CLP" |
| `estado` | string | sí | Ej: "Usado - Buen estado" |
| `descripcion` | string | sí | 1-3 frases sobre el libro |
| `observaciones` | string | no | Texto crudo del Excel |
| `cover` | object \| null | no | Si null → mostrar placeholder CSS |
| `referencias` | array | no | Links externos para validar precio/info |
| `destacado` | boolean | no | Para futuro: marcar destacados en home |
| `disponible` | boolean | sí | Default true. Si false → muestra badge "Vendido" |

### Datos verificados de los 6 libros (de búsqueda web previa)

MiniMax debe usar estos datos como base. Completar `descripcion` con 1-3 frases razonables basadas en la búsqueda web. Si algún dato falta, dejarlo `null` antes que inventarlo.

| ID | Título | Autor | Editorial | Año | Precio CLP | ISBN | Observaciones |
|----|--------|-------|-----------|-----|------------|------|---------------|
| TEV0001 | Estática en la Construcción | Kurt Hirschfeld | Reverté S.A. | 1975 | 45.000 | 978-84-291-2051-6 | Tercera Edición. 1.587 páginas. Tapa dura |
| TEV0002 | Manual del Constructor | José María Igoa | Ediciones Ceac | 1995 | 40.000 | 84-329-2116-5 | Quinta Edición. 406 páginas. Tapa blanda |
| TEV0003 | La Chimenea en el Hogar | Juan de Cusa Ramos | Ediciones Ceac | 1961 | 10.000 | null (libro previo a ISBN moderno) | Segunda Edición. 220 páginas. Tapa dura |
| TEV0004 | Distribución de Momentos | James M. Gere | Compañía Editorial Continental S.A. | 1965 | 40.000 | null | Primera Edición. 412 páginas |
| TEV0005 | Matemáticas Aplicadas para Administración Economía y Ciencias Sociales | Frank S. Budnick | McGraw-Hill | 1990 | 35.000 | 970-10-5698-1 (4ta ed.) | Tercera Edición. 948 páginas. Tapa blanda |
| TEV0006 | Curso de MBA Gestión de Operaciones | Steven Nahmias | McGraw-Hill / Bresca | 2010 | 45.000 | 978-84-96998-44-5 | Primera Edición en Castellano. 110 páginas |

### Reglas para carátulas

1. Para cada libro, **buscar la carátula** siguiendo este orden de prioridad:
   1. Sitio oficial de la editorial (Reverté, McGraw-Hill, Ceac)
   2. Casa del Libro / Buscalibre
   3. Amazon España / Amazon México
   4. Iberlibro (especialmente para libros viejos sin ISBN)
   5. Open Library / Google Books
2. **Descargar la imagen** y guardarla en `src/assets/covers/{id_minusculas}.webp`
3. **Optimizar:** convertir a WebP, calidad 85, máximo 600px de ancho
4. **Si NO se encuentra carátula** tras agotar las fuentes razonables (probable para TEV0003 y TEV0004 por ser de los 60s):
   - Marcar `cover: null` en el JSON
   - Renderizar `BookCardPlaceholder` — un fallback CSS con el título y año sobre fondo neutro, **NO usar IA generativa para crear carátulas falsas**
5. **PROHIBIDO:** inventar imágenes con IA, usar imágenes con marca de agua, copiar imágenes con copyright explícito

### Slug generation

Función pura para generar slugs:
1. Pasar a minúsculas
2. Quitar acentos (NFD + remove combining marks)
3. Reemplazar espacios y caracteres no alfanuméricos por `-`
4. Colapsar guiones múltiples
5. Trim de guiones al inicio/fin

Ejemplo: `"Estática en la Construcción"` → `"estatica-en-la-construccion"`

### `src/data/site.json`

Datos del sitio (separados de los libros para fácil edición):

```json
{
  "owner": {
    "nombre": "Manuel Córdova",
    "bio": "MANUEL_BIO_AQUI",
    "email": "MANUEL_EMAIL_AQUI",
    "whatsapp": "MANUEL_WHATSAPP_AQUI",
    "ubicacion": "Chile"
  },
  "site": {
    "nombre": "Biblioteca Manuel Córdova",
    "tagline": "Libros técnicos seleccionados — Catálogo de venta",
    "url": "https://manuel-cordova.pages.dev",
    "moneda": "CLP",
    "lang": "es-CL"
  }
}
```

Manuel completará estos placeholders cuando tenga los datos finales.

---

## 3. Componentes y vistas

### `Layout.astro`

Wrapper común para todas las páginas. Props:

- `title: string` (required)
- `description: string` (required)
- `ogImage?: string` (default: `/og-image.png`)
- `canonical?: string`

Contenido:
- `<head>` con meta tags SEO (title, description, og:*, twitter:*, canonical)
- `<html lang="es-CL">`
- Skip-to-content link
- Header sticky: nombre del sitio + nav simple (link a home)
- `<main id="main">` con `<slot />`
- Footer: contacto (Email + WhatsApp), copyright, "Sitio creado en Astro + Tailwind"

### `BookCard.astro`

Tarjeta de libro en grilla. Props:

- `libro: Libro` (object con todos los campos)

Layout:
```
┌─────────────────────┐
│                     │
│   [carátula 3:4]    │  ← <Image> de Astro o BookCardPlaceholder
│                     │
├─────────────────────┤
│ Título              │  ← font-semibold text-base
│ del libro           │  ← line-clamp-2
│                     │
│ Autor · 1975        │  ← text-sm text-muted
│                     │
│ $45.000  →          │  ← precio + arrow icon
└─────────────────────┘
```

- Imagen con `loading="lazy"`, aspect-ratio 3:4, `object-cover`
- Hover sutil: `border-color` a negro, transición 200ms
- Link al detalle (`<a href="/libros/{slug}">`)
- Data attributes para filtros: `data-titulo`, `data-autor`, `data-anio`, `data-precio`, `data-tema`
- Badge "Vendido" si `disponible: false`

### `BookCardPlaceholder.astro`

Fallback cuando no hay carátula. CSS art puro:
- Aspect-ratio 3:4
- Fondo: gradiente sutil (`from-neutral-50 to-neutral-200`)
- Borde fino
- Centro: título del libro (truncado a 3 líneas) en serif elegante
- Abajo: año + autor en mono
- Decoración: una línea horizontal o un símbolo tipográfico simple

### `BookFilter.astro`

Barra de filtros con vanilla JS embebido en `<script is:inline>`.

UI:
```
┌────────────────────────────────────────────────────────┐
│ [🔍 Buscar por título o autor...]                      │
│                                                        │
│ Tema: [Todos ▾]  Desde: [____]  Hasta: [____]         │
│ Ordenar: [Más recientes ▾]                             │
└────────────────────────────────────────────────────────┘
```

Comportamiento:
- Filtra los `<article>` del DOM por `data-*` attributes
- "Todos" en tema → no filtra por tema
- Buscador hace match case-insensitive sobre `data-titulo` Y `data-autor`
- Año desde/hasta: number inputs (4 dígitos)
- Orden:
  - "Más recientes" (año desc)
  - "Más antiguos" (año asc)
  - "Precio menor a mayor"
  - "Precio mayor a menor"
  - "A-Z" (alfabético por título)
- Si no hay resultados → mostrar mensaje "Sin libros que coincidan con tu búsqueda"
- Debounce de 200ms en el buscador

Implementación: vanilla JS, **sin librerías**. Aproximadamente 50-80 líneas de JS.

### `ContactButtons.astro`

Botones de contacto reutilizables. Props:

- `tituloLibro?: string` (opcional, para mensaje pre-armado)
- `codigoLibro?: string` (opcional)
- `variant?: "stack" | "inline"` (default: "inline")

Si recibe `tituloLibro`:
- WhatsApp: `https://wa.me/{whatsapp}?text=Hola Manuel, me interesa el libro "{titulo}" ({codigo})`
- Email: `mailto:{email}?subject=Consulta libro {codigo} - {titulo}&body=Hola Manuel, me interesa el libro "{titulo}".`

Si NO recibe `tituloLibro`:
- WhatsApp: `https://wa.me/{whatsapp}?text=Hola Manuel, te escribo por tu catálogo de libros`
- Email: `mailto:{email}?subject=Consulta sobre tu catálogo de libros`

Estilo:
- Botón Email: `bg-black text-white`, padding 12px 24px, radius 6px, hover `bg-neutral-700`
- Botón WhatsApp: `bg-[#25d366] text-white`, mismo padding/radius
- Iconos SVG inline a la izquierda del texto
- Touch target mínimo 44x44px

### `Icon.astro`

Componente para SVG inline. Props:

- `name: "mail" | "whatsapp" | "search" | "arrow-right"` (required)
- `size?: number` (default: 16)
- `class?: string`

Cada icono es un SVG hardcoded en el componente, stroke 2px, currentColor.

### Página `src/pages/index.astro`

1. **Hero:**
   - `<h1>` con nombre del sitio
   - Subtítulo con tagline
   - Bio breve de Manuel (de `site.json`)
   - Stats line: "{n} libros · {temas únicos} · Precios desde ${min} CLP"

2. **Filtros** (`<BookFilter />`)

3. **Grilla de libros:**
   - `<section>` con `<article>` por libro
   - Grid responsive: 1 col mobile, 2 col tablet, 3 col desktop (max 3 con 6 libros)
   - Map sobre el array `libros` importado de `libros.json`

4. **CTA final:**
   - "¿Te interesa algún libro? Contactá directamente"
   - `<ContactButtons />` sin libro específico

### Página `src/pages/libros/[slug].astro`

`getStaticPaths()` genera una ruta por libro desde `libros.json`.

Layout 2 columnas (desktop) / 1 columna (mobile):

**Columna izquierda** (sticky en desktop):
- Carátula grande con `<Image>` de Astro
- Si no hay carátula → `<BookCardPlaceholder>` ampliado

**Columna derecha:**
- Breadcrumb: "← Volver al catálogo"
- `<h1>` Título del libro
- Línea de metadata: `Autor · Año · Editorial`
- Tabla/lista de specs: edición, páginas, tapa, idioma, ISBN, código interno
- **Precio destacado** en grande: `$45.000 CLP`
- Estado del libro
- Descripción (`<p>` con `descripcion`)
- Observaciones del Excel (si difieren de `descripcion`)
- `<ContactButtons tituloLibro={...} codigoLibro={...} />`
- Sección "Referencias online" — lista de links a las `referencias` del libro
- Footer: link "← Volver al catálogo"

**JSON-LD inline:**

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "...",
  "author": {"@type": "Person", "name": "..."},
  "publisher": "...",
  "datePublished": "1975",
  "isbn": "...",
  "numberOfPages": 1587,
  "inLanguage": "es",
  "offers": {
    "@type": "Offer",
    "price": 45000,
    "priceCurrency": "CLP",
    "availability": "https://schema.org/InStock",
    "seller": {"@type": "Person", "name": "Manuel Córdova"}
  }
}
```

### Página `src/pages/404.astro`

- Usa `<Layout>`
- Mensaje: "Esta página no existe"
- Link "Volver al catálogo →"
- Diseño minimalista, mismo estilo del sitio

---

## 4. Diseño visual

### Paleta (en `src/styles/global.css` con `@theme`)

```css
--color-bg:           #ffffff;
--color-bg-subtle:    #fafafa;
--color-border:       #e5e5e5;
--color-text:         #0a0a0a;
--color-text-muted:   #737373;
--color-text-soft:    #a3a3a3;
--color-accent:       #0a0a0a;
--color-accent-hover: #404040;
--color-whatsapp:     #25d366;
```

### Tipografía

- **Familia única:** Inter Variable (`@fontsource-variable/inter`)
- `font-display: swap`
- Preload de la fuente principal en `<head>`

Escala:
| Uso | Mobile | Tablet | Desktop | Weight | Tracking |
|-----|--------|--------|---------|--------|----------|
| Display (hero h1) | 48px | 56px | 64px | 700 | -0.02em |
| H1 detalle | 32px | 40px | 48px | 700 | -0.02em |
| H2 sección | 24px | 28px | 32px | 600 | normal |
| H3 | 18px | 20px | 20px | 600 | normal |
| Body | 16px | 16px | 16px | 400 | normal (line-height 1.6) |
| Small/meta | 14px | 14px | 14px | 400 | normal |
| Tiny/labels | 12px | 12px | 12px | 500 | uppercase 0.05em |

### Espaciado

- Sistema base 4px (Tailwind default)
- **Section vertical padding:** 48px mobile, 64px tablet, 96px desktop
- **Container max-width:** 1280px (`max-w-7xl`)
- **Container horizontal padding:** 24px / 32px / 48px
- **Card padding:** 16px
- **Gap entre cards:** 16px mobile, 24px desktop

### Breakpoints

Tailwind defaults: `sm:640`, `md:768`, `lg:1024`, `xl:1280`, `2xl:1536`.

Grilla de libros: 1 col → md:2 cols → lg:3 cols. **No subir a 4 cols** con catálogo pequeño (con 200+ libros se evalúa cambiar a `xl:grid-cols-4`).

### Componentes — detalles

- **BookCard:** border 1px `--color-border`, radius 8px, hover border negro 200ms, sin shadow
- **Botones:** padding 12px 24px, radius 6px, focus ring 2px negro offset 2px
- **Inputs:** border 1px gris, focus ring negro 2px, radius 6px
- **Touch targets:** mínimo 44x44px

### Iconos (SVG inline, currentColor, stroke 2px)

- `mail` (heroicons outline simplificado)
- `whatsapp` (logo oficial simplificado, paths SVG embebidos)
- `search` (lupa simple)
- `arrow-right` (→)

Tamaño base 16px, escalable vía prop.

### Animaciones

- Transiciones 150-200ms en hovers
- Respeta `prefers-reduced-motion: reduce`
- **Sin** scroll animations, parallax, o efectos exagerados

### Modo oscuro

**No incluir en V1.** Puede ser V2.

---

## 5. SEO, Performance, Accesibilidad

### Meta tags por página

En `Layout.astro`, todos configurables por props:
- `<title>`
- `<meta name="description">`
- `<meta name="author" content="Manuel Córdova">`
- `<link rel="canonical">` (URL absoluta)
- Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (`website` para home, `book` para detalle)
- Twitter: `twitter:card="summary_large_image"`, `twitter:title`, `twitter:image`

### URLs

- `/` — Home
- `/libros/{slug}` — Detalle
- `/404` — Error

### Sitemap

`@astrojs/sitemap` configurado en `astro.config.mjs`.

### robots.txt

`public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://manuel-cordova.pages.dev/sitemap-index.xml
```

### Schema.org

JSON-LD `<script type="application/ld+json">` inline en cada página de detalle (ver Sección 3).

En home, JSON-LD tipo `WebSite` con datos del sitio.

### Performance — objetivos

- Lighthouse Performance ≥ 95
- Lighthouse Accessibility ≥ 95
- Lighthouse Best Practices ≥ 95
- Lighthouse SEO ≥ 95
- LCP < 1.5s
- CLS < 0.1
- JS al cliente < 5KB total

### Cómo lograrlo

- Imágenes con `<Image />` de `astro:assets` → genera WebP/AVIF, srcset
- `loading="lazy"` below-the-fold
- `width` y `height` explícitos siempre (evita CLS)
- Fonts: `font-display: swap`, preload de Inter Variable
- CSS purgado por Tailwind en producción
- Cero dependencias JS = cero hidration

### Accesibilidad

- HTML semántico: `<header>`, `<main>`, `<nav>`, `<article>`, `<footer>`
- `<h1>` único por página
- Contraste WCAG AA mínimo (paleta cumple)
- `alt` real en imágenes (título del libro)
- Focus visible en links/botones
- `aria-label` en botones que solo tengan ícono
- `prefers-reduced-motion` respetado
- Skip-to-content link al inicio

### i18n

- `<html lang="es-CL">`
- Formato moneda: `Intl.NumberFormat('es-CL', {style: 'currency', currency: 'CLP', maximumFractionDigits: 0})` → `$45.000`
- Una sola lengua, no multi-idioma

---

## 6. Hosting y deploy

### Plataforma

**Cloudflare Pages**, proyecto llamado `manuel-cordova`.

### Importante para MiniMax

- **MiniMax NO debe intentar crear el proyecto en Cloudflare** — eso requiere las credenciales de Manuel
- MiniMax sí debe:
  - Configurar `astro.config.mjs` con `site: 'https://manuel-cordova.pages.dev'`
  - Generar el repo Git listo para conectar
  - Documentar paso a paso en el README cómo conectar Cloudflare Pages
- Astro estático funciona directo en Cloudflare Pages, **no requiere adapter** (`output: 'static'`)

### Configuración esperada en Cloudflare Pages (la hace Manuel manualmente, no MiniMax)

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `20`
- Variables de entorno: ninguna requerida

---

## 7. Datos pendientes (Manuel debe completar)

Estos placeholders deben quedar en `src/data/site.json` con valores `MANUEL_*_AQUI`:

| Placeholder | Descripción | Ejemplo |
|-------------|-------------|---------|
| `MANUEL_EMAIL_AQUI` | Email de contacto | `manuel@ejemplo.cl` |
| `MANUEL_WHATSAPP_AQUI` | WhatsApp con código país (sin `+`) | `56987654321` |
| `MANUEL_BIO_AQUI` | Bio breve (2-3 líneas) | "Coleccionista de libros técnicos..." |

Manuel los reemplazará antes del deploy final.

---

## 8. Plan de ejecución para MiniMax

### Fase 1 — Setup (15 min)

1. `npm create astro@latest manuel-cordova -- --template minimal --typescript strict --install --git --no`
2. `cd manuel-cordova`
3. `npx astro add tailwind --yes`
4. `npx astro add sitemap --yes`
5. `npm install @fontsource-variable/inter`
6. Crear estructura de carpetas (Sección 1)
7. Configurar `astro.config.mjs` con `site: 'https://manuel-cordova.pages.dev'`
8. Configurar `src/styles/global.css` con tokens (Sección 4)
9. Importar fuente Inter en el layout

### Fase 2 — Datos (30 min)

1. Crear `src/data/libros.json` con los 6 libros usando datos verificados (Sección 2)
2. Crear `src/data/site.json` con placeholders
3. Para cada libro, **buscar carátula** siguiendo orden de prioridad:
   - Editorial oficial → Casa del Libro → Buscalibre → Amazon → Iberlibro → Open Library
4. Descargar, optimizar (WebP, max 600px, calidad 85), guardar en `src/assets/covers/{id}.webp`
5. Si NO hay carátula tras agotar fuentes → `cover: null` (NO inventar con IA)
6. Validar que el JSON parsea correctamente

### Fase 3 — Componentes base (45 min)

1. `Layout.astro`
2. `Icon.astro`
3. `ContactButtons.astro`
4. `BookCardPlaceholder.astro`
5. `BookCard.astro`
6. `BookFilter.astro` (con vanilla JS para filtrado)

### Fase 4 — Páginas (30 min)

1. `src/pages/index.astro`
2. `src/pages/libros/[slug].astro` (con `getStaticPaths` y JSON-LD)
3. `src/pages/404.astro`
4. `public/robots.txt`
5. `public/favicon.svg` (libro abierto minimalista en SVG)
6. `public/og-image.png` (1200x630, generar simple con texto)

### Fase 5 — Refinamiento (30 min)

1. `npm run build` — verificar que no haya errores ni warnings
2. `npm run preview` — verificar visualmente
3. Lighthouse local en home y detalle (target ≥ 95 en todas las métricas)
4. Verificar responsive en 375px, 768px, 1280px
5. Validar JSON-LD en https://search.google.com/test/rich-results
6. Probar links de WhatsApp y mailto

### Fase 6 — Documentación (15 min)

1. `README.md` con:
   - Resumen del proyecto
   - Cómo correr local (`npm install`, `npm run dev`)
   - Cómo agregar un libro (editar `libros.json` + carátula en `src/assets/covers/`)
   - Cómo deployar a Cloudflare Pages (paso a paso)
   - Cómo cambiar datos de contacto (`src/data/site.json`)
2. `LIBROS.md` con la lista de los 6 libros y sus referencias web

---

## 9. Criterios de aceptación

MiniMax debe verificar TODOS estos puntos antes de considerar el trabajo terminado:

- [ ] `npm install` corre sin errores
- [ ] `npm run dev` levanta el servidor correctamente
- [ ] `npm run build` corre sin errores ni warnings
- [ ] `npm run preview` muestra el sitio funcional
- [ ] Lighthouse Performance ≥ 95 en home y detalle
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse SEO ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Los 6 libros aparecen en home con sus datos correctos
- [ ] Cada libro tiene su página de detalle accesible vía `/libros/{slug}`
- [ ] Filtros funcionan: buscador, tema, año desde/hasta, orden (5 opciones)
- [ ] Botones de WhatsApp y Email abren con el mensaje pre-armado correcto
- [ ] Sitio responsive en 375px (mobile), 768px (tablet), 1280px+ (desktop)
- [ ] CERO dependencias fuera de las permitidas (ver Sección 1)
- [ ] Sin `console.log` ni `console.error` en código de producción
- [ ] HTML válido (W3C validator)
- [ ] JSON-LD válido en cada página de detalle
- [ ] Sitemap generado en `dist/sitemap-index.xml`
- [ ] `robots.txt` accesible y correcto
- [ ] Página 404 funcional
- [ ] README y LIBROS.md escritos completos
- [ ] Repo Git inicializado con commit inicial
- [ ] `.gitignore` incluye `node_modules`, `dist`, `.astro`

---

## 10. Lo que NO debe hacer MiniMax

- ❌ NO instalar React, Vue, Svelte, Solid u otros frameworks UI
- ❌ NO instalar librerías de iconos (Lucide, Heroicons como package, etc.)
- ❌ NO instalar librerías de animación (Framer Motion, GSAP, etc.)
- ❌ NO instalar librerías de UI (shadcn, Radix, etc.)
- ❌ NO inventar carátulas con IA generativa
- ❌ NO inventar libros que no estén en el spec
- ❌ NO inventar datos de Manuel (email, teléfono, bio) — usar placeholders `MANUEL_*_AQUI`
- ❌ NO crear el proyecto en Cloudflare Pages (eso lo hace Manuel manualmente con sus credenciales)
- ❌ NO push al repo remoto (Manuel conectará GitHub mañana)
- ❌ NO agregar Google Analytics, Plausible u otros trackers (puede ser V2)
- ❌ NO agregar formularios que requieran backend (Formspree, etc.)
- ❌ NO agregar carrito, checkout, ni pagos
- ❌ NO usar imágenes con marca de agua o copyright ambiguo

---

## 11. Material de referencia

El Excel original está en `Material/Libros Técnicos para Venta Manuel Córdova.xlsx`. Tiene 209 filas pero solo las primeras 6 (TEV0001 a TEV0006) tienen datos completos. El resto son códigos placeholder vacíos que Manuel completará en el futuro. **Para esta V1, solo se procesan los 6 primeros.**

---

**Fin del spec.**

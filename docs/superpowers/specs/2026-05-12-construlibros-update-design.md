# Spec — Actualización CONSTRULIBROS (delta sobre SPEC.md)

**Fecha:** 2026-05-12
**Cambio:** Rebranding + 6 libros nuevos + soporte foto real + resumen de contenido
**Base:** `SPEC.md` (versión original, 6 libros, "Biblioteca Manuel Córdova")

---

## 1. Contexto

Manuel envió Excel actualizado con 12 libros (antes 6). Los últimos dos (TEV0011, TEV0012) traen **foto real del libro físico** y **resumen de contenido** como modelo de información futura. Manuel propone también renombrar el sitio a **CONSTRULIBROS** porque es más descriptivo.

Este spec describe SOLO las diferencias respecto a `SPEC.md`. Todo lo no mencionado acá se mantiene igual (stack, arquitectura, contacto, deploy).

---

## 2. Cambios de branding

| Elemento | Antes | Después |
|----------|-------|---------|
| Nombre sitio | Biblioteca Manuel Córdova | **CONSTRULIBROS** (mayúsculas) |
| Subtítulo | Libros técnicos seleccionados — Catálogo de venta | **Manuel Córdova** |
| Dominio | manuel-cordova.pages.dev | (sin cambios por ahora — migración a `construlibros.pages.dev` queda pendiente y la hace Manuel manualmente en Cloudflare) |

**Tratamiento visual:**
- Header de `Layout.astro`: wordmark de dos líneas → "CONSTRULIBROS" (font-bold, tracking-tight, uppercase via CSS) + "Manuel Córdova" (text-sm text-muted)
- Hero en `index.astro`: mismo tratamiento, escalado (h1 grande para CONSTRULIBROS, p text-lg para Manuel Córdova)
- Footer: actualizar copyright a "© {año} CONSTRULIBROS"

**En `site.json`:**

```json
{
  "owner": { "nombre": "Manuel Córdova", "...": "..." },
  "site": {
    "nombre": "CONSTRULIBROS",
    "tagline": "Manuel Córdova",
    "url": "https://manuel-cordova.pages.dev",
    "moneda": "CLP",
    "lang": "es-CL"
  }
}
```

El `<title>` HTML pasa a ser `CONSTRULIBROS — Manuel Córdova` en lugar de `Biblioteca Manuel Córdova — Libros técnicos seleccionados...`.

---

## 3. Cambios en datos (libros)

### 3.1 Nuevos campos en el tipo `Libro`

```ts
export interface Libro {
  // ... campos existentes
  resumen: string | null;     // string crudo del Excel ("tema1, tema2, tema3")
  fotoReal: string | null;    // nombre archivo en src/assets/libros/, ej "TEV0011.jpg"
  cover: Cover | null;        // sin cambios — fallback ISBN externo
  // ...
}
```

- `resumen`: viene del Excel, columna "Resumen Contenido". String separado por comas. En la card se muestra crudo con `line-clamp-2`. En la página de detalle se splittea por `, ` y se renderiza como lista con bullets.
- `fotoReal`: solo nombre de archivo. La ruta completa la arma el componente: `src/assets/libros/{fotoReal}`.

### 3.2 Cascada de imagen (prioridad)

```
1. ¿libro.fotoReal?  → <Image src={fotoReal} ...>  (Astro <Image />, optimización automática)
2. ¿libro.cover?     → <img src={cover.src} ...>   (URL externa ISBN, sin procesar)
3. else              → <BookCardPlaceholder />     (CSS placeholder existente)
```

Importante: `<Image />` de Astro genera WebP responsive automáticamente para `fotoReal`. Para `cover` externo no se puede procesar (URL remota), se usa `<img>` plano como hasta ahora.

### 3.3 Catálogo final — 12 libros

| ID | Título | Autor | Año | Precio | Tema | Imagen |
|----|--------|-------|-----|--------|------|--------|
| TEV0001 | Estática en la Construcción | Kurt Hirschfeld | 1975 | $45.000 | Ingeniería Estructural | cover ISBN |
| TEV0002 | Manual del Constructor | José María Igoa | 1995 | $40.000 | Construcción | cover ISBN |
| TEV0003 | La Chimenea en el Hogar | Juan de Cusa Ramos | 1961 | $10.000 | Construcción | placeholder |
| TEV0004 | Distribución de Momentos | James M. Gere | 1965 | $40.000 | Ingeniería Estructural | placeholder |
| TEV0005 | Matemáticas Aplicadas | Frank S. Budnick | 1990 | $35.000 | Matemáticas | cover ISBN |
| TEV0006 | Curso de MBA Gestión de Operaciones | Steven Nahmias | 2010 | $45.000 | Gestión de Operaciones | cover ISBN |
| TEV0007 | Control de Calidad | Dale H. Besterfield | 1995 | $45.000 | Gestión de Operaciones | cover ISBN |
| TEV0008 | Análisis de Sistemas | Juan Bravo Carrasco | 1998 | $38.000 | Gestión de Operaciones | placeholder |
| TEV0009 | Reglamento Seguridad Instalaciones Eléctricas Decreto 8 | SEC | 2020 | $25.000 | Electricidad / Normativa | placeholder |
| TEV0010 | Hormigón Pretensado | Hans Moell | 1958 | $50.000 | Ingeniería Estructural | placeholder |
| TEV0011 | Sistemas de Planificación y Control de la Fabricación | Thomas E. Vollmann et al | 1995 | $75.000 | Gestión de Operaciones | foto real |
| TEV0012 | Arquitectura Sostenible | Cristina Paredes Benítez et al | 2014 | $90.000 | Arquitectura | foto real |

### 3.4 Datos confirmados de los libros nuevos

**TEV0007 — Control de Calidad**
- ISBN: `978-968-880-530-5`
- Editorial: Prentice Hall Hispanoamericana S.A.
- Edición: Cuarta Edición
- Páginas: 508
- Tapa: blanda
- Cover URL: `https://imagessl5.casadellibro.com/a/l/s5/05/9789688805305.webp`
- Referencias: Casa del Libro (`https://latam.casadellibro.com/libro-control-de-calidad-4-ed/9789688805305/492037`)

**TEV0008 — Análisis de Sistemas**
- ISBN: `956-7604-04-5`
- Editorial: Editorial Evolución S.A. (Impresos Universitaria S.A.)
- Edición: Primera Edición
- Páginas: 415
- Tapa: blanda
- Cover: null (no encontrado en bases internacionales — editorial chilena chica)
- Referencias: ninguna confiable encontrada

**TEV0009 — Reglamento Seguridad Instalaciones Eléctricas (Decreto 8)**
- ISBN: null (es documento normativo, no libro comercial)
- Editorial: Gala Ediciones
- Edición: Edición Actualizada 2025
- Páginas: 497
- Tapa: blanda
- Cover: null (placeholder)
- Referencias: SEC (`https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/`)

**TEV0010 — Hormigón Pretensado**
- ISBN: null (pre-ISBN, 1958)
- Editorial: Editorial Gustavo Gili S.A.
- Edición: Primera Edición en Castellano
- Páginas: 279
- Tapa: dura
- Cover: null (placeholder)
- Referencias: ninguna

**TEV0011 — Sistemas de Planificación y Control de la Fabricación**
- Autores: Thomas E. Vollmann, William L. Berry, D. Clay Whybark
- Editorial: IRWIN
- Edición: Tercera Edición
- Páginas: 867
- Tapa: blanda
- ISBN: null (no necesario — usa foto real)
- fotoReal: `TEV0011.jpg`
- Resumen: "Planificación Maestra, Planificación de Requerimientos de Materiales, Administración de Inventarios, Administración de Capacidad, Control de la Actividad de Producción, Justo a Tiempo"

**TEV0012 — Arquitectura Sostenible**
- Autores: Cristina Paredes Benítez et al
- Editorial: Editorial LEXUS
- Edición: Edición de lujo
- Páginas: null (no informado en Excel)
- Tapa: dura
- ISBN: null (no necesario — usa foto real)
- fotoReal: `TEV0012.jpg`
- Resumen: "Diseño y Construcción Bioclimáticos"

---

## 4. Cambios en componentes

### 4.1 `BookCard.astro`

**Cambio 1 — cascada de imagen:**

```astro
{libro.fotoReal ? (
  <Image
    src={import(`../assets/libros/${libro.fotoReal}`)}
    alt={`Tapa de ${libro.titulo}`}
    widths={[300, 600]}
    sizes="(max-width: 768px) 100vw, 300px"
    class="w-full h-full object-cover"
  />
) : libro.cover ? (
  <img src={libro.cover.src} alt={libro.cover.alt} loading="lazy" class="w-full h-full object-contain" />
) : (
  <BookCardPlaceholder titulo={libro.titulo} autor={libro.autor} anio={libro.anio} />
)}
```

Nota: el dynamic import `import(...)` de Astro requiere usar `import.meta.glob` para precargar las imágenes de assets. Implementación exacta queda para la fase de apply, pero el patrón es el estándar de Astro.

**Cambio 2 — resumen visible:**

Entre la línea "Autor · Año" y el precio, agregar:

```astro
{libro.resumen && (
  <p class="text-xs text-[--color-text-soft] line-clamp-2 mb-2">
    {libro.resumen}
  </p>
)}
```

### 4.2 `[slug].astro` (página de detalle)

**Cambio 1 — cascada de imagen:** misma lógica que BookCard.

**Cambio 2 — sección "Contenido":**

Después del bloque de descripción y antes de las observaciones, agregar:

```astro
{libro.resumen && (
  <section class="mb-8">
    <h2 class="font-semibold text-sm uppercase tracking-wide text-[--color-text-soft] mb-3">
      Contenido
    </h2>
    <ul class="space-y-1 list-disc list-inside">
      {libro.resumen.split(/,\s*/).map(item => (
        <li class="text-base">{item}</li>
      ))}
    </ul>
  </section>
)}
```

### 4.3 `Layout.astro`

Header pasa de `<a>Biblioteca Manuel Córdova</a>` a wordmark de dos líneas:

```astro
<a href="/" class="block leading-tight">
  <span class="block font-bold text-lg uppercase tracking-wide">CONSTRULIBROS</span>
  <span class="block text-xs text-[--color-text-muted]">Manuel Córdova</span>
</a>
```

Footer copyright: `© {año} CONSTRULIBROS`.

### 4.4 `index.astro`

Hero:

```astro
<h1 class="font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight uppercase mb-2">
  CONSTRULIBROS
</h1>
<p class="text-lg text-[--color-text-muted] mb-6">{site.owner.nombre}</p>
```

Contador actualizado: `12 libros · 6 temas · Precios desde {minPrecio}`.

---

## 5. Pre-procesamiento de imágenes

Las fotos originales pesan 9–17MB (3060×4080 px). Antes de meterlas al repo, se procesan a:

- **Resolución máxima:** 1200×1600 px (manteniendo proporción)
- **Formato:** JPEG
- **Calidad:** 85%
- **Tamaño esperado:** ~150–250KB cada una

Ubicación final: `manuel-cordova/src/assets/libros/TEV0011.jpg` y `TEV0012.jpg`.

Comando de referencia (sips, macOS):

```bash
sips -s format jpeg -s formatOptions 85 -Z 1600 /tmp/TEV0011.png --out manuel-cordova/src/assets/libros/TEV0011.jpg
```

---

## 6. Filtro de temas

El filtro de `BookFilter.astro` ya consume `temasUnicos` de `index.astro`. Sin cambios al componente — solo recibe la nueva lista derivada de los 12 libros:

```
- Arquitectura
- Construcción
- Electricidad / Normativa
- Gestión de Operaciones
- Ingeniería Estructural
- Matemáticas
```

6 categorías para 12 libros — balance razonable.

---

## 7. Plan de implementación

| # | Tarea | Archivos | Verificación |
|---|-------|----------|--------------|
| 1 | Pre-procesar fotos | `/tmp/TEV0011.png`, `/tmp/TEV0012.png` → `src/assets/libros/TEV0011.jpg`, `TEV0012.jpg` | tamaño <300KB cada una |
| 2 | Actualizar `site.json` | nombre, tagline | json válido |
| 3 | Actualizar `types.ts` | agregar `resumen`, `fotoReal` | tsc sin errores |
| 4 | Reescribir `libros.json` | 12 libros con datos finales | json válido, 12 entradas |
| 5 | Actualizar `Layout.astro` | header + footer wordmark | render visual |
| 6 | Actualizar `index.astro` | hero + contador | render visual |
| 7 | Actualizar `BookCard.astro` | cascada imagen + resumen | render visual |
| 8 | Actualizar `[slug].astro` | cascada imagen + sección Contenido | render visual |
| 9 | `npm run dev` y verificar 12 libros, foto real renderiza, placeholders OK, filtros funcionan | dev server | revisión Manuel |
| 10 | `npm run build` | dist/ generado sin errores | exit 0 |

---

## 8. Criterios de aceptación

- [x] Header y hero muestran "CONSTRULIBROS" + "Manuel Córdova"
- [x] `<title>` HTML es "CONSTRULIBROS — Manuel Córdova"
- [x] Catálogo lista 12 libros
- [x] Filtro muestra 6 categorías
- [x] TEV0011 y TEV0012 renderizan con foto real optimizada (<300KB)
- [x] TEV0007 renderiza con cover Casa del Libro
- [x] TEV0003, TEV0004, TEV0008, TEV0009, TEV0010 renderizan con placeholder CSS
- [x] Cards de TEV0011 y TEV0012 muestran resumen line-clamp-2
- [x] Página detalle de TEV0011 y TEV0012 muestra sección "Contenido" con bullets
- [x] Cards sin resumen no muestran línea de resumen vacía
- [x] Página detalle sin resumen no muestra sección "Contenido" vacía
- [x] `npm run build` termina sin errores
- [x] Precio mínimo del contador refleja $10.000 (TEV0003)

---

## 9. Fuera de scope

- Migración de dominio a `construlibros.pages.dev` (Manuel lo hará manualmente cuando decida)
- Páginas adicionales (about, contacto separado, etc.)
- Carrito o checkout (sigue siendo catálogo, no e-commerce)
- Búsqueda de fotos reales para los 10 libros restantes (Manuel las tomará en el futuro y solo hay que dropearlas en `src/assets/libros/` + actualizar `fotoReal` en `libros.json`)
- Búsqueda de ISBN para TEV0011 y TEV0012 (tienen foto real, no necesitan cover ISBN)
- Búsqueda de resúmenes para los 10 libros viejos (Manuel los completará cuando pueda)

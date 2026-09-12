<!-- BEGIN:nextjs-agent-rules -->
# Next.js & MIRATEA Agent Rules

This version of Next.js has breaking changes — APIs, conventions, and file structure may all differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Directrices Inmutables de MIRATEA (Solutech)
1. **SSOT Rule (`PROJECT_CONTEXT.md`)**: `PROJECT_CONTEXT.md` en la raíz es la Fuente Única de Verdad (Single Source of Truth) y DEBE actualizarse tras cualquier cambio o refactorización antes de dar por terminada cualquier tarea.
2. **Denominación de Moneda**: Se llama SIEMPRE **Sparks** (o **Sparks ✦**). NUNCA usar "chispas".
3. **Flujo de Premios**: Los niños proponen con o sin estimación opcional. Los padres aprueban y asignan/editan la cantidad exacta de Sparks en un modal de 1-clic sin borrar ni recrear el premio.
4. **Metas y Aventuras**: Modales sensoriales cálidos (`#FAF9F7`) con selector dinámico de pasos (`2..6`), botón `+ Añadir otro paso` dinámico y desintegrador de IA con Lumi.
5. **Ajustes Centralizados**: La Fuente de Lectura Adaptada (OpenDyslexic) y la opción "Menos Efectos y Animaciones" residen de forma unificada en la Pestaña de Ajustes (`Tab 5 / profile`). La barra superior del header se mantiene limpia sin botones redundantes.
6. **Sin Punición**: Prohibido usar contadores de rachas destructivos. El compañero Lumi jamás pierde nivel.
7. **Inmutabilidad del Ícono de MIRATEA**: El icono oficial de MIRATEA (`icon.svg` / `icon-192x192.png` / `icon-512x512.png` / `favicon.ico`) es inmutable y definitivo. Queda estrictamente prohibido modificarlo o sustituirlo a menos que el usuario lo exija explícitamente. Forma parte integral del Favicon, PWA e identidad de la app.

## Gobernanza Permanente de Versionado y Release
1. **Fuente Única Técnica de Versionado**: `package.json` es la ÚNICA fuente técnica canónica de la versión de la aplicación. `PROJECT_CONTEXT.md` refleja el estado contextual pero NO sustituye la fuente técnica.
2. **Control Semántico Obligatorio (SemVer)**:
   - `PATCH` (x.y.Z): Correcciones de bugs, retoques visuales, refactorizaciones internas y optimizaciones.
   - `MINOR` (x.Y.0): Nuevas funcionalidades compatibles para usuarios o APIs.
   - `MAJOR` (X.0.0): Breaking changes, migraciones incompatibles de datos, contratos o APIs.
3. **Inviolabilidad de Historia**: La versión jamás debe retroceder durante el desarrollo normal.
4. **Cadena Completa PWA & Cachés**: En cada release o cambio relevante de PWA, la versión de la app, el Service Worker (`public/sw.js`) y el identificador de caché (`CACHE_NAME`) deben actualizarse de forma determinista para forzar la invalidación limpia en los clientes instalados.
5. **Verificación Obligatoria de Integridad (VERSION INTEGRITY CHECK)**: Toda tarea significativa debe finalizar verificando la consistencia entre `package.json`, `PROJECT_CONTEXT.md`, `CHANGELOG.md`, `public/sw.js` y el repositorio.

## Gestión Centralizada de Credenciales (.env Maestro)
1. **Repositorio Único de Claves**: El archivo `C:\Users\xavia\Documents\GitHub\.env` es el repositorio central canónico de credenciales, API keys y tokens para todos los proyectos personales y de Solutech.
2. **Persistencia Automática Obligatoria**: Cada vez que el usuario comparta o intercambie una API Key, Token o secreto en cualquier conversación, el agente DEBE almacenarla y actualizarla de inmediato en `C:\Users\xavia\Documents\GitHub\.env` en su sección correspondiente.
3. **Blindaje**: Dicho archivo `.env` maestro reside en la raíz de `GitHub\` fuera de cualquier repositorio y jamás debe comitearse a Git ni exponerse públicamente.
<!-- END:nextjs-agent-rules -->

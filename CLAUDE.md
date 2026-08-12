# MIRATEA — Developer & AI Agent Guidelines

MIRATEA by Solutech is a neurodiversity-affirming growth and self-regulation platform for children and families.

## Build & Verification Commands
- **Dev Server**: `npm run dev`
- **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Lint**: `npm run lint` (`eslint`) — *Must remain 0 errors, 0 warnings*
- **Test Suite**: `npm run test -- --run` (`vitest run --run`)
- **Build**: `npm run build`

## Directrices Inmutables y Reglas de Negocio
1. **SSOT Rule (`PROJECT_CONTEXT.md`)**: `PROJECT_CONTEXT.md` en la raíz es la Fuente Única de Verdad (Single Source of Truth) y DEBE actualizarse tras cualquier cambio o refactorización antes de dar por terminada cualquier tarea.
2. **Denominación de la Moneda Principal**: La moneda del sistema se llama SIEMPRE **Sparks** (o **Sparks ✦**). Prohibido usar la palabra "chispas" en interfaces, respuestas del compañero Lumi, catálogos o código.
3. **Flujo de Premios y Aprobación Parental**: Los niños sugieren premios (con o sin estimación opcional de Sparks). Los padres aprueban y asignan/editan la cantidad exacta de Sparks directamente en un modal interactivo de 1-clic sin borrar ni recrear el premio.
4. **Modales de Aventuras y Metas**: Los modales de propuesta de aventuras (`GoalProposalModal`) deben usar el diseño sensorial cálido de MIRATEA (`#FAF9F7`, bordes suaves, sombras `shadow-2xl`, botones Warm Bloom), permitir la selección de 2..6 pasos, incluir el botón `+ Añadir otro paso` dinámico y desintegrador de IA con Lumi.
5. **Sección de Ajustes Centralizada**: Los ajustes globales de accesibilidad (Fuente de Lectura Adaptada OpenDyslexic y Menos Efectos y Animaciones) viven unificados en la Pestaña de Ajustes (`Tab 5 / profile`). La barra superior del header se mantiene limpia sin botones duplicados.
6. **Protección PII**: Pasa siempre los prompts de LLM externos por `PiiSanitizer` (`src/lib/security/PiiSanitizer.ts`).
7. **Neurodivergent First**: Prohibido usar mecánicas punitivas, contadores de racha que se pierden o juicio social. El compañero Lumi jamás involuciona de fase.
8. **Arquitectura Dual-Adapter**: Mantén la interfaz `DataService` en `src/lib/adapters/` compatible tanto con `static` (demo en memoria) como con `supabase` (producción).
9. **Cero Tolerancia a Errores de Lint**: Mantén 0 errores y 0 advertencias de ESLint en todo momento.

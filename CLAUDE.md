# CLAUDE.md

Este archivo le da contexto a Claude Code (claude.ai/code) para trabajar en este repositorio.

## Qué es esto

Un sitio de una sola página (Next.js) para **Condo Resort Heritage** (operado por **Smart Stay**). Su pieza central es un simulador interactivo de rentabilidad, 100% del lado del cliente, que permite a un inversionista elegir tipo de unidad, número de unidades y un escenario (Pesimista/Conservador/Optimista), y ver al instante la utilidad neta proyectada, el ROI y el payback — sin backend, todo el cálculo ocurre en el navegador.

`PROMPT_LANDING_SIMULADOR_HERITAGE.md` es el prompt/spec original que describe el modelo financiero, las fórmulas y la UX requerida. Trátalo como contexto de diseño, no como fuente de verdad literal para las cifras — `src/lib/data.ts` es la fuente de verdad real y desde entonces se ha separado de ese spec (p. ej. la ocupación ahora es plana por escenario en los 3 años, no creciente; las partidas de gastos se modelan por apartamento en vez de como porcentajes planos). Cuando ambos difieran, confía en el código y sus comentarios.

## Comandos

```bash
npm run dev     # servidor de desarrollo (localhost:3000)
npm run build   # build de producción
npm run start   # correr el build de producción
npm run lint    # eslint (flat config, eslint-config-next)
```

No hay suite de tests configurada.

## Crítico: este no es el Next.js que conoces

Next.js está fijado en `16.2.10` con React `19.2.4` — una versión más nueva que tus datos de entrenamiento. **Antes de escribir código que toque routing, config, data fetching, caching o metadata, lee la doc correspondiente en `node_modules/next/dist/docs/`** (p. ej. `01-app/01-getting-started/`, `01-app/03-api-reference/05-config/`) en vez de confiar en tu conocimiento previo de las convenciones de Next.js. Respeta cualquier aviso de deprecación que encuentres ahí.

(`AGENTS.md` trae la misma advertencia en forma resumida — si actualizas esta sección, mantenlas alineadas.)

## Arquitectura

**Todo es un client component.** `src/app/page.tsx` es un shell de servidor simple que renderiza `SiteHeader → Hero → Simulator → HowItWorksSection → Footer` en orden; toda la interactividad vive en `Simulator.tsx` (marcado `"use client"`), que concentra prácticamente todo el estado del simulador (escenario, tipo de unidad, número de unidades/monto, parámetros avanzados, moneda, overrides) y pasa los valores derivados a sus hijos:

- `AdvancedParamsPanel` — overrides editables de % comisión, % FARA, % fee operador, % impuesto
- `StatTile` — números destacados de resultado (utilidad neta, ROI, payback)
- `VariablesOperativasTable`, `DetailedFinancialTable`, `ExpenseAnnexTables` — tablas de desglose del P&G
- `ScenarioComparatorCards`, `ChartsSection` (recharts) — vistas de comparación de los 3 escenarios
- `ActionBar` — llamado a la acción fijo (sticky)

**El modelo financiero está dividido en dos archivos dentro de `src/lib/`:**

- `data.ts` — todas las constantes: tasas base, tablas de ocupación/ADR por escenario, bases de costo mensual por apartamento (energía, agua, gas, internet, fee de administración, partidas relacionadas a nómina, etc.), y la tabla de rendimiento acumulado del fondo FARA. Cada constante tiene un comentario que explica su procedencia del Excel fuente (`Hertitage Nuevo.xlsx`, hoja "HERITAGE") y si/cómo varía por año o escenario — **lee esos comentarios antes de cambiar un número**, porque encierran decisiones de modelado no obvias (p. ej. por qué energía/agua/gas escalan con la ocupación pero internet no, por qué algunas partidas suben 5-10% entre escenarios en vez de calcularse).
- `calculations.ts` — el motor de cálculo puro (`calcularDesglose`, `simular`, y helpers como `ingresoTipologia`, `splitMixto`, `adrAplicado`, `formatCOP`/`formatUSD`/`formatMoney`). Son funciones planas sin dependencia de React, llamadas directamente desde `Simulator.tsx` en cada cambio de estado (totalmente reactivo, sin botón "calcular", tal como pide el spec).

**Conceptos clave del modelo a tener presentes al tocar el motor:**
- La selección de tipo de unidad `"mixto"` (proyecto completo) reparte las unidades 72:36 (1-hab:2-hab) vía `splitMixto`, respetando la composición real del edificio — no un reparto parejo.
- Las partidas de gastos caen en dos familias: porcentaje-sobre-ventas (comisión canales, FARA, marketing y fee operador comercial; solo comisión, FARA y fee operador son editables vía `AdvancedParams`, más impuesto de renta que también es editable pero aplica sobre utilidad operacional, no ventas) vs. fijas-por-apartamento-por-mes (energía, agua, gas, fee administración, aseo, lavandería, Sayco, PMS, otros gastos operativos, Nómina Prestacional y Bolsa de Empleo — controladas por las constantes `*_BASE_MENSUAL` en `data.ts`, infladas 5%/año, algunas de las cuales además varían por escenario). **Trampa de nombres:** el campo `costosOperacion` de `DesglosePYG` no es un % de ventas pese a la familia a la que remite su nombre — contiene Nómina Prestacional, fija por apartamento. Bolsa de Empleo también dejó de ser % de ventas: ahora es fija por apartamento, definida como 10% de la base mensual de Nómina Prestacional (`BOLSA_EMPLEO_BASE_MENSUAL = NOMINA_PRESTACIONAL_BASE_MENSUAL * 0.1`).
- La participación del inversionista en cualquier resultado del pool es siempre `sus unidades / unidades totales de su tipología`, no una porción del promedio general del edificio.
- El fondo FARA (9% E.A.) es ingreso adicional del inversionista, no un costo — por eso queda deliberadamente fuera de `advancedParams` y se calcula aparte vía `faraAcumuladoInversionista`.
- Moneda: toda la matemática interna es en COP; USD es solo conversión de visualización (`formatMoney`/`formatCompact`) usando una tasa de cambio de referencia editable, nunca usada en el cálculo subyacente.

## Estilos

Tailwind CSS v4 (vía `@tailwindcss/postcss`, sin archivo `tailwind.config.*` — los tokens de tema se definen directamente en `src/app/globals.css` con `@theme inline`). La paleta de marca (arena/navy/gold/copper + colores por escenario) vive ahí como custom properties CSS — reutiliza esos tokens (`bg-navy`, `text-arena`, `text-gold`, etc.) en vez de introducir colores nuevos.

# PROMPT MAESTRO — Landing Page Simulador de Rentabilidad
## Condo Resort Heritage × Smart Stay

Copia y pega todo el bloque de abajo (desde "ROL Y CONTEXTO" hasta el final) en Claude Code, Cursor, v0.dev o la herramienta que uses para generar el sitio.

---

## ROL Y CONTEXTO

Actúa como **arquitecto senior full-stack**, **diseñador UX/UI premium** y **experto en modelos financieros para inversión inmobiliaria turística**. Vas a construir una **landing page comercial** cuyo componente central es un **simulador interactivo de rentabilidad** para inversionistas del proyecto **Condo Resort Heritage**, operado y comercializado bajo la marca **Smart Stay** (operador hotelero único del proyecto).

El simulador debe traducir un modelo financiero real (P&G a 3 años, 3 escenarios) en una experiencia visual simple, confiable y persuasiva para un inversionista que NO es financiero: debe entender en segundos cuánto podría ganar según cuánto invierte, en qué tipo de apartamento, y bajo qué escenario de ocupación.

---

## 1. DATOS GENERALES DEL PROYECTO (fuente: modelo financiero real, hoja "HERITAGE")

- **Unidades productivas totales:** 108
  - Apartamentos 1 Habitación: **72 unidades**
  - Apartamentos 2 Habitaciones: **36 unidades**
- **Días de operación:** 365/año (proyectados a **350 días efectivos/año** en el modelo)
- **Crecimiento anual del ADR (tarifa):** 5%
- **Inflación anual de costos fijos:** 5%
- **Factor prestacional de nómina:** 1.45
- **Impuesto de renta aplicado:** 35% sobre utilidad bruta (EBITDA)
- Todas las cifras están en **COP (pesos colombianos)**.

---

## 2. LOS 3 ESCENARIOS (Pesimista / Conservador / Optimista) — Años 1 a 3

### % de Ocupación
| Escenario | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| Pesimista | 35% | 40% | 45% |
| Conservador | 50% | 55% | 60% |
| Optimista | 65% | 70% | 75% |

### ADR — Tarifa promedio diaria por tipología (COP)
| Escenario | Tipología | Año 1 | Año 2 | Año 3 |
|---|---|---|---|---|
| Pesimista | 1 Hab | 480.000 | 504.000 | 529.200 |
| Pesimista | 2 Hab | 550.000 | 577.500 | 606.375 |
| Conservador | 1 Hab | 528.000 | 554.400 | 582.120 |
| Conservador | 2 Hab | 605.000 | 635.250 | 667.013 |
| Optimista | 1 Hab | 633.600 | 665.280 | 698.544 |
| Optimista | 2 Hab | 726.000 | 762.300 | 800.415 |

### Ingresos totales proyectados (COP)
| Escenario | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| Pesimista | 6.659.100.000 | 7.990.920.000 | 9.439.274.250 |
| Conservador | 10.464.300.000 | 12.086.266.500 | 13.844.268.900 |
| Optimista | 16.324.308.000 | 18.459.025.200 | 20.766.403.350 |

### Gastos totales proyectados (COP)
| Escenario | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| Pesimista | 6.518.988.000 | 7.184.551.500 | 7.900.373.880 |
| Conservador | 7.812.756.000 | 8.576.969.310 | 9.398.072.061 |
| Optimista | 9.805.158.720 | 10.743.707.268 | 11.751.597.774 |

### Utilidad Neta (después de impuesto de renta 35%) (COP)
| Escenario | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| Pesimista | 91.072.800 | 524.139.525 | 1.000.285.240 |
| Conservador | 1.723.503.600 | 2.281.043.173 | 2.890.027.945 |
| Optimista | 4.237.447.032 | 5.014.956.656 | 5.859.623.624 |

### Margen Neto (%)
| Escenario | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| Pesimista | 1,37% | 6,56% | 10,60% |
| Conservador | 16,47% | 18,87% | 20,88% |
| Optimista | 25,96% | 27,17% | 28,22% |

### Utilidad Neta por unidad — Año 3 (maduración)
| Escenario | Por unidad 1-Hab | Por unidad 2-Hab |
|---|---|---|
| Pesimista | 8.832.541 | 10.120.620 |
| Conservador | 25.519.011 | 29.240.533 |
| Optimista | 51.740.606 | 59.286.111 |

---

## 3. FÓRMULAS DEL MOTOR DE CÁLCULO (replicar exactamente en el simulador)

```
Ingresos_tipología(año) = N° unidades × ADR(año, escenario) × Días efectivos (350) × % Ocupación(año, escenario)
Ingresos_totales(año) = Ingresos_1Hab(año) + Ingresos_2Hab(año)

Gastos_totales(año) = Nómina (con factor prestacional 1.45)
                     + Servicios públicos (energía, agua, gas, internet)
                     + Tecnología (PMS, Channel Manager — RMS/CRM/automatización incluidos en fee Smart Stay)
                     + Operación y suministros (papelería, aseo, lavandería, dotación)
                     + Marketing (1% de ventas)
                     + Cuota administración/condominio
                     + Seguro responsabilidad civil
                     + Honorarios firma contable + Revisoría fiscal
                     + FARA — mantenimiento/reparaciones (3% de ventas, ver sección 4)
                     + Otros gastos operativos
                     + Seguros y licencias (Sayco/Acinpro/Egeda, Bomberos, etc.)
                     + Comisiones OTAs (18% de ingresos)
                     + Honorarios operación Smart Stay: fee variable (12% de ventas) + fee base (1Hab $400.000 / 2Hab $460.000 por unidad/mes)

EBITDA(año) = Ingresos_totales(año) − Gastos_totales(año)
Margen_EBITDA(año) = EBITDA(año) / Ingresos_totales(año)

Impuesto_renta(año) = EBITDA(año) × 35%
Utilidad_Neta(año) = EBITDA(año) − Impuesto_renta(año)
Margen_Neto(año) = Utilidad_Neta(año) / Ingresos_totales(año)

Reparto por pool (1-Hab vs 2-Hab):
% participación pool = Ingresos_tipología(año) / Ingresos_totales(año)
Utilidad_Neta_pool = Utilidad_Neta(año) × % participación pool
Utilidad_por_unidad = Utilidad_Neta_pool / N° unidades de esa tipología

Rentabilidad estimada del inversionista (por unidad o N unidades compradas):
Utilidad_inversionista(año) = Utilidad_por_unidad(tipología, año, escenario) × N° unidades del inversionista
ROI_anual(%) = Utilidad_inversionista(año) / Monto_invertido
Payback_estimado(años) = Monto_invertido / Utilidad_inversionista(año, en régimen/maduración)
```

---

## 4. FONDO FARA — RENDIMIENTO ADICIONAL (inversión virtual, 9% E.A.)

El FARA es un fondo de mantenimiento (3% de ventas) que, mientras no se usa en reparaciones/daños, se invierte y genera un rendimiento del **9% efectivo anual (E.A.)**, distribuido entre los 108 propietarios. Debe mostrarse como un "plus" de rentabilidad sobre la inversión inmobiliaria.

### Rendimiento acumulado por propietario (COP) — 5 años
| Escenario | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|---|---|---|---|---|---|
| Pesimista | 1.932.989 | 4.426.544 | 7.564.945 | 11.205.002 | 15.409.402 |
| Conservador | 3.037.554 | 6.819.308 | 11.451.730 | 16.822.563 | 23.023.987 |
| Optimista | 4.738.584 | 10.523.301 | 17.498.424 | 25.583.549 | 34.917.158 |

*Parámetros: tasa 9% E.A., 108 propietarios, convención de rendimiento a medio año (mid-year) sobre el aporte del periodo, crecimiento del aporte años 4-5 del 8%.*

Este monto se debe **sumar** a la utilidad neta operativa del inversionista para mostrar la rentabilidad total del proyecto.

---

## 5. FUNCIONALIDAD DEL SIMULADOR (obligatorio)

### Inputs del usuario (controles interactivos, tipo slider + botones):
1. **Tipo de apartamento**: 1 Habitación / 2 Habitaciones (o "mixto")
2. **N° de unidades a invertir** (o monto de inversión en COP, con conversión automática a N° de unidades según precio de venta configurable como variable)
3. **Escenario**: Pesimista / Conservador / Optimista (selector tipo tabs o toggle de 3 posiciones, con Conservador preseleccionado por defecto)
4. **Horizonte de tiempo**: Año 1 / Año 2 / Año 3 (slider o tabs)
5. Toggle opcional: **"Incluir rendimiento del Fondo FARA"** (sí/no)

### Outputs que debe mostrar en tiempo real (sin recargar la página):
- Utilidad neta estimada por año (COP) — tarjeta destacada, número grande
- ROI (%) anual y acumulado
- Payback estimado (años)
- Gráfica de barras/área comparando los 3 escenarios simultáneamente (Año 1-3)
- Desglose visual: Ingresos → Gastos → EBITDA → Impuesto → Utilidad Neta (tipo waterfall/funnel)
- Rendimiento adicional del Fondo FARA (si el toggle está activo), mostrado como línea/monto aparte que se suma al total
- Comparativo "por unidad" 1-Hab vs 2-Hab para que el usuario entienda por qué una tipología rinde distinto

### Reglas de UX:
- Todo debe recalcularse **instantáneamente** al mover cualquier control (sin botón "calcular", cálculo reactivo en cliente).
- Los tres escenarios deben estar SIEMPRE visibles como referencia (aunque uno esté seleccionado), para transmitir transparencia (no ocultar el pesimista).
- Formatear todos los valores en COP con separador de miles y símbolo $.
- Incluir un disclaimer visible y permanente: *"Cifras basadas en proyecciones financieras del modelo operativo de Smart Stay. No constituyen garantía de rentabilidad. Rentabilidades pasadas o proyectadas no aseguran resultados futuros."*

---

## 6. ESTRUCTURA DE LA LANDING PAGE

1. **Hero**: propuesta de valor + CTA directo a "Simula tu inversión" (scroll al simulador). Imagen/video de estilo resort de playa, marca Smart Stay visible.
2. **Simulador interactivo** (sección ancla, el corazón de la página, descrita en punto 5).
3. **Por qué invertir en Heritage**: operador único (Smart Stay), 108 unidades, tecnología incluida en el fee (PMS, Channel Manager, RMS, CRM, chatbot, automatización de cobros), fondo FARA como protección del activo + rentabilidad extra.
4. **Desglose financiero transparente**: tabla o acordeón con la estructura de costos (nómina, comisiones OTAs 18%, fee operación 12%+base, marketing, FARA, administración, etc.) para inversionistas que quieran profundidad.
5. **Comparativo de escenarios**: gráfica de utilidad neta 3 años × 3 escenarios (reutilizar datos de sección 2).
6. **Reparto por pool**: explicar que cada tipología (1-Hab/2-Hab) recibe utilidad proporcional a sus propios ingresos, no un promedio general.
7. **FAQ**: qué pasa si la ocupación es menor a la esperada, qué cubre el fee de Smart Stay, cómo funciona el FARA, cuándo se distribuyen utilidades, etc.
8. **CTA final + formulario de contacto** (nombre, email, teléfono, tipo de unidad de interés, monto a invertir) — conectado a un mailto o webhook simulado.
9. **Footer** con disclaimers legales y datos de la marca.

---

## 7. DISEÑO / UX-UI (premium, no genérico)

- Estética: resort tropical/costero premium — paleta cálida y sofisticada (arena, azul profundo, dorado/cobre como acento), tipografía serif elegante para títulos + sans-serif limpia para datos/números.
- Evitar template "SaaS genérico": el simulador debe sentirse como un panel financiero de alta gama (piensa Bloomberg terminal + resort de lujo), no como una calculadora de préstamo bancaria.
- Microinteracciones: transición suave de números (count-up animado) al cambiar inputs, gráficas con animación de entrada.
- Mobile-first: los controles del simulador deben ser 100% usables con el pulgar en un celular.
- Usa contraste alto y jerarquía clara: el número de "utilidad neta estimada" debe ser el elemento más grande y visible de toda la página.

---

## 8. STACK TÉCNICO SUGERIDO

Crear una aplicación web moderna usando:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Componentes reutilizables
- Estado local con React hooks
- Formateo monetario profesional
- Código limpio, escalable y bien documentado

No usar backend inicialmente. Toda la lógica puede estar en frontend.

---

## 9. ENTREGABLE ESPERADO

Un solo archivo/componente (o proyecto Next.js) con:
- Landing page completa y funcional descrita en la sección 6.
- Simulador 100% interactivo con las fórmulas exactas de la sección 3 y 4 (usar las tablas de datos de la sección 2 y 4 como fuente de verdad, no inventar cifras).
- Diseño premium acorde a la sección 7.
- Responsive completo (mobile, tablet, desktop).

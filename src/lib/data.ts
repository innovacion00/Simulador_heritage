// Fuente de verdad: modelo financiero real, hoja "HERITAGE" (archivo "Hertitage Nuevo.xlsx").
// Todas las cifras en COP. No inventar ni alterar estos valores.
// El Excel solo define explícitamente el Año 1 por escenario (ocupación fija + ADR por
// tipología). Los Años 2 y 3 se proyectan aplicando los supuestos propios del Excel:
// "Crecimiento tarifa anual (ADR)" 5%/año e "Inflación costos fijos" 5%/año, con
// ocupación constante (el Excel no define una curva de rampa de ocupación).

export type Escenario = "pesimista" | "conservador" | "optimista";
export type Tipologia = "1hab" | "2hab";
export type Anio = 1 | 2 | 3;

export const ESCENARIOS: { id: Escenario; label: string }[] = [
  { id: "pesimista", label: "Pesimista" },
  { id: "conservador", label: "Conservador" },
  { id: "optimista", label: "Optimista" },
];

export const TIPOLOGIAS: { id: Tipologia; label: string; unidades: number }[] = [
  { id: "1hab", label: "1 Habitación", unidades: 72 },
  { id: "2hab", label: "2 Habitaciones", unidades: 36 },
];

export const UNIDADES_TOTALES = 108;

// Días comercializables base por tipología (hoja HERITAGE, fila "Base de los Días").
// Ambas tipologías usan 365 días: es el valor que la fórmula de "Ventas de Hospedajes"
// del Excel realmente referencia (celda E19). Existe una celda de referencia con 305 días
// (365 - 60 días de goce del propietario) pero NO está conectada a ninguna fórmula de
// ingresos del modelo, por eso no se usa aquí.
export const DIAS_BASE: Record<Tipologia, number> = { "1hab": 365, "2hab": 365 };

// Valor usado como referencia/reset en el slider de "días efectivos" del simulador.
export const DIAS_EFECTIVOS = 365;

export const CRECIMIENTO_ADR_ANUAL = 0.05;
export const INFLACION_COSTOS_ANUAL = 0.05;
export const IMPUESTO_RENTA = 0;

// Comisión canales de venta (Booking, Airbnb, Web, Agencias + 20 canales)
export const COMISION_CANALES = 0.15;
// FARA — Fondo de Reposición y Reparación (% sobre ventas)
export const FARA_PCT = 0.015;
export const FARA_TASA_EA = 0.09;

// Nómina Prestacional — fijo mensual POR APARTAMENTO (antes "Costos de Operación: Nómina
// Personal, Variables, Dotación", que era 7% de ventas). Fuente: nómina mensual total de 15
// personas = $54.100.000, repartida entre las 108 unidades del edificio ajustadas por un
// factor de 1.05 → $54.100.000 / (108 × 1.05) = valor mensual por apartamento; el anual se
// obtiene multiplicando ese valor mensual × 12. Se calcula en vivo igual que Fee
// Administración/Energía/Agua/Gas (base × 12 × N apartamentos, con inflación de costos por año).
export const NOMINA_PRESTACIONAL_TOTAL_MENSUAL = 54_100_000;
export const NOMINA_PRESTACIONAL_BASE_MENSUAL = NOMINA_PRESTACIONAL_TOTAL_MENSUAL / (UNIDADES_TOTALES * 1.05);

// Bolsa de Empleo — fijo mensual POR APARTAMENTO (antes 0.7% de ventas = 10% de Costos de
// Operación). Ahora que Nómina Prestacional dejó de ser un % de ventas, Bolsa de Empleo se
// redefine como 10% de esa misma base mensual por apartamento; se calcula en vivo igual que
// Nómina Prestacional (base × 12 × N apartamentos, con inflación de costos por año).
export const BOLSA_EMPLEO_BASE_MENSUAL = NOMINA_PRESTACIONAL_BASE_MENSUAL * 0.1;
export const MARKETING_PCT = 0.007;
// Comisión Pasarela de Pagos — % sobre ventas (0.5% de los ingresos, tanto mensual como
// anual), no un monto fijo por apartamento. Fija en código, no editable vía AdvancedParams.
// Ej.: 1 hab, escenario Pesimista, Año 1 → ingresos anuales por unidad $110.412.500 × 0.005
// = $552.062,5 ≈ $552.063/año.
export const COMISION_PASARELA_PAGOS_PCT = 0.005;
// Operación Fee Operador comercial — % sobre ventas
export const OPERADOR_COMERCIAL_FEE_PCT = 0.08;
// Comisión Fee (antes "Comisión Fee Administración") — fijo mensual POR APARTAMENTO, y varía
// por TIPOLOGÍA (no por escenario ni por ocupación): 1 hab = $350.000/mes, 2 hab =
// $450.000/mes. Se calcula en vivo como base[tipología] × 12 × N apartamentos de esa
// tipología, igual patrón que Energía/Agua/Gas/Internet, no como un total del edificio
// repartido entre las 108 unidades.
export const FEE_ADMINISTRACION_MENSUAL: Record<Tipologia, number> = {
  "1hab": 350_000,
  "2hab": 450_000,
};

// Tasa de cambio de referencia COP/USD, editable en el simulador (solo afecta visualización).
export const TASA_CAMBIO_REFERENCIA = 4050;

export interface AdvancedParams {
  comisionCanalesPct: number;
  faraPct: number;
  operadorComercialFeePct: number;
  impuestoPct: number;
}

// Valores base del modelo (hoja HERITAGE). Editables en "Parámetros avanzados".
export const ADVANCED_PARAMS_DEFAULT: AdvancedParams = {
  comisionCanalesPct: COMISION_CANALES,
  faraPct: FARA_PCT,
  operadorComercialFeePct: OPERADOR_COMERCIAL_FEE_PCT,
  impuestoPct: IMPUESTO_RENTA,
};

// Precio de venta de referencia por tipología (COP).
// NOTA: estos valores NO provienen del modelo financiero (hoja HERITAGE);
// son un parámetro comercial configurable usado solo para convertir un monto
// de inversión en N° de unidades equivalentes. Ajustar según lista de precios vigente.
export const PRECIO_VENTA_REFERENCIA: Record<Tipologia, number> = {
  "1hab": 450_000_000,
  "2hab": 650_000_000,
};

// % de Ocupación por escenario. El Excel solo define un valor estable por escenario
// (sin curva de rampa por año); se mantiene constante en los 3 años.
export const OCUPACION: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 0.55, 2: 0.55, 3: 0.55 },
  conservador: { 1: 0.65, 2: 0.65, 3: 0.65 },
  optimista: { 1: 0.75, 2: 0.75, 3: 0.75 },
};

// ADR — tarifa promedio diaria por tipología (COP). Año 1 = base del Excel;
// Años 2-3 = Año 1 compuesto a 5% anual (CRECIMIENTO_ADR_ANUAL).
export const ADR: Record<Escenario, Record<Tipologia, Record<Anio, number>>> = {
  pesimista: {
    "1hab": { 1: 550_000, 2: 577_500, 3: 606_375 },
    "2hab": { 1: 690_000, 2: 724_500, 3: 760_725 },
  },
  conservador: {
    "1hab": { 1: 605_000, 2: 635_250, 3: 667_013 },
    "2hab": { 1: 775_000, 2: 813_750, 3: 854_438 },
  },
  optimista: {
    "1hab": { 1: 680_000, 2: 714_000, 3: 749_700 },
    "2hab": { 1: 840_000, 2: 882_000, 3: 926_100 },
  },
};

// Ingresos totales proyectados (COP) — fuente de verdad, edificio completo (108 unidades)
export const INGRESOS_TOTALES: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 13_803_570_000, 2: 14_493_748_500, 3: 15_218_435_925 },
  conservador: { 1: 17_765_280_000, 2: 18_653_544_000, 3: 19_586_221_200 },
  optimista: { 1: 22_272_300_000, 2: 23_385_915_000, 3: 24_555_210_750 },
};

// Gastos totales proyectados (COP) — costo de ventas + gastos de operación, edificio completo
export const GASTOS_TOTALES: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 5_275_864_490, 2: 5_539_657_715, 3: 5_816_640_600 },
  conservador: { 1: 6_692_234_960, 2: 7_026_846_708, 3: 7_378_189_043 },
  optimista: { 1: 8_303_281_100, 2: 8_718_445_155, 3: 9_154_367_413 },
};

// Utilidad Neta (después de impuesto de renta 35%) (COP), edificio completo
export const UTILIDAD_NETA: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 5_543_008_582, 2: 5_820_159_011, 3: 6_111_166_961 },
  conservador: { 1: 7_197_479_276, 2: 7_557_353_240, 3: 7_935_220_902 },
  optimista: { 1: 9_079_862_285, 2: 9_533_855_399, 3: 10_010_548_169 },
};

// Margen Neto (%) — se mantiene prácticamente constante entre años porque ingresos y
// gastos crecen a la misma tasa (5%/año) en este modelo.
export const MARGEN_NETO: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 0.4016, 2: 0.4016, 3: 0.4016 },
  conservador: { 1: 0.4051, 2: 0.4051, 3: 0.4051 },
  optimista: { 1: 0.4077, 2: 0.4077, 3: 0.4077 },
};

// Lavandería y Aseo — POR APARTAMENTO, $80.000/mes a 100% de ocupación para 1 hab; 2 hab =
// 1 hab × 1.05. Ya NO varían por escenario mediante un recargo fijo (%); en vivo se escalan
// por el % de ocupación del escenario/año, igual patrón que Energía/Agua/Gas: base
// mensual[tipología] × % ocupación actual × 12 × N apartamentos, con inflación de costos por
// año. Ej.: 1 hab en escenario Pesimista (55% ocupación) → $80.000 × 0.55 = $44.000/mes,
// $528.000/año (Año 1); 2 hab → $44.000 × 1.05 = $46.200/mes, $554.400/año.
export const LAVANDERIA_BASE_MENSUAL: Record<Tipologia, number> = {
  "1hab": 80_000,
  "2hab": 80_000 * 1.05,
};
export const ASEO_BASE_MENSUAL: Record<Tipologia, number> = {
  "1hab": 80_000,
  "2hab": 80_000 * 1.05,
};

// Amenities y Consumibles de Huésped — POR APARTAMENTO, misma fórmula que Aseo/Lavandería:
// $60.000/mes a 100% de ocupación para 1 hab; 2 hab = 1 hab × 1.05. Escala por % de
// ocupación del escenario/año, igual patrón que Energía/Agua/Gas/Aseo/Lavandería: base
// mensual[tipología] × % ocupación actual × 12 × N apartamentos, con inflación de costos por
// año.
export const AMENITIES_BASE_MENSUAL: Record<Tipologia, number> = {
  "1hab": 60_000,
  "2hab": 60_000 * 1.05,
};

// Reposición de Blancos y Lencería — POR APARTAMENTO, misma fórmula que Aseo/Lavandería:
// $50.000/mes a 100% de ocupación para 1 hab; 2 hab = 1 hab × 1.05. Escala por % de
// ocupación del escenario/año, igual patrón que Energía/Agua/Gas/Aseo/Lavandería/Amenities:
// base mensual[tipología] × % ocupación actual × 12 × N apartamentos, con inflación de
// costos por año.
export const BLANCOS_LENCERIA_BASE_MENSUAL: Record<Tipologia, number> = {
  "1hab": 50_000,
  "2hab": 50_000 * 1.05,
};

// Dotación, Uniformes y Capacitación — POR APARTAMENTO, misma fórmula que Aseo/Lavandería:
// $25.000/mes a 100% de ocupación para 1 hab; 2 hab = 1 hab × 1.05. Escala por % de
// ocupación del escenario/año, igual patrón que Energía/Agua/Gas/Aseo/Lavandería/Amenities/
// Blancos y Lencería: base mensual[tipología] × % ocupación actual × 12 × N apartamentos,
// con inflación de costos por año.
export const DOTACION_UNIFORMES_BASE_MENSUAL: Record<Tipologia, number> = {
  "1hab": 25_000,
  "2hab": 25_000 * 1.05,
};

// Seguros (Todo Riesgo Contenido + RC Hotelera) — POR APARTAMENTO, misma fórmula que
// Aseo/Lavandería: $45.000/mes a 100% de ocupación para 1 hab; 2 hab = 1 hab × 1.05. Escala
// por % de ocupación del escenario/año, igual patrón que Energía/Agua/Gas/Aseo/Lavandería/
// Amenities/Blancos y Lencería/Dotación: base mensual[tipología] × % ocupación actual × 12 ×
// N apartamentos, con inflación de costos por año.
export const SEGUROS_BASE_MENSUAL: Record<Tipologia, number> = {
  "1hab": 45_000,
  "2hab": 45_000 * 1.05,
};

// Sayco y Acimpro — POR APARTAMENTO (1 y 2 habitaciones usan la misma base), Año 1 de cada
// escenario. Conservador = Pesimista + 5%; Optimista = Conservador + 5%. Dentro de un mismo
// escenario, Años 2-3 se escalan igual que el resto de partidas por apartamento (inflación
// 5%/año, INFLACION_COSTOS_ANUAL).
export const SAYCO_BASE_MENSUAL: Record<Escenario, number> = {
  pesimista: 15_000,
  conservador: 15_000 * 1.05,
  optimista: 15_000 * 1.05 * 1.05,
};

// ICA (Impuesto de Industria y Comercio) — % sobre ventas (0.7% de los ingresos, tanto
// mensual como anual), no un monto fijo por apartamento. Fija en código, no editable vía
// AdvancedParams.
export const ICA_PCT = 0.007;

// PMS y Chanel Manager — POR APARTAMENTO (1 y 2 habitaciones usan la misma base), Año 1 de
// cada escenario. Conservador = Pesimista + 5%; Optimista = Conservador + 5%. Dentro de un
// mismo escenario, Años 2-3 se escalan igual que el resto de partidas por apartamento
// (inflación 5%/año, INFLACION_COSTOS_ANUAL).
export const PMS_CHANEL_MANAGER_BASE_MENSUAL: Record<Escenario, number> = {
  pesimista: 33_333,
  conservador: 33_333 * 1.05,
  optimista: 33_333 * 1.05 * 1.05,
};

// Otros Gastos Operativos (Anexo 3) - prorrateo x unidad — POR APARTAMENTO (1 y 2
// habitaciones usan la misma base), valor FIJO de $62.037/mes, ya NO varía por escenario.
// Dentro de un mismo escenario, Años 2-3 se siguen escalando igual que el resto de partidas
// por apartamento (inflación 5%/año, INFLACION_COSTOS_ANUAL).
export const OTROS_GASTOS_OPERATIVOS_BASE_MENSUAL = 62_037;

// Servicios públicos — Energía, Agua, Gas e Internet (COP) SON POR APARTAMENTO, no un total
// fijo del edificio: cada unidad tiene su propio consumo/línea. El gasto se calcula EN VIVO
// como `base mensual × % ocupación actual × 12 × N apartamentos` (Internet no depende de la
// ocupación, solo de N apartamentos), escalado por inflación de costos (5%/año) según el año.
// Por eso reaccionan tanto al % de ocupación editado como al N° de unidades simuladas.
export const ENERGIA_BASE_MENSUAL = 1_000_000;
export const AGUA_BASE_MENSUAL = 450_000;
export const GAS_BASE_MENSUAL = 250_000;
export const INTERNET_BASE_MENSUAL = 80_000;

// Papelería y Honorarios Firma Contable y Revisoría Fiscal también son fijos POR APARTAMENTO
// (no se reparten desde un total del edificio), igual patrón que Comisión Fee, pero a
// diferencia de esta no varían por tipología: usan la misma base para 1 y 2 hab.
export const PAPELERIA_BASE_MENSUAL = 30_000;
export const HONORARIOS_CONTABLES_BASE_MENSUAL = 70_000;

// Utilidad Neta por unidad — Año 3 (maduración), tal como reporta el modelo
export const UTILIDAD_POR_UNIDAD_ANIO3: Record<Escenario, Record<Tipologia, number>> = {
  pesimista: { "1hab": 51_548_529, "2hab": 66_657_580 },
  conservador: { "1hab": 65_702_951, "2hab": 89_016_901 },
  optimista: { "1hab": 83_667_315, "2hab": 110_736_152 },
};

// Fondo FARA — Rendimiento acumulado por propietario (COP, base promedio por unidad del
// edificio), 5 años, 9% E.A. Tabla fija tomada del Excel fuente, construida con una
// contribución anual de 2% de ventas; año 4-5 usan la contribución del Año 3 (maduración)
// mientras el fondo sigue rindiendo 9% E.A. NOTA: esta tabla NO se recalcula a partir de
// FARA_PCT (ese % solo controla la línea de gasto Fondo FARA en el P&G) — desde que
// FARA_PCT bajó a 1.5% quedó desalineada del 2% con el que se construyó esta tabla; si se
// necesita consistencia habría que regenerarla con el nuevo %.
export type AnioFara = 1 | 2 | 3 | 4 | 5;
export const FARA_ACUMULADO_POR_PROPIETARIO: Record<Escenario, Record<AnioFara, number>> = {
  pesimista: { 1: 2_556_217, 2: 5_470_304, 3: 8_780_860, 4: 12_389_366, 5: 16_322_638 },
  conservador: { 1: 3_289_867, 2: 7_040_315, 3: 11_301_021, 4: 15_945_191, 5: 21_007_336 },
  optimista: { 1: 4_124_500, 2: 8_826_430, 3: 14_168_070, 4: 19_990_457, 5: 26_336_860 },
};

// ANEXO 1 — Detalle de nómina (costo mensual, Año 1 base). Fuente: hoja HERITAGE, filas 69-88.
// Es un anexo de referencia dividido en dos grupos:
// - ANEXO_NOMINA_SMART_STAY: equipo cubierto por la comisión variable y el fee base de Smart
//   Stay. Su subtotal ($57.500.000, 14 personas) es informativo — NO se carga al pool ni se
//   suma al P&G principal.
// - ANEXO_NOMINA: nómina propia del edificio que SÍ se carga al pool. Su total
//   ($54.100.000, 15 personas) es la fuente de NOMINA_PRESTACIONAL_TOTAL_MENSUAL más arriba
//   (fijo por apartamento en el P&G).
// costoMensual = cantidad × salarioMensual (salario + prestaciones) en ambos grupos.
export interface AnexoNominaRow {
  cargo: string;
  cantidad: number;
  salarioMensual: number;
  costoMensual: number;
}

export const ANEXO_NOMINA_SMART_STAY: AnexoNominaRow[] = [
  { cargo: "Revenue Manager (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 6_500_000, costoMensual: 13_000_000 },
  { cargo: "Operadora de Reservas (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 2_800_000, costoMensual: 5_600_000 },
  { cargo: "Equipo Comercial (incluido en fee Smart Stay)", cantidad: 3, salarioMensual: 3_500_000, costoMensual: 10_500_000 },
  { cargo: "Operación Diaria de canales (incluido en fee Smart Stay)", cantidad: 1, salarioMensual: 3_200_000, costoMensual: 3_200_000 },
  { cargo: "Contac Center y Atención al cliente Huéspedes y Propietarios (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 2_600_000, costoMensual: 5_200_000 },
  { cargo: "Desarrolladores e Innovación (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 7_000_000, costoMensual: 14_000_000 },
  { cargo: "Participación en ferias (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 3_000_000, costoMensual: 6_000_000 },
];

export const ANEXO_NOMINA_SMART_STAY_TOTAL_CANTIDAD = 14;
export const ANEXO_NOMINA_SMART_STAY_TOTAL_MENSUAL = 57_500_000;

export const ANEXO_NOMINA: AnexoNominaRow[] = [
  { cargo: "Administrador", cantidad: 1, salarioMensual: 5_100_000, costoMensual: 5_100_000 },
  { cargo: "Recepcionistas (Gastos Compartidos)", cantidad: 2, salarioMensual: 3_500_000, costoMensual: 7_000_000 },
  { cargo: "Auditor Nocturno", cantidad: 2, salarioMensual: 4_000_000, costoMensual: 8_000_000 },
  { cargo: "Camareras", cantidad: 2, salarioMensual: 3_400_000, costoMensual: 6_800_000 },
  { cargo: "Practicante apoyo de camarería", cantidad: 1, salarioMensual: 3_000_000, costoMensual: 3_000_000 },
  { cargo: "Supervisora y Ama de llaves", cantidad: 1, salarioMensual: 3_700_000, costoMensual: 3_700_000 },
  { cargo: "Jefe Mantenimiento de Apartamentos", cantidad: 1, salarioMensual: 4_300_000, costoMensual: 4_300_000 },
  { cargo: "Ayudante de Mantenimiento de Apartamentos", cantidad: 1, salarioMensual: 3_400_000, costoMensual: 3_400_000 },
  { cargo: "Concierge", cantidad: 2, salarioMensual: 3_800_000, costoMensual: 7_600_000 },
  { cargo: "Contador (Gastos Compartidos)", cantidad: 1, salarioMensual: 2_300_000, costoMensual: 2_300_000 },
  { cargo: "Revisor Fiscal (Gastos Compartidos)", cantidad: 1, salarioMensual: 2_900_000, costoMensual: 2_900_000 },
];

export const ANEXO_NOMINA_TOTAL_CANTIDAD = 15;
export const ANEXO_NOMINA_TOTAL_MENSUAL = 54_100_000;

// ANEXO 3 — Otros gastos operativos (costo mensual). Fuente: hoja HERITAGE, filas 89-100.
export interface AnexoOtrosGastosRow {
  concepto: string;
  valorMensual: number;
}

export const ANEXO_OTROS_GASTOS: AnexoOtrosGastosRow[] = [
  { concepto: "Gastos médicos (exámenes ocupacionales)", valorMensual: 900_000 },
  { concepto: "Servicios de ambulancia", valorMensual: 400_000 },
  { concepto: "Licencias", valorMensual: 1_500_000 },
  { concepto: "Autocord", valorMensual: 1_500_000 },
  { concepto: "Agremiación (ASOTELCA / gremio)", valorMensual: 400_000 },
  { concepto: "Costos por datáfonos", valorMensual: 2_000_000 },
];

export const ANEXO_OTROS_GASTOS_TOTAL_MENSUAL = 6_700_000;

export const DISCLAIMER =
  "Cifras basadas en proyecciones financieras del modelo operativo de Smart Stay. No constituyen garantía de rentabilidad. Rentabilidades pasadas o proyectadas no aseguran resultados futuros.";

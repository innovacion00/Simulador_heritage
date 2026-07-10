// Fuente de verdad: modelo financiero real, hoja "HERITAGE".
// Todas las cifras en COP. No inventar ni alterar estos valores.

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
export const DIAS_EFECTIVOS = 350;
export const CRECIMIENTO_ADR_ANUAL = 0.05;
export const INFLACION_COSTOS_ANUAL = 0.05;
export const FACTOR_PRESTACIONAL = 1.45;
export const IMPUESTO_RENTA = 0.35;
export const COMISION_OTA = 0.18;
export const FEE_VARIABLE_SMART_STAY = 0.12;
export const FEE_BASE_1HAB = 400_000;
export const FEE_BASE_2HAB = 460_000;
export const MARKETING_PCT = 0.01;
export const FARA_PCT = 0.03;
export const FARA_TASA_EA = 0.09;

// Tasa de cambio de referencia COP/USD, editable en el simulador (solo afecta visualización).
export const TASA_CAMBIO_REFERENCIA = 4050;

export interface AdvancedParams {
  otaPct: number;
  faraPct: number;
  smartStayFeePct: number;
  impuestoPct: number;
}

// Valores base del modelo (sección 3 del prompt maestro). Editables en "Parámetros avanzados".
export const ADVANCED_PARAMS_DEFAULT: AdvancedParams = {
  otaPct: COMISION_OTA,
  faraPct: FARA_PCT,
  smartStayFeePct: FEE_VARIABLE_SMART_STAY,
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

// % de Ocupación por escenario y año
export const OCUPACION: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 0.35, 2: 0.4, 3: 0.45 },
  conservador: { 1: 0.5, 2: 0.55, 3: 0.6 },
  optimista: { 1: 0.65, 2: 0.7, 3: 0.75 },
};

// ADR — tarifa promedio diaria por tipología (COP)
export const ADR: Record<Escenario, Record<Tipologia, Record<Anio, number>>> = {
  pesimista: {
    "1hab": { 1: 480_000, 2: 504_000, 3: 529_200 },
    "2hab": { 1: 550_000, 2: 577_500, 3: 606_375 },
  },
  conservador: {
    "1hab": { 1: 528_000, 2: 554_400, 3: 582_120 },
    "2hab": { 1: 605_000, 2: 635_250, 3: 667_012.5 },
  },
  optimista: {
    "1hab": { 1: 633_600, 2: 665_280, 3: 698_544 },
    "2hab": { 1: 726_000, 2: 762_300, 3: 800_415 },
  },
};

// Ingresos totales proyectados (COP) — fuente de verdad
export const INGRESOS_TOTALES: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 6_659_100_000, 2: 7_990_920_000, 3: 9_439_274_250 },
  conservador: { 1: 10_464_300_000, 2: 12_086_266_500, 3: 13_844_268_900 },
  optimista: { 1: 16_324_308_000, 2: 18_459_025_200, 3: 20_766_403_350 },
};

// Gastos totales proyectados (COP) — fuente de verdad
export const GASTOS_TOTALES: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 6_518_988_000, 2: 7_184_551_500, 3: 7_900_373_880 },
  conservador: { 1: 7_812_756_000, 2: 8_576_969_310, 3: 9_398_072_061 },
  optimista: { 1: 9_805_158_720, 2: 10_743_707_268, 3: 11_751_597_774 },
};

// Utilidad Neta (después de impuesto de renta 35%) (COP) — fuente de verdad
export const UTILIDAD_NETA: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 91_072_800, 2: 524_139_525, 3: 1_000_285_240 },
  conservador: { 1: 1_723_503_600, 2: 2_281_043_173, 3: 2_890_027_945 },
  optimista: { 1: 4_237_447_032, 2: 5_014_956_656, 3: 5_859_623_624 },
};

// Margen Neto (%) — fuente de verdad
export const MARGEN_NETO: Record<Escenario, Record<Anio, number>> = {
  pesimista: { 1: 0.0137, 2: 0.0656, 3: 0.106 },
  conservador: { 1: 0.1647, 2: 0.1887, 3: 0.2088 },
  optimista: { 1: 0.2596, 2: 0.2717, 3: 0.2822 },
};

// Gastos operativos fijos (COP) — filas de la hoja HERITAGE que componen "TOTAL GASTOS"
// junto con Comisión OTA, Fondo FARA, Marketing y Comisión Smart Stay (estas últimas 4 son
// % de ventas y varían por escenario, ver ADVANCED_PARAMS_DEFAULT / MARKETING_PCT).
// Estas partidas NO varían por escenario, solo por año (inflación de costos 5%/año).
export const GASTOS_FIJOS_ANUAL = {
  nomina: { 1: 1_202_340_000, 2: 1_262_457_000, 3: 1_325_579_850 },
  bolsaEmpleo: { 1: 120_234_000, 2: 126_245_700, 3: 132_557_985 },
  serviciosPublicos: { 1: 492_000_000, 2: 516_600_000, 3: 542_430_000 },
  tecnologia: { 1: 72_000_000, 2: 75_600_000, 3: 79_380_000 },
  operacionSuministros: { 1: 396_000_000, 2: 415_800_000, 3: 436_590_000 },
  domotica: { 1: 0, 2: 0, 3: 0 },
  cuotaAdministracion: { 1: 648_000_000, 2: 680_400_000, 3: 714_420_000 },
  seguroResponsabilidadCivil: { 1: 36_000_000, 2: 37_800_000, 3: 39_690_000 },
  honorariosContables: { 1: 84_000_000, 2: 88_200_000, 3: 92_610_000 },
  revisoriaFiscal: { 1: 36_000_000, 2: 37_800_000, 3: 39_690_000 },
  otrosGastosOperativos: { 1: 384_000_000, 2: 403_200_000, 3: 423_360_000 },
  segurosYLicencias: { 1: 240_000_000, 2: 252_000_000, 3: 264_600_000 },
  feeBase: { 1: 544_320_000, 2: 571_536_000, 3: 600_112_800 },
} as const satisfies Record<string, Record<Anio, number>>;

// Utilidad Neta por unidad — Año 3 (maduración), tal como reporta el modelo
export const UTILIDAD_POR_UNIDAD_ANIO3: Record<Escenario, Record<Tipologia, number>> = {
  pesimista: { "1hab": 8_832_541, "2hab": 10_120_620 },
  conservador: { "1hab": 25_519_011, "2hab": 29_240_533 },
  optimista: { "1hab": 51_740_606, "2hab": 59_286_111 },
};

// Fondo FARA — Rendimiento acumulado por propietario (COP), 5 años, 9% E.A.
export type AnioFara = 1 | 2 | 3 | 4 | 5;
export const FARA_ACUMULADO_POR_PROPIETARIO: Record<Escenario, Record<AnioFara, number>> = {
  pesimista: { 1: 1_932_989, 2: 4_426_544, 3: 7_564_945, 4: 11_205_002, 5: 15_409_402 },
  conservador: { 1: 3_037_554, 2: 6_819_308, 3: 11_451_730, 4: 16_822_563, 5: 23_023_987 },
  optimista: { 1: 4_738_584, 2: 10_523_301, 3: 17_498_424, 4: 25_583_549, 5: 34_917_158 },
};

// ANEXO 1 — Detalle de nómina (costo mensual, Año 1 base). Fuente: hoja HERITAGE, filas 74-96.
// Los cargos marcados "incluido en fee Smart Stay" están cubiertos por la Comisión Smart Stay
// (variable) y el Fee base, por eso su costo mensual directo es 0 en este anexo.
export interface AnexoNominaRow {
  cargo: string;
  cantidad: number;
  salarioMensual: number;
  costoMensual: number;
}

export const ANEXO_NOMINA: AnexoNominaRow[] = [
  { cargo: "Revenue Manager (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 3_000_000, costoMensual: 0 },
  { cargo: "Operadora de Reservas (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 3_000_000, costoMensual: 0 },
  { cargo: "Equipo Comercial (incluido en fee Smart Stay)", cantidad: 4, salarioMensual: 2_500_000, costoMensual: 0 },
  { cargo: "Operación Diaria de canales (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 2_000_000, costoMensual: 0 },
  { cargo: "Contac Center y Atención al cliente (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 2_000_000, costoMensual: 0 },
  { cargo: "Desarrolladores e Innovación (incluido en fee Smart Stay)", cantidad: 2, salarioMensual: 2_000_000, costoMensual: 0 },
  { cargo: "Gerente General", cantidad: 1, salarioMensual: 4_800_000, costoMensual: 6_960_000 },
  { cargo: "Administrador", cantidad: 1, salarioMensual: 3_500_000, costoMensual: 5_075_000 },
  { cargo: "Recepcionistas", cantidad: 4, salarioMensual: 2_200_000, costoMensual: 12_760_000 },
  { cargo: "Auditor Nocturno", cantidad: 1, salarioMensual: 2_200_000, costoMensual: 3_190_000 },
  { cargo: "Botones", cantidad: 4, salarioMensual: 2_000_000, costoMensual: 11_600_000 },
  { cargo: "Camareras", cantidad: 6, salarioMensual: 2_000_000, costoMensual: 17_400_000 },
  { cargo: "Mantenimiento", cantidad: 2, salarioMensual: 2_000_000, costoMensual: 5_800_000 },
  { cargo: "Ama de Llaves", cantidad: 1, salarioMensual: 2_000_000, costoMensual: 2_900_000 },
  { cargo: "Supervisora", cantidad: 2, salarioMensual: 2_000_000, costoMensual: 5_800_000 },
  { cargo: "Coordinadora de Calidad", cantidad: 1, salarioMensual: 2_900_000, costoMensual: 4_205_000 },
  { cargo: "Coordinador SST (SG-SST)", cantidad: 1, salarioMensual: 2_900_000, costoMensual: 4_205_000 },
  { cargo: "Salvavidas - Club de Playa", cantidad: 2, salarioMensual: 2_500_000, costoMensual: 7_250_000 },
  { cargo: "Personal de Playa - Servicios de atención", cantidad: 2, salarioMensual: 2_500_000, costoMensual: 7_250_000 },
  { cargo: "Concierge", cantidad: 2, salarioMensual: 2_000_000, costoMensual: 5_800_000 },
];

export const ANEXO_NOMINA_TOTAL_CANTIDAD = 44;
export const ANEXO_NOMINA_TOTAL_MENSUAL = 100_195_000;

// ANEXO 3 — Otros gastos operativos (costo mensual). Fuente: hoja HERITAGE, filas 114-130.
export interface AnexoOtrosGastosRow {
  concepto: string;
  valorMensual: number;
}

export const ANEXO_OTROS_GASTOS: AnexoOtrosGastosRow[] = [
  { concepto: "Flores y decoración", valorMensual: 1_500_000 },
  { concepto: "Servicios de minibar", valorMensual: 2_000_000 },
  { concepto: "Gastos médicos (exámenes ocupacionales)", valorMensual: 800_000 },
  { concepto: "Bonificaciones", valorMensual: 2_000_000 },
  { concepto: "Servicios de ambulancia", valorMensual: 800_000 },
  { concepto: "Alimentación de empleados", valorMensual: 3_000_000 },
  { concepto: "Licencias", valorMensual: 1_500_000 },
  { concepto: "Autocord", valorMensual: 500_000 },
  { concepto: "Agremiación (ASOTELCA / gremio)", valorMensual: 600_000 },
  { concepto: "Costos por datáfonos", valorMensual: 2_000_000 },
  { concepto: "Servicios musicales (música ambiental)", valorMensual: 700_000 },
  { concepto: "Otros", valorMensual: 1_000_000 },
  { concepto: "Lancha Deportiva (12 Viajes Diarios)", valorMensual: 15_000_000 },
  { concepto: "Ambientadores", valorMensual: 600_000 },
];

export const ANEXO_OTROS_GASTOS_TOTAL_MENSUAL = 32_000_000;

export const DISCLAIMER =
  "Cifras basadas en proyecciones financieras del modelo operativo de Smart Stay. No constituyen garantía de rentabilidad. Rentabilidades pasadas o proyectadas no aseguran resultados futuros.";

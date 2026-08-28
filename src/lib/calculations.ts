import {
  ADR,
  ADVANCED_PARAMS_DEFAULT,
  AdvancedParams,
  AGUA_BASE_MENSUAL,
  AMENITIES_BASE_MENSUAL,
  Anio,
  ASEO_BASE_MENSUAL,
  AnioFara,
  BLANCOS_LENCERIA_BASE_MENSUAL,
  BOLSA_EMPLEO_BASE_MENSUAL,
  COMISION_PASARELA_PAGOS_PCT,
  DIAS_BASE,
  DOTACION_UNIFORMES_BASE_MENSUAL,
  ENERGIA_BASE_MENSUAL,
  Escenario,
  FARA_ACUMULADO_POR_PROPIETARIO,
  FEE_ADMINISTRACION_MENSUAL,
  GAS_BASE_MENSUAL,
  HONORARIOS_CONTABLES_BASE_MENSUAL,
  ICA_PCT,
  INFLACION_COSTOS_ANUAL,
  INTERNET_BASE_MENSUAL,
  LAVANDERIA_BASE_MENSUAL,
  MARKETING_PCT,
  NOMINA_PRESTACIONAL_BASE_MENSUAL,
  OCUPACION,
  OTROS_GASTOS_OPERATIVOS_BASE_MENSUAL,
  PAPELERIA_BASE_MENSUAL,
  PMS_CHANEL_MANAGER_BASE_MENSUAL,
  PRECIO_VENTA_REFERENCIA,
  SAYCO_BASE_MENSUAL,
  SEGUROS_BASE_MENSUAL,
  TIPOLOGIAS,
  Tipologia,
  UNIDADES_TOTALES,
} from "./data";

export type TipologiaSeleccion = Tipologia | "mixto";
export type Moneda = "COP" | "USD";

export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatMoney(value: number, moneda: Moneda, tasaCambio: number): string {
  return moneda === "USD" ? formatUSD(value / tasaCambio) : formatCOP(value);
}

/** Formato compacto para ejes de gráficas (ej. $100M, $2.5K). */
export function formatCompact(value: number, moneda: Moneda, tasaCambio: number): string {
  const v = moneda === "USD" ? value / tasaCambio : value;
  const symbol = moneda === "USD" ? "$" : "$";
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${symbol}${(v / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${symbol}${(v / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000) return `${symbol}${(v / 1_000).toFixed(0)}K`;
  return `${symbol}${v.toFixed(0)}`;
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

function unidadesDe(tipologia: Tipologia): number {
  return TIPOLOGIAS.find((t) => t.id === tipologia)!.unidades;
}

/** Ocupación oficial (fuente de verdad) para un escenario/año. */
export function ocupacionBase(escenario: Escenario, anio: Anio): number {
  return OCUPACION[escenario][anio];
}

/** Ingresos_tipología(año) = N unidades × ADR(año,escenario) × Días base de la tipología × %Ocupación(año,escenario) */
export function ingresoTipologia(
  escenario: Escenario,
  tipologia: Tipologia,
  anio: Anio,
  diasEfectivos: number = DIAS_BASE[tipologia],
  ocupacion: number = OCUPACION[escenario][anio],
  adr: number = ADR[escenario][tipologia][anio]
): number {
  const unidades = unidadesDe(tipologia);
  return unidades * adr * diasEfectivos * ocupacion;
}

/** Ingresos_totales(año) = Ingresos_1Hab(año) + Ingresos_2Hab(año) */
export function ingresoTotalCalculado(
  escenario: Escenario,
  anio: Anio,
  diasEfectivos?: number,
  ocupacion: number = OCUPACION[escenario][anio]
): number {
  return (
    ingresoTipologia(escenario, "1hab", anio, diasEfectivos ?? DIAS_BASE["1hab"], ocupacion) +
    ingresoTipologia(escenario, "2hab", anio, diasEfectivos ?? DIAS_BASE["2hab"], ocupacion)
  );
}

/** Reparte N° de unidades "mixto" respetando la proporción real del edificio (72:36 = 2:1). */
export function splitMixto(nUnidades: number): Record<Tipologia, number> {
  const proporcion1hab = 72 / UNIDADES_TOTALES;
  const n1hab = Math.round(nUnidades * proporcion1hab);
  const n2hab = Math.max(nUnidades - n1hab, 0);
  return { "1hab": n1hab, "2hab": n2hab };
}

/** Precio de venta de referencia, ponderado por composición real del edificio si la selección es "mixto". */
export function precioReferencia(tipologia: TipologiaSeleccion): number {
  if (tipologia !== "mixto") return PRECIO_VENTA_REFERENCIA[tipologia];
  const proporcion1hab = 72 / UNIDADES_TOTALES;
  const proporcion2hab = 36 / UNIDADES_TOTALES;
  return (
    PRECIO_VENTA_REFERENCIA["1hab"] * proporcion1hab + PRECIO_VENTA_REFERENCIA["2hab"] * proporcion2hab
  );
}

/**
 * ADR aplicado para mostrar en pantalla; para "mixto" se pondera por composición del edificio.
 * `adrOverride` permite sustituir el ADR fuente de verdad por un valor editado por el usuario
 * (por tipología), tal como ya ocurre con la ocupación.
 */
export function adrAplicado(
  escenario: Escenario,
  tipologia: TipologiaSeleccion,
  anio: Anio,
  adrOverride?: Partial<Record<Tipologia, number>>
): number {
  if (tipologia !== "mixto") return adrOverride?.[tipologia] ?? ADR[escenario][tipologia][anio];
  const proporcion1hab = 72 / UNIDADES_TOTALES;
  const proporcion2hab = 36 / UNIDADES_TOTALES;
  const adr1 = adrOverride?.["1hab"] ?? ADR[escenario]["1hab"][anio];
  const adr2 = adrOverride?.["2hab"] ?? ADR[escenario]["2hab"][anio];
  return adr1 * proporcion1hab + adr2 * proporcion2hab;
}

/** Rendimiento acumulado del Fondo FARA para el inversionista (escala por N° de unidades). Ajeno a los parámetros avanzados: es un ingreso, no un costo. */
export function faraAcumuladoInversionista(escenario: Escenario, anio: AnioFara, nUnidades: number): number {
  return FARA_ACUMULADO_POR_PROPIETARIO[escenario][anio] * nUnidades;
}

export interface DesglosePYG {
  ventas1Hab: number;
  ventas2Hab: number;
  ventasBrutas: number;
  comisionCanales: number;
  fondoFARA: number;
  totalCostoVentas: number;
  utilidadBruta: number;
  // Gastos operativos — costosOperacion ("Nómina Prestacional"), bolsaEmpleo y el resto de
  // partidas son fijas (fuente de verdad) POR APARTAMENTO (base mensual × 12 × N
  // apartamentos); bolsaEmpleo en particular es 10% de la base mensual de Nómina
  // Prestacional (ver BOLSA_EMPLEO_BASE_MENSUAL en data.ts), no un % de ventas. Energía/Agua/
  // Gas/Aseo/Lavandería varían por escenario porque se escalan por el % de ocupación de cada
  // uno ($80.000/mes a 100% ocupación para aseo/lavandería); Sayco y PMS varían por escenario
  // porque su base mensual cambia por escenario (ver SAYCO_BASE_MENSUAL, etc.); Otros Gastos
  // Operativos es un valor fijo de $62.037/mes que ya NO varía por escenario.
  costosOperacion: number;
  bolsaEmpleo: number;
  marketing: number;
  operadorComercialFee: number;
  feeAdministracion: number;
  energia: number;
  agua: number;
  gas: number;
  internet: number;
  papeleria: number;
  aseo: number;
  lavanderia: number;
  amenities: number;
  blancosLenceria: number;
  dotacionUniformes: number;
  seguros: number;
  comisionPasarelaPagos: number;
  honorariosContables: number;
  sayco: number;
  pmsChanelManager: number;
  otrosGastosOperativos: number;
  ica: number;
  totalGastosOperacion: number;
  utilidadOperacional: number;
  impuestoRenta: number;
  utilidadNeta: number;
}

/**
 * Desglose P&G escalado a la participación del inversionista, replicando fila por fila la
 * sección "GASTOS PROYECTADOS" de la hoja HERITAGE. Las ventas y las partidas que son % de
 * ventas (comisión canales, FARA, marketing, fee operador comercial) escalan por la cuota
 * del inversionista dentro de SU tipología (N° unidades / unidades de esa tipología).
 * Energía, agua, gas, internet, papelería, honorarios, fee administración, aseo, lavandería,
 * Sayco y Acimpro, PMS y Chanel Manager, Otros Gastos Operativos (Anexo 3), Nómina
 * Prestacional y Bolsa de Empleo son POR APARTAMENTO (base mensual × 12 × N apartamentos,
 * con inflación de costos por año) — Bolsa de Empleo en particular es 10% de la base mensual
 * de Nómina Prestacional, ya no un % de ventas; Sayco y PMS además varían por escenario
 * (Pesimista = valor base/mes, Conservador = Pesimista +X%, Optimista = Conservador +X%, ver
 * cada constante en data.ts para el % exacto); Otros Gastos Operativos es un valor fijo
 * ($62.037/mes) que ya NO varía por escenario; aseo y lavandería en cambio escalan por % de
 * ocupación igual que energía/agua/gas ($80.000/mes a 100% ocupación para 1 hab; 2 hab = 1
 * hab × 1.05, ver ASEO_BASE_MENSUAL/LAVANDERIA_BASE_MENSUAL), ya no por un recargo fijo de
 * escenario.
 * Comisión canales, Fondo FARA, Fee Operador comercial e Impuesto usan los % editables de
 * "parámetros avanzados"; el resto de partidas son fijas (fuente de verdad) y solo varían por
 * año (inflación) o por escenario (energía/agua/gas/aseo/lavandería según ocupación,
 * sayco/PMS según el valor base del escenario).
 */
export function calcularDesglose(params: {
  escenario: Escenario;
  tipologia: TipologiaSeleccion;
  anio: Anio;
  nUnidades: number;
  advancedParams?: AdvancedParams;
  diasEfectivos?: number;
  ocupacion?: number;
  adrOverride?: Partial<Record<Tipologia, number>>;
}): DesglosePYG {
  const { escenario, tipologia, anio, nUnidades } = params;
  const adv = params.advancedParams ?? ADVANCED_PARAMS_DEFAULT;
  const ocupacion = params.ocupacion ?? OCUPACION[escenario][anio];

  const tipologias: Tipologia[] = tipologia === "mixto" ? ["1hab", "2hab"] : [tipologia];
  const splits: Record<Tipologia, number> =
    tipologia === "mixto" ? splitMixto(nUnidades) : ({ [tipologia]: nUnidades } as Record<Tipologia, number>);

  let ventas1Hab = 0;
  let ventas2Hab = 0;
  let ventasBrutas = 0;
  let comisionCanales = 0;
  let fondoFARA = 0;
  let costosOperacion = 0;
  let bolsaEmpleo = 0;
  let marketing = 0;
  let operadorComercialFee = 0;
  let energia = 0;
  let agua = 0;
  let gas = 0;
  let internet = 0;
  let feeAdministracion = 0;
  let papeleria = 0;
  let honorariosContables = 0;
  let sayco = 0;
  let pmsChanelManager = 0;
  let otrosGastosOperativos = 0;
  let aseo = 0;
  let lavanderia = 0;
  let amenities = 0;
  let blancosLenceria = 0;
  let dotacionUniformes = 0;
  let seguros = 0;
  let comisionPasarelaPagos = 0;
  let ica = 0;

  // Energía/Agua/Gas/Aseo/Lavandería/Amenities/Internet/Comisión Fee/Papelería/Honorarios
  // Contables son POR APARTAMENTO (cada unidad tiene su propio consumo/línea/cuota), no un
  // total fijo del edificio: en vivo = base mensual (a 100% ocupación) × % ocupación actual ×
  // 12 × N apartamentos, con inflación de costos compuesta por año.
  // Energía/Agua/Gas/Aseo/Lavandería/Amenities dependen de la ocupación; el resto no.
  // Reaccionan tanto a la ocupación editada como al N° de unidades. Comisión Fee, Aseo,
  // Lavandería y Amenities además varían por tipología (ver
  // FEE_ADMINISTRACION_MENSUAL/ASEO_BASE_MENSUAL/LAVANDERIA_BASE_MENSUAL en data.ts — 2 hab =
  // 1 hab × 1.05), por eso se calculan dentro del loop por tipología en vez de una sola vez
  // aquí arriba.
  const inflacion = (1 + INFLACION_COSTOS_ANUAL) ** (anio - 1);
  const energiaPorApto = ENERGIA_BASE_MENSUAL * ocupacion * 12 * inflacion;
  const aguaPorApto = AGUA_BASE_MENSUAL * ocupacion * 12 * inflacion;
  const gasPorApto = GAS_BASE_MENSUAL * ocupacion * 12 * inflacion;
  const internetPorApto = INTERNET_BASE_MENSUAL * 12 * inflacion;
  const papeleriaPorApto = PAPELERIA_BASE_MENSUAL * 12 * inflacion;
  const honorariosContablesPorApto = HONORARIOS_CONTABLES_BASE_MENSUAL * 12 * inflacion;
  const saycoPorApto = SAYCO_BASE_MENSUAL[escenario] * 12 * inflacion;
  const pmsChanelManagerPorApto = PMS_CHANEL_MANAGER_BASE_MENSUAL[escenario] * 12 * inflacion;
  const otrosGastosOperativosPorApto = OTROS_GASTOS_OPERATIVOS_BASE_MENSUAL * 12 * inflacion;
  // Nómina Prestacional: igual patrón que Fee Administración (fijo por apartamento, no % de
  // ventas). Ver NOMINA_PRESTACIONAL_BASE_MENSUAL en data.ts para la fórmula fuente.
  const nominaPrestacionalPorApto = NOMINA_PRESTACIONAL_BASE_MENSUAL * 12 * inflacion;
  // Bolsa de Empleo: mismo patrón, fijo por apartamento = 10% de la base mensual de Nómina
  // Prestacional (ver BOLSA_EMPLEO_BASE_MENSUAL en data.ts), ya no % de ventas.
  const bolsaEmpleoPorApto = BOLSA_EMPLEO_BASE_MENSUAL * 12 * inflacion;

  for (const t of tipologias) {
    const unidadesT = unidadesDe(t);
    const nT = splits[t] ?? 0;
    const share = unidadesT > 0 ? nT / unidadesT : 0;
    const dias = params.diasEfectivos ?? DIAS_BASE[t];
    const adr = params.adrOverride?.[t];
    const ventasT = ingresoTipologia(escenario, t, anio, dias, ocupacion, adr) * share;
    const feeAdministracionPorApto = FEE_ADMINISTRACION_MENSUAL[t] * 12 * inflacion;
    const aseoPorApto = ASEO_BASE_MENSUAL[t] * ocupacion * 12 * inflacion;
    const lavanderiaPorApto = LAVANDERIA_BASE_MENSUAL[t] * ocupacion * 12 * inflacion;
    const amenitiesPorApto = AMENITIES_BASE_MENSUAL[t] * ocupacion * 12 * inflacion;
    const blancosLenceriaPorApto = BLANCOS_LENCERIA_BASE_MENSUAL[t] * ocupacion * 12 * inflacion;
    const dotacionUniformesPorApto = DOTACION_UNIFORMES_BASE_MENSUAL[t] * ocupacion * 12 * inflacion;
    const segurosPorApto = SEGUROS_BASE_MENSUAL[t] * ocupacion * 12 * inflacion;

    if (t === "1hab") ventas1Hab += ventasT;
    else ventas2Hab += ventasT;

    ventasBrutas += ventasT;
    comisionCanales += ventasT * adv.comisionCanalesPct;
    fondoFARA += ventasT * adv.faraPct;
    costosOperacion += nominaPrestacionalPorApto * nT;
    bolsaEmpleo += bolsaEmpleoPorApto * nT;
    marketing += ventasT * MARKETING_PCT;
    operadorComercialFee += ventasT * adv.operadorComercialFeePct;
    comisionPasarelaPagos += ventasT * COMISION_PASARELA_PAGOS_PCT;
    ica += ventasT * ICA_PCT;
    energia += energiaPorApto * nT;
    agua += aguaPorApto * nT;
    gas += gasPorApto * nT;
    internet += internetPorApto * nT;
    feeAdministracion += feeAdministracionPorApto * nT;
    papeleria += papeleriaPorApto * nT;
    honorariosContables += honorariosContablesPorApto * nT;
    sayco += saycoPorApto * nT;
    pmsChanelManager += pmsChanelManagerPorApto * nT;
    otrosGastosOperativos += otrosGastosOperativosPorApto * nT;
    aseo += aseoPorApto * nT;
    lavanderia += lavanderiaPorApto * nT;
    amenities += amenitiesPorApto * nT;
    blancosLenceria += blancosLenceriaPorApto * nT;
    dotacionUniformes += dotacionUniformesPorApto * nT;
    seguros += segurosPorApto * nT;
  }

  const totalCostoVentas = comisionCanales + fondoFARA;
  const utilidadBruta = ventasBrutas - totalCostoVentas;

  const totalGastosOperacion =
    costosOperacion +
    bolsaEmpleo +
    marketing +
    operadorComercialFee +
    comisionPasarelaPagos +
    energia +
    agua +
    gas +
    internet +
    feeAdministracion +
    papeleria +
    aseo +
    lavanderia +
    amenities +
    blancosLenceria +
    dotacionUniformes +
    seguros +
    honorariosContables +
    sayco +
    pmsChanelManager +
    otrosGastosOperativos +
    ica;

  const utilidadOperacional = utilidadBruta - totalGastosOperacion;
  const impuestoRenta = Math.max(utilidadOperacional, 0) * adv.impuestoPct;
  const utilidadNeta = utilidadOperacional - impuestoRenta;

  return {
    ventas1Hab,
    ventas2Hab,
    ventasBrutas,
    comisionCanales,
    fondoFARA,
    totalCostoVentas,
    utilidadBruta,
    costosOperacion,
    bolsaEmpleo,
    marketing,
    operadorComercialFee,
    comisionPasarelaPagos,
    feeAdministracion,
    energia,
    agua,
    gas,
    internet,
    papeleria,
    aseo,
    lavanderia,
    amenities,
    blancosLenceria,
    dotacionUniformes,
    seguros,
    honorariosContables,
    sayco,
    pmsChanelManager,
    otrosGastosOperativos,
    ica,
    totalGastosOperacion,
    utilidadOperacional,
    impuestoRenta,
    utilidadNeta,
  };
}

export interface ResultadoSimulacion {
  montoInvertido: number;
  desglose: DesglosePYG;
  faraAcumulado: number;
  utilidadTotalConFara: number;
  roiAnual: number;
  roiAcumulado: number;
  paybackAnios: number | null;
}

export function simular(params: {
  escenario: Escenario;
  tipologia: TipologiaSeleccion;
  anio: Anio;
  nUnidades: number;
  montoInvertido: number;
  incluirFara: boolean;
  advancedParams?: AdvancedParams;
  diasEfectivos?: number;
  ocupacion?: number;
  ocupacionAnio3?: number;
  adrOverride?: Partial<Record<Tipologia, number>>;
  adrOverrideAnio3?: Partial<Record<Tipologia, number>>;
}): ResultadoSimulacion {
  const {
    escenario,
    tipologia,
    anio,
    nUnidades,
    montoInvertido,
    incluirFara,
    advancedParams,
    diasEfectivos,
    ocupacion,
    ocupacionAnio3,
    adrOverride,
    adrOverrideAnio3,
  } = params;

  const desglose = calcularDesglose({
    escenario,
    tipologia,
    anio,
    nUnidades,
    advancedParams,
    diasEfectivos,
    ocupacion,
    adrOverride,
  });
  const fara = incluirFara ? faraAcumuladoInversionista(escenario, anio as AnioFara, nUnidades) : 0;
  const utilidadTotalConFara = desglose.utilidadNeta + fara;

  const roiAnual = montoInvertido > 0 ? desglose.utilidadNeta / montoInvertido : 0;
  const roiAcumulado = montoInvertido > 0 ? utilidadTotalConFara / montoInvertido : 0;

  const desgloseMaduracion = calcularDesglose({
    escenario,
    tipologia,
    anio: 3,
    nUnidades,
    advancedParams,
    diasEfectivos,
    ocupacion: ocupacionAnio3,
    adrOverride: adrOverrideAnio3,
  });
  const paybackAnios =
    desgloseMaduracion.utilidadNeta > 0 ? montoInvertido / desgloseMaduracion.utilidadNeta : null;

  return {
    montoInvertido,
    desglose,
    faraAcumulado: fara,
    utilidadTotalConFara,
    roiAnual,
    roiAcumulado,
    paybackAnios,
  };
}

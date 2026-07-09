import {
  ADR,
  ADVANCED_PARAMS_DEFAULT,
  AdvancedParams,
  Anio,
  AnioFara,
  DIAS_EFECTIVOS,
  Escenario,
  FARA_ACUMULADO_POR_PROPIETARIO,
  GASTOS_TOTALES,
  INGRESOS_TOTALES,
  OCUPACION,
  PRECIO_VENTA_REFERENCIA,
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

/** Ingresos_tipología(año) = N unidades × ADR(año,escenario) × Días efectivos × %Ocupación(año,escenario) */
export function ingresoTipologia(escenario: Escenario, tipologia: Tipologia, anio: Anio): number {
  const unidades = unidadesDe(tipologia);
  const adr = ADR[escenario][tipologia][anio];
  const ocupacion = OCUPACION[escenario][anio];
  return unidades * adr * DIAS_EFECTIVOS * ocupacion;
}

/** Ingresos_totales(año) = Ingresos_1Hab(año) + Ingresos_2Hab(año) */
export function ingresoTotalCalculado(escenario: Escenario, anio: Anio): number {
  return ingresoTipologia(escenario, "1hab", anio) + ingresoTipologia(escenario, "2hab", anio);
}

/** % participación pool = Ingresos_tipología(año) / Ingresos_totales(año) */
export function participacionPool(escenario: Escenario, tipologia: Tipologia, anio: Anio): number {
  return ingresoTipologia(escenario, tipologia, anio) / ingresoTotalCalculado(escenario, anio);
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

/** ADR aplicado para mostrar en pantalla; para "mixto" se pondera por composición del edificio. */
export function adrAplicado(escenario: Escenario, tipologia: TipologiaSeleccion, anio: Anio): number {
  if (tipologia !== "mixto") return ADR[escenario][tipologia][anio];
  const proporcion1hab = 72 / UNIDADES_TOTALES;
  const proporcion2hab = 36 / UNIDADES_TOTALES;
  return ADR[escenario]["1hab"][anio] * proporcion1hab + ADR[escenario]["2hab"][anio] * proporcion2hab;
}

/** Rendimiento acumulado del Fondo FARA para el inversionista (escala por N° de unidades). Ajeno a los parámetros avanzados: es un ingreso, no un costo. */
export function faraAcumuladoInversionista(escenario: Escenario, anio: AnioFara, nUnidades: number): number {
  return FARA_ACUMULADO_POR_PROPIETARIO[escenario][anio] * nUnidades;
}

/**
 * Bolsa de "otros gastos operativos" (nómina, servicios públicos, marketing, fee base,
 * administración, seguros, honorarios) — el residuo de Gastos_totales (fuente de verdad)
 * una vez descontados los componentes que sí son editables como % de ventas. Se mantiene
 * fijo aunque el usuario edite los parámetros avanzados, porque no varía con esos %.
 */
function otrosGastosResidualProyecto(escenario: Escenario, anio: Anio): number {
  const ingresos = INGRESOS_TOTALES[escenario][anio];
  const gastos = GASTOS_TOTALES[escenario][anio];
  const base = ADVANCED_PARAMS_DEFAULT;
  return gastos - ingresos * base.otaPct - ingresos * base.faraPct - ingresos * base.smartStayFeePct;
}

export interface DesglosePYG {
  ventasBrutas: number;
  comisionOTA: number;
  fondoFARA: number;
  totalCostoVentas: number;
  utilidadBruta: number;
  comisionSmartStay: number;
  otrosGastosOperativos: number;
  totalGastosOperacion: number;
  utilidadOperacional: number;
  impuestoRenta: number;
  utilidadNeta: number;
}

/**
 * Desglose P&G escalado a la participación del inversionista (N° de unidades sobre el total
 * de su tipología), usando los % editables de "parámetros avanzados". Con los valores por
 * defecto, el resultado coincide exactamente con la fuente de verdad (tablas de la hoja HERITAGE).
 */
export function calcularDesglose(params: {
  escenario: Escenario;
  tipologia: TipologiaSeleccion;
  anio: Anio;
  nUnidades: number;
  advancedParams?: AdvancedParams;
}): DesglosePYG {
  const { escenario, tipologia, anio, nUnidades } = params;
  const adv = params.advancedParams ?? ADVANCED_PARAMS_DEFAULT;

  const tipologias: Tipologia[] = tipologia === "mixto" ? ["1hab", "2hab"] : [tipologia];
  const splits: Record<Tipologia, number> =
    tipologia === "mixto" ? splitMixto(nUnidades) : ({ [tipologia]: nUnidades } as Record<Tipologia, number>);

  let ventasBrutas = 0;
  let comisionOTA = 0;
  let fondoFARA = 0;
  let comisionSmartStay = 0;
  let otrosGastosOperativos = 0;

  for (const t of tipologias) {
    const unidadesT = unidadesDe(t);
    const nT = splits[t] ?? 0;
    const share = unidadesT > 0 ? nT / unidadesT : 0;
    const ventasT = ingresoTipologia(escenario, t, anio) * share;
    const participT = participacionPool(escenario, t, anio);
    const otrosResidualT = otrosGastosResidualProyecto(escenario, anio) * participT * share;

    ventasBrutas += ventasT;
    comisionOTA += ventasT * adv.otaPct;
    fondoFARA += ventasT * adv.faraPct;
    comisionSmartStay += ventasT * adv.smartStayFeePct;
    otrosGastosOperativos += otrosResidualT;
  }

  const totalCostoVentas = comisionOTA + fondoFARA;
  const utilidadBruta = ventasBrutas - totalCostoVentas;
  const totalGastosOperacion = comisionSmartStay + otrosGastosOperativos;
  const utilidadOperacional = utilidadBruta - totalGastosOperacion;
  const impuestoRenta = utilidadOperacional * adv.impuestoPct;
  const utilidadNeta = utilidadOperacional - impuestoRenta;

  return {
    ventasBrutas,
    comisionOTA,
    fondoFARA,
    totalCostoVentas,
    utilidadBruta,
    comisionSmartStay,
    otrosGastosOperativos,
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
}): ResultadoSimulacion {
  const { escenario, tipologia, anio, nUnidades, montoInvertido, incluirFara, advancedParams } = params;

  const desglose = calcularDesglose({ escenario, tipologia, anio, nUnidades, advancedParams });
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

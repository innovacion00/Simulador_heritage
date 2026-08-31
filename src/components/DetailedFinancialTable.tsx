"use client";

import { useState } from "react";
import { DesglosePYG, Moneda, formatMoney, formatPct } from "@/lib/calculations";

interface LineItem {
  key: string;
  concepto: string;
  original: number;
  sign: 1 | -1;
  // false = esta partida es un monto fijo en pesos en el Excel (no tiene % asociado, ej.
  // Energía, Agua, Gas, Papelería...); la columna % no debe mostrar un "% de ventas"
  // calculado porque no corresponde a ningún dato del Excel. true/undefined = el Excel sí
  // define esta partida como % de ventas (Comisión canales, FARA, Marketing, etc.).
  hasExcelPct?: boolean;
}

interface RowState {
  enabled: boolean;
  pctOverride: number | null;
}

const DEFAULT_ROW_STATE: RowState = { enabled: true, pctOverride: null };

// Estas partidas arrancan desactivadas por defecto (el usuario las activa manualmente si
// quiere incluirlas en la simulación local de esta tabla): "Cuota de Administración del
// Edificio", que además arranca en $0.
const DISABLED_BY_DEFAULT_KEYS = new Set(["cuotaAdministracionEdificio"]);

/**
 * Réplica fila por fila de la sección de la hoja HERITAGE (Excel "Hertitage Nuevo.xlsx")
 * que va de "INGRESOS PROYECTADOS" (A24) a "UTILIDAD NETA" (A66). Las filas A19-A22
 * ("DETALLE - VARIABLES OPERATIVAS") se muestran aparte, en VariablesOperativasTable.
 */
export function DetailedFinancialTable({
  desglose,
  moneda,
  tasaCambio,
}: {
  desglose: DesglosePYG;
  moneda: Moneda;
  tasaCambio: number;
}) {
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  const pctBasis = desglose.ventasBrutas;

  const getState = (key: string): RowState =>
    rowStates[key] ?? { ...DEFAULT_ROW_STATE, enabled: !DISABLED_BY_DEFAULT_KEYS.has(key) };

  const setEnabled = (key: string, enabled: boolean) =>
    setRowStates((prev) => ({ ...prev, [key]: { ...getState(key), enabled } }));

  const setPctOverride = (key: string, pctOverride: number | null) =>
    setRowStates((prev) => ({ ...prev, [key]: { ...getState(key), pctOverride } }));

  const liveValue = (item: LineItem): number => {
    const st = getState(item.key);
    if (!st.enabled) return 0;
    if (st.pctOverride !== null) return pctBasis * st.pctOverride;
    return item.original;
  };

  // A25-A26: INGRESOS PROYECTADOS
  const ingresoItems: LineItem[] = [
    { key: "ventas1hab", concepto: "Ventas hospedaje 1 Habitación", original: desglose.ventas1Hab, sign: 1 },
    { key: "ventas2hab", concepto: "Ventas hospedaje 2 Habitaciones", original: desglose.ventas2Hab, sign: 1 },
    { key: "otrosIngresos", concepto: "Otros ingresos NO operacionales", original: 0, sign: 1 },
  ];

  // A31-A35: COSTOS OPERACIONALES PROYECTADOS → subtotal COSTOS DIRECTOS (A37)
  const costosDirectosItems: LineItem[] = [
    { key: "comisionCanales", concepto: "Comisión canales (Booking, Airbnb, Web, Agencias + 20 Canales)", original: desglose.comisionCanales, sign: -1 },
    { key: "feeAdministracion", concepto: "Comisión Fee", original: desglose.feeAdministracion, sign: -1, hasExcelPct: false },
    { key: "fondoFARA", concepto: "FARA (Fondo de Reposición y Reparación)", original: desglose.fondoFARA, sign: -1 },
    { key: "costosOperacion", concepto: "Nómina Prestacional", original: desglose.costosOperacion, sign: -1, hasExcelPct: false },
    { key: "bolsaEmpleo", concepto: "Bolsa de Empleo", original: desglose.bolsaEmpleo, sign: -1 },
  ];

  // A42-A45: SERVICIOS PUBLICOS → subtotal GASTOS SERVICIOS PUBLICOS (A47)
  // Todas son montos fijos en pesos en el Excel (escalan por ocupación u otros factores,
  // pero no como % de ventas), por eso hasExcelPct: false.
  const serviciosPublicosItems: LineItem[] = [
    { key: "energia", concepto: "Energía", original: desglose.energia, sign: -1, hasExcelPct: false },
    { key: "agua", concepto: "Agua", original: desglose.agua, sign: -1, hasExcelPct: false },
    { key: "gas", concepto: "Gas", original: desglose.gas, sign: -1, hasExcelPct: false },
    { key: "internet", concepto: "Internet / Cable / Telefonía", original: desglose.internet, sign: -1, hasExcelPct: false },
  ];

  // A50-A55: GASTOS VARIOS → subtotal GASTOS VARIOS (A56)
  // Marketing (B53=1%) y Operación Fee Operador comercial (B55=10%) sí son % de ventas en
  // el Excel; el resto son montos fijos en pesos (B50, B51, B52, B54). "Amenities y
  // Consumibles de Huésped" y "Reposición de Blancos y Lencería" son filas añadidas fuera del
  // Excel fuente, misma fórmula que Aseo (escala por ocupación y varía por tipología).
  // "Dotación, Uniformes y Capacitación" y "Seguros (Todo Riesgo Contenido + RC Hotelera)"
  // también son añadidas, pero son montos fijos puros ($25.000 y $45.000/mes respectivamente)
  // para ambas tipologías y los 3 escenarios, sin escalar por ocupación. "Comisión Pasarela
  // de Pagos" también es añadida, pero a diferencia de esas es % de ventas (0.5%), no un monto fijo por
  // apartamento — por eso no lleva hasExcelPct: false.
  const gastosVariosItems: LineItem[] = [
    { key: "papeleria", concepto: "Papelería", original: desglose.papeleria, sign: -1, hasExcelPct: false },
    { key: "aseo", concepto: "Aseo", original: desglose.aseo, sign: -1, hasExcelPct: false },
    { key: "lavanderia", concepto: "Lavandería", original: desglose.lavanderia, sign: -1, hasExcelPct: false },
    { key: "amenities", concepto: "Amenities y Consumibles de Huésped", original: desglose.amenities, sign: -1, hasExcelPct: false },
    { key: "blancosLenceria", concepto: "Reposición de Blancos y Lencería", original: desglose.blancosLenceria, sign: -1, hasExcelPct: false },
    { key: "dotacionUniformes", concepto: "Dotación, Uniformes y Capacitación", original: desglose.dotacionUniformes, sign: -1, hasExcelPct: false },
    { key: "seguros", concepto: "Seguros (Todo Riesgo Contenido + RC Hotelera)", original: desglose.seguros, sign: -1, hasExcelPct: false },
    { key: "comisionPasarelaPagos", concepto: "Comisión Pasarela de Pagos", original: desglose.comisionPasarelaPagos, sign: -1 },
    { key: "marketing", concepto: "Marketing y Publicidad", original: desglose.marketing, sign: -1 },
    { key: "honorariosContables", concepto: "Honorarios Firma Contable y Revisoría Fiscal", original: desglose.honorariosContables, sign: -1, hasExcelPct: false },
    { key: "operadorComercialFee", concepto: "Operación Fee Operador comercial", original: desglose.operadorComercialFee, sign: -1 },
  ];

  // A58-A60: partidas individuales, sin subtotal propio. Las 3 son montos fijos en pesos.
  // "ICA (Impuesto de Industria y Comercio)" es una fila añadida fuera del Excel fuente: a
  // diferencia de las otras 3, es % de ventas (0.7%), no un monto fijo. "Cuota de
  // Administración del Edificio" también es añadida: arranca en $0, sin % del Excel (por eso
  // no lleva hasExcelPct: false, para que el usuario pueda escribir directamente el % de
  // ventas que quiera simular) y con el switch "Activo" apagado (ver DISABLED_BY_DEFAULT_KEYS)
  // — el usuario la activa y edita manualmente si quiere incluirla en la simulación local de
  // esta tabla.
  const otrosGastosItems: LineItem[] = [
    { key: "sayco", concepto: "Sayco y Acimpro", original: desglose.sayco, sign: -1, hasExcelPct: false },
    { key: "pmsChanelManager", concepto: "PMS y Chanel Manager", original: desglose.pmsChanelManager, sign: -1, hasExcelPct: false },
    { key: "otrosGastosOperativos", concepto: "Otros Gastos Operativos (Anexo 3) - prorrateo x unidad", original: desglose.otrosGastosOperativos, sign: -1, hasExcelPct: false },
    { key: "cuotaAdministracionEdificio", concepto: "Cuota de Administración del Edificio", original: 0, sign: -1 },
    { key: "ica", concepto: "ICA (Impuesto de Industria y Comercio)", original: desglose.ica, sign: -1 },
  ];

  const impuestoItem: LineItem = { key: "impuestoRenta", concepto: "(-) Impuesto de renta", original: desglose.impuestoRenta, sign: -1 };

  const liveTotalIngresos = ingresoItems.reduce((s, i) => s + liveValue(i), 0);
  const liveCostosDirectos = costosDirectosItems.reduce((s, i) => s + liveValue(i), 0);
  const liveGastosServiciosPublicos = serviciosPublicosItems.reduce((s, i) => s + liveValue(i), 0);
  const liveGastosVarios = gastosVariosItems.reduce((s, i) => s + liveValue(i), 0);
  const liveOtrosGastos = otrosGastosItems.reduce((s, i) => s + liveValue(i), 0);

  // A62: UTILIDAD BRUTA / EBITDA = TOTAL INGRESOS - COSTOS DIRECTOS - GASTOS SERV. PUB. - GASTOS VARIOS - Sayco - PMS - Otros
  const liveUtilidadOperacional =
    liveTotalIngresos - liveCostosDirectos - liveGastosServiciosPublicos - liveGastosVarios - liveOtrosGastos;

  // El impuesto, si no se toca, se recalcula dinámicamente como % de la utilidad operacional
  // vigente (igual que en el modelo real) — no se congela en su monto original.
  const impuestoRatioOriginal = desglose.utilidadOperacional > 0 ? desglose.impuestoRenta / desglose.utilidadOperacional : 0;
  const impuestoState = getState(impuestoItem.key);
  const liveImpuesto = !impuestoState.enabled
    ? 0
    : impuestoState.pctOverride !== null
      ? pctBasis * impuestoState.pctOverride
      : liveUtilidadOperacional * impuestoRatioOriginal;

  const liveUtilidadNeta = liveUtilidadOperacional - liveImpuesto;

  const pct = (v: number) => (pctBasis > 0 ? `${((v / pctBasis) * 100).toFixed(1)}%` : "—");

  const renderEditableRow = (item: LineItem, valueOverride?: number) => {
    const st = getState(item.key);
    const magnitude = valueOverride !== undefined ? valueOverride : liveValue(item);
    const value = magnitude * item.sign;
    const pctValue = st.pctOverride !== null ? st.pctOverride * 100 : (magnitude / (pctBasis || 1)) * 100;
    // Esta partida es un monto fijo en pesos en el Excel (no tiene % de ventas asociado):
    // mostramos "—" en vez de un % calculado que no corresponde a ningún dato del Excel.
    const sinPctExcel = item.hasExcelPct === false && st.pctOverride === null;

    return (
      <tr key={item.key} className={`border-b border-navy/5 ${!st.enabled ? "opacity-40" : ""}`}>
        <td className="py-2.5 pr-4 pl-4 text-navy/70">{item.concepto}</td>
        <td className={`py-2.5 px-3 text-right tabular-nums ${item.sign < 0 ? "text-copper" : "text-navy/70"}`}>
          {formatMoney(value / 12, moneda, tasaCambio)}
        </td>
        <td className={`py-2.5 px-3 text-right tabular-nums ${item.sign < 0 ? "text-copper" : "text-navy/70"}`}>
          {formatMoney(value, moneda, tasaCambio)}
        </td>
        <td className="py-1.5 pl-3 text-right">
          {sinPctExcel ? (
            <span className="text-navy/30 text-xs pr-1">—</span>
          ) : (
            <div className="inline-flex items-center justify-end gap-1">
              <input
                type="number"
                step={0.1}
                disabled={!st.enabled}
                value={Number(pctValue.toFixed(2))}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPctOverride(item.key, Number.isFinite(v) ? v / 100 : 0);
                }}
                className="w-16 rounded-lg border border-navy/15 bg-white px-1.5 py-1 text-right text-xs text-navy tabular-nums focus:outline-none focus:ring-2 focus:ring-copper disabled:bg-navy/5 disabled:text-navy/30"
              />
              <span className="text-navy/40 text-xs">%</span>
            </div>
          )}
        </td>
        <td className="py-2.5 pl-3 text-center">
          <button
            type="button"
            role="switch"
            aria-checked={st.enabled}
            onClick={() => setEnabled(item.key, !st.enabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              st.enabled ? "bg-optimista" : "bg-navy/20"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                st.enabled ? "translate-x-[18px]" : "translate-x-1"
              }`}
            />
          </button>
        </td>
      </tr>
    );
  };

  const renderSectionHeader = (label: string) => (
    <tr key={label} className="bg-navy/[0.06]">
      <td colSpan={5} className="py-2 pr-4 pl-4 font-semibold text-navy text-xs uppercase tracking-wide">
        {label}
      </td>
    </tr>
  );

  const renderSubtotalRow = (concepto: string, value: number) => (
    <tr key={concepto} className="border-b border-navy/5 bg-navy/[0.03]">
      <td className="py-2.5 pr-4 pl-4 font-semibold text-navy">{concepto}</td>
      <td className="py-2.5 px-3 text-right font-semibold text-navy tabular-nums">
        {formatMoney(value / 12, moneda, tasaCambio)}
      </td>
      <td className="py-2.5 px-3 text-right font-semibold text-navy tabular-nums">
        {formatMoney(value, moneda, tasaCambio)}
      </td>
      <td className="py-2.5 pl-3 text-right text-navy/40 tabular-nums">{pct(Math.abs(value))}</td>
      <td className="py-2.5 pl-3" />
    </tr>
  );

  const renderPctOnlyRow = (concepto: string, value: number) => (
    <tr key={concepto} className="border-b border-navy/5">
      <td className="py-2.5 pr-4 pl-4 text-navy/70">{concepto}</td>
      <td className="py-2.5 px-3 text-right text-navy/30">—</td>
      <td className="py-2.5 px-3 text-right text-navy/30">—</td>
      <td className="py-2.5 pl-3 text-right font-semibold text-navy tabular-nums">{formatPct(value)}</td>
      <td className="py-2.5 pl-3" />
    </tr>
  );

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-navy/10 text-left">
            <th className="py-3 pr-4 pl-4 font-medium text-navy/45 text-xs uppercase tracking-wide">Concepto</th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">Mensual</th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">Anual</th>
            <th className="py-3 pl-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">%</th>
            <th className="py-3 pl-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-center">Activo</th>
          </tr>
        </thead>
        <tbody>
          {renderSectionHeader("Ingresos Proyectados")}
          {ingresoItems.map((item) => renderEditableRow(item))}
          {renderSubtotalRow("TOTAL INGRESOS", liveTotalIngresos)}

          {renderSectionHeader("Costos Operacionales Proyectados")}
          {costosDirectosItems.map((item) => renderEditableRow(item))}
          {renderSubtotalRow("COSTOS DIRECTOS", -liveCostosDirectos)}

          {renderSectionHeader("Gastos Proyectados — Servicios Públicos")}
          {serviciosPublicosItems.map((item) => renderEditableRow(item))}
          {renderSubtotalRow("GASTOS SERVICIOS PÚBLICOS", -liveGastosServiciosPublicos)}

          {renderSectionHeader("Gastos Varios")}
          {gastosVariosItems.map((item) => renderEditableRow(item))}
          {renderSubtotalRow("GASTOS VARIOS", -liveGastosVarios)}

          {otrosGastosItems.map((item) => renderEditableRow(item))}

          {renderSubtotalRow("UTILIDAD BRUTA / EBITDA", liveUtilidadOperacional)}
          {renderPctOnlyRow("Margen EBITDA (%)", pctBasis > 0 ? liveUtilidadOperacional / pctBasis : 0)}
          {renderEditableRow(impuestoItem, liveImpuesto)}
          {renderSubtotalRow("UTILIDAD NETA", liveUtilidadNeta)}
        </tbody>
      </table>
      <p className="text-xs text-navy/40 mt-3">
        Los porcentajes y el interruptor &ldquo;Activo&rdquo; son una simulación local dentro de esta
        tabla — no afectan las tarjetas de resultados, gráficas ni el comparador de escenarios.
      </p>
    </div>
  );
}

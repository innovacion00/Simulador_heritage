"use client";

import { useState } from "react";
import { DesglosePYG, Moneda, formatMoney, formatPct } from "@/lib/calculations";

interface LineItem {
  key: string;
  concepto: string;
  original: number;
  sign: 1 | -1;
}

interface RowState {
  enabled: boolean;
  pctOverride: number | null;
}

const DEFAULT_ROW_STATE: RowState = { enabled: true, pctOverride: null };

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

  const getState = (key: string): RowState => rowStates[key] ?? DEFAULT_ROW_STATE;

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

  const ingresoItems: LineItem[] = [
    { key: "ventas1hab", concepto: "Ventas hospedaje 1 Habitación", original: desglose.ventas1Hab, sign: 1 },
    { key: "ventas2hab", concepto: "Ventas hospedaje 2 Habitaciones", original: desglose.ventas2Hab, sign: 1 },
  ];
  const costoVentasItems: LineItem[] = [
    { key: "comisionOTA", concepto: "Comisión OTAs", original: desglose.comisionOTA, sign: -1 },
    { key: "fondoFARA", concepto: "Fondo FARA", original: desglose.fondoFARA, sign: -1 },
  ];
  const gastoOperacionItems: LineItem[] = [
    { key: "nomina", concepto: "Gastos nómina", original: desglose.nomina, sign: -1 },
    { key: "bolsaEmpleo", concepto: "Bolsa de empleo", original: desglose.bolsaEmpleo, sign: -1 },
    { key: "serviciosPublicos", concepto: "Servicios públicos", original: desglose.serviciosPublicos, sign: -1 },
    { key: "tecnologia", concepto: "Tecnología y comunicaciones", original: desglose.tecnologia, sign: -1 },
    { key: "operacionSuministros", concepto: "Operación y suministros", original: desglose.operacionSuministros, sign: -1 },
    { key: "marketing", concepto: "Marketing y comercialización", original: desglose.marketing, sign: -1 },
    { key: "domotica", concepto: "Domótica (cerraduras + sensores)", original: desglose.domotica, sign: -1 },
    { key: "cuotaAdministracion", concepto: "Cuota administración / condominio", original: desglose.cuotaAdministracion, sign: -1 },
    { key: "seguroResponsabilidadCivil", concepto: "Seguro responsabilidad civil", original: desglose.seguroResponsabilidadCivil, sign: -1 },
    { key: "honorariosContables", concepto: "Honorarios firma contable", original: desglose.honorariosContables, sign: -1 },
    { key: "revisoriaFiscal", concepto: "Revisoría fiscal", original: desglose.revisoriaFiscal, sign: -1 },
    { key: "otrosGastosOperativos", concepto: "Otros gastos operativos", original: desglose.otrosGastosOperativos, sign: -1 },
    { key: "segurosYLicencias", concepto: "Seguros y licencias", original: desglose.segurosYLicencias, sign: -1 },
    { key: "comisionSmartStay", concepto: "Comisión Smart Stay — fee variable", original: desglose.comisionSmartStay, sign: -1 },
    { key: "feeBase", concepto: "Fee base Smart Stay (1Hab/2Hab por unidad)", original: desglose.feeBase, sign: -1 },
  ];
  const impuestoItem: LineItem = { key: "impuestoRenta", concepto: "Impuesto de renta", original: desglose.impuestoRenta, sign: -1 };

  const liveTotalIngresos = ingresoItems.reduce((s, i) => s + liveValue(i), 0);
  const liveTotalCostoVentas = costoVentasItems.reduce((s, i) => s + liveValue(i), 0);
  const liveUtilidadBruta = liveTotalIngresos - liveTotalCostoVentas;
  const liveTotalGastosOperacion = gastoOperacionItems.reduce((s, i) => s + liveValue(i), 0);
  const liveUtilidadOperacional = liveUtilidadBruta - liveTotalGastosOperacion;

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

  const renderSubtotalRow = (concepto: string, value: number) => (
    <tr key={concepto} className="border-b border-navy/5 bg-navy/[0.03]">
      <td className="py-2.5 pr-4 font-semibold text-navy">{concepto}</td>
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
      <td className="py-2.5 pr-4 text-navy/70">{concepto}</td>
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
            <th className="py-3 pr-4 font-medium text-navy/45 text-xs uppercase tracking-wide">Concepto</th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">Mensual</th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">Anual</th>
            <th className="py-3 pl-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">%</th>
            <th className="py-3 pl-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-center">Activo</th>
          </tr>
        </thead>
        <tbody>
          {ingresoItems.map((item) => renderEditableRow(item))}
          {renderSubtotalRow("TOTAL INGRESOS", liveTotalIngresos)}

          {costoVentasItems.map((item) => renderEditableRow(item))}
          {renderSubtotalRow("Total costo de ventas", -liveTotalCostoVentas)}
          {renderSubtotalRow("Utilidad bruta", liveUtilidadBruta)}

          {gastoOperacionItems.map((item) => renderEditableRow(item))}
          {renderSubtotalRow("Total gastos de operación", -liveTotalGastosOperacion)}

          {renderSubtotalRow("Utilidad operacional (EBITDA)", liveUtilidadOperacional)}
          {renderPctOnlyRow("Margen EBITDA", pctBasis > 0 ? liveUtilidadOperacional / pctBasis : 0)}
          {renderEditableRow(impuestoItem, liveImpuesto)}
          {renderSubtotalRow("UTILIDAD NETA", liveUtilidadNeta)}
          {renderPctOnlyRow("Margen neto", pctBasis > 0 ? liveUtilidadNeta / pctBasis : 0)}
        </tbody>
      </table>
      <p className="text-xs text-navy/40 mt-3">
        Los porcentajes y el interruptor &ldquo;Activo&rdquo; son una simulación local dentro de esta
        tabla — no afectan las tarjetas de resultados, gráficas ni el comparador de escenarios.
      </p>
    </div>
  );
}

import { DesglosePYG, Moneda, formatMoney } from "@/lib/calculations";

interface Row {
  concepto: string;
  anual: number;
  pct?: string;
  bold?: boolean;
  negative?: boolean;
}

export function DetailedFinancialTable({
  desglose,
  moneda,
  tasaCambio,
}: {
  desglose: DesglosePYG;
  moneda: Moneda;
  tasaCambio: number;
}) {
  const pct = (v: number) =>
    desglose.ventasBrutas > 0 ? `${((v / desglose.ventasBrutas) * 100).toFixed(1)}%` : "—";

  const rows: Row[] = [
    { concepto: "Ventas brutas", anual: desglose.ventasBrutas, pct: "100.0%", bold: true },
    { concepto: "Comisión OTAs", anual: -desglose.comisionOTA, pct: pct(desglose.comisionOTA), negative: true },
    { concepto: "Fondo FARA", anual: -desglose.fondoFARA, pct: pct(desglose.fondoFARA), negative: true },
    {
      concepto: "Total costo de ventas",
      anual: -desglose.totalCostoVentas,
      pct: pct(desglose.totalCostoVentas),
      bold: true,
      negative: true,
    },
    { concepto: "Utilidad bruta", anual: desglose.utilidadBruta, pct: pct(desglose.utilidadBruta), bold: true },
    {
      concepto: "Comisión Smart Stay",
      anual: -desglose.comisionSmartStay,
      pct: pct(desglose.comisionSmartStay),
      negative: true,
    },
    {
      concepto: "Otros gastos operativos",
      anual: -desglose.otrosGastosOperativos,
      pct: pct(desglose.otrosGastosOperativos),
      negative: true,
    },
    {
      concepto: "Total gastos de operación",
      anual: -desglose.totalGastosOperacion,
      pct: pct(desglose.totalGastosOperacion),
      bold: true,
      negative: true,
    },
    {
      concepto: "Utilidad operacional (EBITDA)",
      anual: desglose.utilidadOperacional,
      pct: pct(desglose.utilidadOperacional),
      bold: true,
    },
    {
      concepto: "Impuesto de renta",
      anual: -desglose.impuestoRenta,
      pct: pct(desglose.impuestoRenta),
      negative: true,
    },
    { concepto: "Utilidad neta", anual: desglose.utilidadNeta, pct: pct(desglose.utilidadNeta), bold: true },
  ];

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="border-b border-navy/10 text-left">
            <th className="py-3 pr-4 font-medium text-navy/45 text-xs uppercase tracking-wide">Concepto</th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">
              Mensual
            </th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">
              Anual
            </th>
            <th className="py-3 pl-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.concepto}
              className={`border-b border-navy/5 ${row.bold ? "bg-navy/[0.03]" : ""}`}
            >
              <td className={`py-2.5 pr-4 ${row.bold ? "font-semibold text-navy" : "text-navy/70"}`}>
                {row.concepto}
              </td>
              <td
                className={`py-2.5 px-3 text-right tabular-nums ${
                  row.negative ? "text-copper" : row.bold ? "font-semibold text-navy" : "text-navy/70"
                }`}
              >
                {formatMoney(row.anual / 12, moneda, tasaCambio)}
              </td>
              <td
                className={`py-2.5 px-3 text-right tabular-nums ${
                  row.negative ? "text-copper" : row.bold ? "font-semibold text-navy" : "text-navy/70"
                }`}
              >
                {formatMoney(row.anual, moneda, tasaCambio)}
              </td>
              <td className="py-2.5 pl-3 text-right text-navy/40 tabular-nums">{row.pct}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

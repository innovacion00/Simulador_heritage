import {
  ANEXO_NOMINA,
  ANEXO_NOMINA_TOTAL_CANTIDAD,
  ANEXO_NOMINA_TOTAL_MENSUAL,
  ANEXO_OTROS_GASTOS,
  ANEXO_OTROS_GASTOS_TOTAL_MENSUAL,
} from "@/lib/data";
import { Moneda, formatMoney } from "@/lib/calculations";

function AnexoNominaTable({ moneda, tasaCambio }: { moneda: Moneda; tasaCambio: number }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr className="border-b border-navy/10 text-left">
            <th className="py-3 pr-4 font-medium text-navy/45 text-xs uppercase tracking-wide">Cargo</th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">Cantidad</th>
            <th className="py-3 px-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">
              Salario mensual
            </th>
            <th className="py-3 pl-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">
              Costo mensual
            </th>
          </tr>
        </thead>
        <tbody>
          {ANEXO_NOMINA.map((row) => (
            <tr key={row.cargo} className="border-b border-navy/5">
              <td className="py-2.5 pr-4 text-navy/70">{row.cargo}</td>
              <td className="py-2.5 px-3 text-right tabular-nums text-navy/70">{row.cantidad}</td>
              <td className="py-2.5 px-3 text-right tabular-nums text-navy/70">
                {formatMoney(row.salarioMensual, moneda, tasaCambio)}
              </td>
              <td className="py-2.5 pl-3 text-right tabular-nums text-navy/70">
                {row.costoMensual > 0 ? formatMoney(row.costoMensual, moneda, tasaCambio) : "—"}
              </td>
            </tr>
          ))}
          <tr className="bg-navy/[0.03]">
            <td className="py-2.5 pr-4 font-semibold text-navy">TOTAL NÓMINA MENSUAL</td>
            <td className="py-2.5 px-3 text-right font-semibold text-navy tabular-nums">
              {ANEXO_NOMINA_TOTAL_CANTIDAD}
            </td>
            <td className="py-2.5 px-3" />
            <td className="py-2.5 pl-3 text-right font-semibold text-navy tabular-nums">
              {formatMoney(ANEXO_NOMINA_TOTAL_MENSUAL, moneda, tasaCambio)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-navy/40 mt-3">
        Los cargos marcados &ldquo;incluido en fee Smart Stay&rdquo; están cubiertos por la comisión
        variable y el fee base de Smart Stay, por eso no suman costo mensual directo en este anexo.
      </p>
    </div>
  );
}

function AnexoOtrosGastosTable({ moneda, tasaCambio }: { moneda: Moneda; tasaCambio: number }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-sm min-w-[360px]">
        <thead>
          <tr className="border-b border-navy/10 text-left">
            <th className="py-3 pr-4 font-medium text-navy/45 text-xs uppercase tracking-wide">Concepto</th>
            <th className="py-3 pl-3 font-medium text-navy/45 text-xs uppercase tracking-wide text-right">
              Valor mensual
            </th>
          </tr>
        </thead>
        <tbody>
          {ANEXO_OTROS_GASTOS.map((row) => (
            <tr key={row.concepto} className="border-b border-navy/5">
              <td className="py-2.5 pr-4 text-navy/70">{row.concepto}</td>
              <td className="py-2.5 pl-3 text-right tabular-nums text-navy/70">
                {formatMoney(row.valorMensual, moneda, tasaCambio)}
              </td>
            </tr>
          ))}
          <tr className="bg-navy/[0.03]">
            <td className="py-2.5 pr-4 font-semibold text-navy">TOTAL OTROS GASTOS MENSUAL</td>
            <td className="py-2.5 pl-3 text-right font-semibold text-navy tabular-nums">
              {formatMoney(ANEXO_OTROS_GASTOS_TOTAL_MENSUAL, moneda, tasaCambio)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function ExpenseAnnexTables({ moneda, tasaCambio }: { moneda: Moneda; tasaCambio: number }) {
  return (
    <div className="rounded-2xl bg-white border border-navy/10 p-5 sm:p-8 shadow-sm">
      <h3 className="font-serif-display text-xl sm:text-2xl text-navy font-medium">Detallado de gastos</h3>
      <p className="text-navy/45 text-sm mt-1 mb-6">
        Anexos del modelo financiero con el detalle de nómina y otros gastos operativos que componen
        el proyecto (Año 1, base sin inflación anual).
      </p>

      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-semibold text-navy mb-3">Detalle de nómina (costo mensual)</h4>
          <AnexoNominaTable moneda={moneda} tasaCambio={tasaCambio} />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-navy mb-3">Otros gastos operativos (costo mensual)</h4>
          <AnexoOtrosGastosTable moneda={moneda} tasaCambio={tasaCambio} />
        </div>
      </div>
    </div>
  );
}

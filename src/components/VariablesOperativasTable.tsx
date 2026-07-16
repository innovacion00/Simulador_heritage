import { ADR, DIAS_BASE, ESCENARIOS, Escenario, Tipologia } from "@/lib/data";
import { Moneda, formatMoney, formatPct } from "@/lib/calculations";

const TIPOLOGIAS_COLS: { id: Tipologia; label: string }[] = [
  { id: "1hab", label: "1 Habitación" },
  { id: "2hab", label: "2 Habitaciones" },
];

/**
 * Réplica de la sección "DETALLE - VARIABLES OPERATIVAS" de la hoja HERITAGE:
 * mismas 4 filas (Base de los Días, % Ocupación por Escenario, Unidades Productivas
 * a Evaluar, ADR o Tarifa Promedio), con Pesimista/Conservador/Optimista × 1Hab/2Hab
 * en columnas, igual que el Excel.
 */
export function VariablesOperativasTable({
  ocupacionPorEscenario,
  adrOverridePorEscenario,
  diasEfectivos,
  moneda,
  tasaCambio,
}: {
  ocupacionPorEscenario: Record<Escenario, number>;
  adrOverridePorEscenario?: Record<Escenario, Partial<Record<Tipologia, number>>>;
  diasEfectivos?: number;
  moneda: Moneda;
  tasaCambio: number;
}) {
  const dias = (tip: Tipologia) => diasEfectivos ?? DIAS_BASE[tip];
  const adr = (esc: Escenario, tip: Tipologia) => adrOverridePorEscenario?.[esc]?.[tip] ?? ADR[esc][tip][1];

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-navy/10 text-left">
            <th className="py-3 pr-4 font-medium text-navy/45 text-xs uppercase tracking-wide" rowSpan={2}>
              Detalle — Variables operativas
            </th>
            {ESCENARIOS.map((e) => (
              <th
                key={e.id}
                colSpan={2}
                className="py-2 px-3 text-center font-semibold text-navy text-xs uppercase tracking-wide border-l border-navy/10"
              >
                {e.label}
              </th>
            ))}
          </tr>
          <tr className="border-b border-navy/10 text-left">
            {ESCENARIOS.map((e) =>
              TIPOLOGIAS_COLS.map((t) => (
                <th
                  key={`${e.id}-${t.id}`}
                  className="py-2 px-3 text-right font-medium text-navy/45 text-xs uppercase tracking-wide border-l border-navy/10 first:border-l"
                >
                  {t.label}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-navy/5">
            <td className="py-2.5 pr-4 text-navy/70">Base de los Días</td>
            {ESCENARIOS.map((e) =>
              TIPOLOGIAS_COLS.map((t) => (
                <td key={`${e.id}-${t.id}`} className="py-2.5 px-3 text-right tabular-nums text-navy/70 border-l border-navy/5">
                  {dias(t.id)}
                </td>
              ))
            )}
          </tr>
          <tr className="border-b border-navy/5">
            <td className="py-2.5 pr-4 text-navy/70">% Ocupación por Escenario</td>
            {ESCENARIOS.map((e) =>
              TIPOLOGIAS_COLS.map((t) => (
                <td key={`${e.id}-${t.id}`} className="py-2.5 px-3 text-right tabular-nums text-navy/70 border-l border-navy/5">
                  {formatPct(ocupacionPorEscenario[e.id], 0)}
                </td>
              ))
            )}
          </tr>
          <tr className="border-b border-navy/5">
            <td className="py-2.5 pr-4 text-navy/70">Unidades Productivas a Evaluar</td>
            {ESCENARIOS.map((e) =>
              TIPOLOGIAS_COLS.map((t) => (
                <td key={`${e.id}-${t.id}`} className="py-2.5 px-3 text-right tabular-nums text-navy/70 border-l border-navy/5">
                  1
                </td>
              ))
            )}
          </tr>
          <tr className="border-b border-navy/5">
            <td className="py-2.5 pr-4 text-navy/70">ADR o Tarifa Promedio por tipo de Apartamento</td>
            {ESCENARIOS.map((e) =>
              TIPOLOGIAS_COLS.map((t) => (
                <td key={`${e.id}-${t.id}`} className="py-2.5 px-3 text-right tabular-nums text-navy/70 border-l border-navy/5">
                  {formatMoney(adr(e.id, t.id), moneda, tasaCambio)}
                </td>
              ))
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

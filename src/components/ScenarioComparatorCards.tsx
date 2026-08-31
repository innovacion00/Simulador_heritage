import { AdvancedParams, Anio, ESCENARIOS, Escenario, Tipologia } from "@/lib/data";
import {
  Moneda,
  TipologiaSeleccion,
  adrAplicado,
  calcularDesglose,
  formatMoney,
  formatPct,
} from "@/lib/calculations";

const DOT_COLOR: Record<Escenario, string> = {
  pesimista: "bg-pesimista",
  conservador: "bg-conservador",
  optimista: "bg-optimista",
};

export function ScenarioComparatorCards({
  tipologia,
  anio,
  nUnidades,
  montoInvertido,
  advancedParams,
  diasEfectivos,
  ocupacionPorEscenario,
  adrOverridePorEscenario,
  splitUnidades,
  escenarioActivo,
  moneda,
  tasaCambio,
}: {
  tipologia: TipologiaSeleccion;
  anio: Anio;
  nUnidades: number;
  montoInvertido: number;
  advancedParams: AdvancedParams;
  diasEfectivos: number;
  ocupacionPorEscenario: Record<Escenario, number>;
  adrOverridePorEscenario?: Record<Escenario, Partial<Record<Tipologia, number>>>;
  splitUnidades?: Partial<Record<Tipologia, number>>;
  escenarioActivo: Escenario;
  moneda: Moneda;
  tasaCambio: number;
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
      {ESCENARIOS.map((e) => {
        const ocupacion = ocupacionPorEscenario[e.id];
        const adrOverride = adrOverridePorEscenario?.[e.id];
        const desglose = calcularDesglose({
          escenario: e.id,
          tipologia,
          anio,
          nUnidades,
          advancedParams,
          diasEfectivos,
          ocupacion,
          adrOverride,
          splitUnidades,
        });
        const roiAnual = montoInvertido > 0 ? desglose.utilidadNeta / montoInvertido : 0;
        const isActive = e.id === escenarioActivo;

        return (
          <div
            key={e.id}
            className={`rounded-2xl border p-5 transition-colors ${
              isActive ? "border-copper bg-copper/[0.04]" : "border-navy/10 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy/60">
                <span className={`h-2 w-2 rounded-full ${DOT_COLOR[e.id]}`} />
                {e.label}
              </span>
              <span className="text-xs text-navy/40">Ocup. {formatPct(ocupacion, 0)}</span>
            </div>

            <p className="text-xs text-navy/40 uppercase tracking-wide">ADR aplicado</p>
            <p className="text-base font-semibold text-navy mb-4">
              {formatMoney(adrAplicado(e.id, tipologia, anio, adrOverride), moneda, tasaCambio)}
            </p>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-navy/50">Ingreso anual</dt>
                <dd className="font-medium text-navy">
                  {formatMoney(desglose.ventasBrutas, moneda, tasaCambio)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy/50">Utilidad neta anual</dt>
                <dd className="font-medium text-navy">
                  {formatMoney(desglose.utilidadNeta, moneda, tasaCambio)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy/50">Utilidad neta mensual</dt>
                <dd className="font-medium text-navy">
                  {formatMoney(desglose.utilidadNeta / 12, moneda, tasaCambio)}
                </dd>
              </div>
            </dl>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-navy/10">
              <div>
                <p className="text-xs text-navy/40">Rentab. anual</p>
                <p className="font-semibold text-navy">{formatPct(roiAnual)}</p>
              </div>
              <div>
                <p className="text-xs text-navy/40">Rentab. mensual</p>
                <p className="font-semibold text-navy">{formatPct(roiAnual / 12)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { ADR, Anio, ESCENARIOS, Escenario, TIPOLOGIAS } from "@/lib/data";
import { Moneda, formatMoney, formatPct } from "@/lib/calculations";

function VarTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy/[0.03] border border-navy/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-navy/45 leading-snug">{label}</p>
      <p className="text-sm sm:text-base font-semibold text-navy mt-1">{value}</p>
    </div>
  );
}

export function OperationalVariablesSummary({
  escenario,
  anio,
  moneda,
  tasaCambio,
  diasEfectivos,
  ocupacion,
}: {
  escenario: Escenario;
  anio: Anio;
  moneda: Moneda;
  tasaCambio: number;
  diasEfectivos: number;
  ocupacion: number;
}) {
  const unidades1hab = TIPOLOGIAS.find((t) => t.id === "1hab")!.unidades;
  const unidades2hab = TIPOLOGIAS.find((t) => t.id === "2hab")!.unidades;

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/45 mb-3">
        Variables operativas — Escenario {ESCENARIOS.find((e) => e.id === escenario)?.label} · Año {anio}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <VarTile label="% Ocupación" value={formatPct(ocupacion, 0)} />
        <VarTile label="ADR 1 Habitación" value={formatMoney(ADR[escenario]["1hab"][anio], moneda, tasaCambio)} />
        <VarTile label="ADR 2 Habitaciones" value={formatMoney(ADR[escenario]["2hab"][anio], moneda, tasaCambio)} />
        <VarTile label="Unidades 1 Habitación" value={`${unidades1hab}`} />
        <VarTile label="Unidades 2 Habitaciones" value={`${unidades2hab}`} />
        <VarTile label="Días proyectados" value={`${diasEfectivos}`} />
      </div>
    </div>
  );
}

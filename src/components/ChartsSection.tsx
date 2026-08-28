"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdvancedParams, Anio, ESCENARIOS, Escenario, Tipologia } from "@/lib/data";
import { DesglosePYG, Moneda, TipologiaSeleccion, calcularDesglose, formatCompact, formatMoney } from "@/lib/calculations";

const COST_COLORS = ["#3fa4dd", "#c6a15b", "#8a6d3b", "#b5723a", "#2f6d5c"];
const ESCENARIO_COLORS: Record<Escenario, string> = {
  pesimista: "var(--color-pesimista)",
  conservador: "var(--color-conservador)",
  optimista: "var(--color-optimista)",
};

function IngresosGastosUtilidadChart({
  desglose,
  moneda,
  tasaCambio,
}: {
  desglose: DesglosePYG;
  moneda: Moneda;
  tasaCambio: number;
}) {
  const totalCostos = desglose.totalCostoVentas + desglose.totalGastosOperacion;
  const data = [
    { name: "Ingresos", value: desglose.ventasBrutas, fill: "#3fa4dd" },
    { name: "Costos y gastos", value: totalCostos, fill: "#b5723a" },
    { name: "Utilidad neta", value: desglose.utilidadNeta, fill: "#c6a15b" },
  ];

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      <h3 className="font-serif-display text-lg text-navy font-medium">Ingresos, gastos y utilidad neta</h3>
      <p className="text-xs text-navy/45 mt-1 mb-4">Proyección anual, escenario y año seleccionados.</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,36,56,0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "var(--color-navy)", fontSize: 12 }} axisLine={{ stroke: "rgba(13,36,56,0.15)" }} tickLine={false} />
            <YAxis
              tickFormatter={(v: number) => formatCompact(v, moneda, tasaCambio)}
              tick={{ fill: "var(--color-navy)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip formatter={(v) => formatMoney(Number(v), moneda, tasaCambio)} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CostDistributionDonut({ desglose, moneda, tasaCambio }: { desglose: DesglosePYG; moneda: Moneda; tasaCambio: number }) {
  const gastosFijos =
    desglose.bolsaEmpleo +
    desglose.feeAdministracion +
    desglose.energia +
    desglose.agua +
    desglose.gas +
    desglose.internet +
    desglose.papeleria +
    desglose.aseo +
    desglose.lavanderia +
    desglose.amenities +
    desglose.blancosLenceria +
    desglose.dotacionUniformes +
    desglose.seguros +
    desglose.comisionPasarelaPagos +
    desglose.honorariosContables +
    desglose.sayco +
    desglose.pmsChanelManager +
    desglose.otrosGastosOperativos +
    desglose.ica;

  const data = [
    { name: "Comisión canales", value: desglose.comisionCanales },
    { name: "Fondo FARA", value: desglose.fondoFARA },
    { name: "Nómina Prestacional", value: desglose.costosOperacion },
    { name: "Marketing", value: desglose.marketing },
    { name: "Fee Operador comercial", value: desglose.operadorComercialFee },
    { name: "Gastos fijos (admin, servicios, otros...)", value: gastosFijos },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      <h3 className="font-serif-display text-lg text-navy font-medium">Distribución de costos y gastos</h3>
      <p className="text-xs text-navy/45 mt-1 mb-4">Participación anual sobre el total.</p>
      <div className="h-64 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatMoney(Number(v), moneda, tasaCambio)} />
            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RentabilidadPorEscenarioChart({
  tipologia,
  anio,
  nUnidades,
  montoInvertido,
  advancedParams,
  diasEfectivos,
  ocupacionPorEscenario,
  adrOverridePorEscenario,
}: {
  tipologia: TipologiaSeleccion;
  anio: Anio;
  nUnidades: number;
  montoInvertido: number;
  advancedParams: AdvancedParams;
  diasEfectivos: number;
  ocupacionPorEscenario: Record<Escenario, number>;
  adrOverridePorEscenario?: Record<Escenario, Partial<Record<Tipologia, number>>>;
}) {
  const data = ESCENARIOS.map((e) => {
    const desglose = calcularDesglose({
      escenario: e.id,
      tipologia,
      anio,
      nUnidades,
      advancedParams,
      diasEfectivos,
      ocupacion: ocupacionPorEscenario[e.id],
      adrOverride: adrOverridePorEscenario?.[e.id],
    });
    const roi = montoInvertido > 0 ? desglose.utilidadNeta / montoInvertido : 0;
    return { name: e.label, value: roi * 100, fill: ESCENARIO_COLORS[e.id] };
  });

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      <h3 className="font-serif-display text-lg text-navy font-medium">Rentabilidad anual por escenario</h3>
      <p className="text-xs text-navy/45 mt-1 mb-4">Pesimista, conservador y optimista.</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,36,56,0.08)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "var(--color-navy)", fontSize: 12 }} axisLine={{ stroke: "rgba(13,36,56,0.15)" }} tickLine={false} />
            <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fill: "var(--color-navy)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ChartsSection({
  desglose,
  tipologia,
  anio,
  nUnidades,
  montoInvertido,
  advancedParams,
  diasEfectivos,
  ocupacionPorEscenario,
  adrOverridePorEscenario,
  moneda,
  tasaCambio,
}: {
  desglose: DesglosePYG;
  tipologia: TipologiaSeleccion;
  anio: Anio;
  nUnidades: number;
  montoInvertido: number;
  advancedParams: AdvancedParams;
  diasEfectivos: number;
  ocupacionPorEscenario: Record<Escenario, number>;
  adrOverridePorEscenario?: Record<Escenario, Partial<Record<Tipologia, number>>>;
  moneda: Moneda;
  tasaCambio: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif-display text-2xl sm:text-3xl text-navy font-medium">Gráficas de la simulación</h2>
        <p className="text-navy/50 text-sm mt-1">Ingresos, gastos, distribución de costos y comparación de escenarios.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <IngresosGastosUtilidadChart desglose={desglose} moneda={moneda} tasaCambio={tasaCambio} />
        <CostDistributionDonut desglose={desglose} moneda={moneda} tasaCambio={tasaCambio} />
      </div>
      <RentabilidadPorEscenarioChart
        tipologia={tipologia}
        anio={anio}
        nUnidades={nUnidades}
        montoInvertido={montoInvertido}
        advancedParams={advancedParams}
        diasEfectivos={diasEfectivos}
        ocupacionPorEscenario={ocupacionPorEscenario}
        adrOverridePorEscenario={adrOverridePorEscenario}
      />
    </div>
  );
}

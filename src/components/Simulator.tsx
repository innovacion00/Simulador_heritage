"use client";

import { useMemo, useState } from "react";
import {
  ADVANCED_PARAMS_DEFAULT,
  Anio,
  DIAS_EFECTIVOS,
  ESCENARIOS,
  Escenario,
  OCUPACION,
  TASA_CAMBIO_REFERENCIA,
  UNIDADES_TOTALES,
} from "@/lib/data";
import {
  Moneda,
  TipologiaSeleccion,
  formatMoney,
  formatPct,
  precioReferencia,
  simular,
} from "@/lib/calculations";
import { AdvancedParamsPanel } from "./AdvancedParamsPanel";
import { StatTile } from "./StatTile";
import { OperationalVariablesSummary } from "./OperationalVariablesSummary";
import { DetailedFinancialTable } from "./DetailedFinancialTable";
import { ScenarioComparatorCards } from "./ScenarioComparatorCards";
import { ChartsSection } from "./ChartsSection";
import { ActionBar } from "./ActionBar";
import { IconBuilding, IconDollar, IconPercent, IconReceipt, IconTrendUp, IconWallet } from "./icons";

const TIPOLOGIA_OPTS: { id: TipologiaSeleccion; label: string }[] = [
  { id: "1hab", label: "1 Habitación" },
  { id: "2hab", label: "2 Habitaciones" },
  { id: "mixto", label: "Proyecto completo" },
];

const PRECIO_MIN = 200_000_000;
const PRECIO_MAX = 900_000_000;
const PRECIO_STEP = 5_000_000;

const ANIOS: { id: Anio; label: string }[] = [
  { id: 1, label: "Año 1" },
  { id: 2, label: "Año 2" },
  { id: 3, label: "Año 3" },
];

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-xl bg-navy/5 p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-lg px-2 py-2.5 text-xs sm:text-sm font-medium transition-all ${
            value === opt.id ? "bg-navy text-arena shadow-sm" : "text-navy/60 hover:text-navy"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Simulator() {
  const [tipologia, setTipologia] = useState<TipologiaSeleccion>("1hab");
  const [escenario, setEscenario] = useState<Escenario>("conservador");
  const [anio, setAnio] = useState<Anio>(1);
  const [nUnidades, setNUnidades] = useState(1);
  const [inputMode, setInputMode] = useState<"unidades" | "monto">("unidades");
  const [montoTexto, setMontoTexto] = useState("");
  const [incluirFara, setIncluirFara] = useState(true);
  const [advancedParams, setAdvancedParams] = useState(ADVANCED_PARAMS_DEFAULT);
  const [moneda, setMoneda] = useState<Moneda>("COP");
  const [tasaCambio, setTasaCambio] = useState(TASA_CAMBIO_REFERENCIA);
  const [precioUnidad, setPrecioUnidad] = useState(() => precioReferencia("1hab"));
  const [diasEfectivos, setDiasEfectivos] = useState(DIAS_EFECTIVOS);
  const [ocupacionOverrides, setOcupacionOverrides] = useState<
    Partial<Record<Escenario, Partial<Record<Anio, number>>>>
  >({});
  const [tipologiaAnterior, setTipologiaAnterior] = useState(tipologia);

  const esProyectoCompleto = tipologia === "mixto";

  const getOcupacion = (esc: Escenario, an: Anio): number => ocupacionOverrides[esc]?.[an] ?? OCUPACION[esc][an];

  const setOcupacion = (esc: Escenario, an: Anio, valor: number) =>
    setOcupacionOverrides((prev) => ({ ...prev, [esc]: { ...prev[esc], [an]: valor } }));

  const ocupacionActual = getOcupacion(escenario, anio);
  const ocupacionPorEscenario: Record<Escenario, number> = {
    pesimista: getOcupacion("pesimista", anio),
    conservador: getOcupacion("conservador", anio),
    optimista: getOcupacion("optimista", anio),
  };

  // Al cambiar de tipología, se reinicia el precio de referencia a su valor base
  // (el usuario puede seguir ajustándolo con la barra deslizante).
  if (tipologia !== tipologiaAnterior) {
    setTipologiaAnterior(tipologia);
    setPrecioUnidad(precioReferencia(tipologia));
    if (tipologia === "mixto") {
      setInputMode("unidades");
    }
  }

  const unidadesEfectivas = useMemo(() => {
    if (esProyectoCompleto) return UNIDADES_TOTALES;
    if (inputMode === "unidades") return nUnidades;
    const monto = Number(montoTexto.replace(/[^\d]/g, "")) || 0;
    return Math.max(Math.round(monto / precioUnidad), 0);
  }, [esProyectoCompleto, inputMode, nUnidades, montoTexto, precioUnidad]);

  const montoInvertido = useMemo(() => {
    if (esProyectoCompleto) return UNIDADES_TOTALES * precioUnidad;
    if (inputMode === "monto") return Number(montoTexto.replace(/[^\d]/g, "")) || 0;
    return nUnidades * precioUnidad;
  }, [esProyectoCompleto, inputMode, montoTexto, nUnidades, precioUnidad]);

  const resultado = useMemo(
    () =>
      simular({
        escenario,
        tipologia,
        anio,
        nUnidades: unidadesEfectivas,
        montoInvertido,
        incluirFara,
        advancedParams,
        diasEfectivos,
        ocupacion: ocupacionActual,
        ocupacionAnio3: ocupacionOverrides[escenario]?.[3] ?? OCUPACION[escenario][3],
      }),
    [
      escenario,
      tipologia,
      anio,
      unidadesEfectivas,
      montoInvertido,
      incluirFara,
      advancedParams,
      diasEfectivos,
      ocupacionActual,
      ocupacionOverrides,
    ]
  );

  const { desglose } = resultado;
  const totalCostosYGastos = desglose.totalCostoVentas + desglose.totalGastosOperacion;
  const money = (v: number) => formatMoney(v, moneda, tasaCambio);

  const resumenTexto = [
    "Simulación de rentabilidad — Condo Resort Heritage",
    `Tipología: ${TIPOLOGIA_OPTS.find((t) => t.id === tipologia)?.label}`,
    `Escenario: ${ESCENARIOS.find((e) => e.id === escenario)?.label} · ${ANIOS.find((a) => a.id === anio)?.label}`,
    `Unidades: ${unidadesEfectivas} · Inversión: ${money(montoInvertido)}`,
    `Ingresos anuales: ${money(desglose.ventasBrutas)}`,
    `Costos y gastos anuales: ${money(totalCostosYGastos)}`,
    `Utilidad neta anual: ${money(desglose.utilidadNeta)}`,
    `Rentabilidad anual: ${formatPct(resultado.roiAnual)}`,
  ].join("\n");

  return (
    <>
    <section id="simulador" className="bg-arena py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Panel de parámetros */}
        <div className="rounded-2xl bg-white border border-navy/10 p-5 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-navy">
              <IconBuilding />
            </span>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl text-navy font-medium">
                Parámetros de la simulación
              </h2>
              <p className="text-navy/45 text-sm">Ajusta los valores según tu tipología y escenario comercial.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50 mb-2">
                Tipo de apartamento
              </label>
              <div className="relative">
                <select
                  value={tipologia}
                  onChange={(e) => setTipologia(e.target.value as TipologiaSeleccion)}
                  className="w-full appearance-none rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy font-medium focus:outline-none focus:ring-2 focus:ring-copper"
                >
                  {TIPOLOGIA_OPTS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-navy/40">▾</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                {esProyectoCompleto ? (
                  <>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50 mb-2">
                      N° de unidades
                    </label>
                    <div className="rounded-xl bg-navy/5 px-4 py-3 text-navy font-medium">
                      {UNIDADES_TOTALES} unidades · proyecto completo
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50">
                        {inputMode === "unidades" ? "N° de unidades" : "Monto a invertir"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setInputMode(inputMode === "unidades" ? "monto" : "unidades")}
                        className="text-xs text-copper font-medium underline underline-offset-2"
                      >
                        Usar {inputMode === "unidades" ? "monto en COP" : "N° de unidades"}
                      </button>
                    </div>

                    {inputMode === "unidades" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Restar unidad"
                          onClick={() => setNUnidades((n) => Math.max(1, n - 1))}
                          className="h-11 w-11 shrink-0 rounded-xl bg-navy text-arena text-xl font-medium active:scale-95 transition-transform"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min={1}
                          max={20}
                          value={nUnidades}
                          onChange={(e) => setNUnidades(Number(e.target.value))}
                          className="flex-1 accent-copper h-2"
                        />
                        <button
                          type="button"
                          aria-label="Sumar unidad"
                          onClick={() => setNUnidades((n) => Math.min(20, n + 1))}
                          className="h-11 w-11 shrink-0 rounded-xl bg-navy text-arena text-xl font-medium active:scale-95 transition-transform"
                        >
                          +
                        </button>
                        <span className="w-8 text-center font-semibold text-navy">{nUnidades}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 900.000.000"
                        value={montoTexto}
                        onChange={(e) => setMontoTexto(e.target.value)}
                        className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy font-medium focus:outline-none focus:ring-2 focus:ring-copper"
                      />
                    )}
                  </>
                )}
                <p className="text-xs text-navy/45 mt-2">
                  {esProyectoCompleto
                    ? `≈ ${money(montoInvertido)} · referencia ${money(precioUnidad)}/unidad`
                    : inputMode === "unidades"
                      ? `≈ ${money(montoInvertido)} · referencia ${money(precioUnidad)}/unidad`
                      : `≈ ${unidadesEfectivas} unidad${unidadesEfectivas === 1 ? "" : "es"} · referencia ${money(precioUnidad)}/unidad`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50 mb-2">
                  Moneda de visualización
                </label>
                <SegmentedControl
                  options={[
                    { id: "COP", label: "COP" },
                    { id: "USD", label: "USD" },
                  ]}
                  value={moneda}
                  onChange={setMoneda}
                />
                {moneda === "USD" && (
                  <div className="mt-3">
                    <label className="block text-xs text-navy/45 mb-1">Tasa de cambio COP/USD</label>
                    <input
                      type="number"
                      min={1}
                      value={tasaCambio}
                      onChange={(e) => setTasaCambio(Number(e.target.value) || 1)}
                      className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-navy font-medium focus:outline-none focus:ring-2 focus:ring-copper"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50">
                  Precio de referencia por unidad
                </label>
                <button
                  type="button"
                  onClick={() => setPrecioUnidad(precioReferencia(tipologia))}
                  className="text-xs text-copper font-medium underline underline-offset-2"
                >
                  Restablecer
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={PRECIO_MIN}
                  max={PRECIO_MAX}
                  step={PRECIO_STEP}
                  value={precioUnidad}
                  onChange={(e) => setPrecioUnidad(Number(e.target.value))}
                  className="flex-1 accent-copper h-2"
                />
                <span className="w-32 shrink-0 text-right font-semibold text-navy text-sm">
                  {money(precioUnidad)}
                </span>
              </div>
              <p className="text-xs text-navy/45 mt-2">
                Ajusta el valor de venta de referencia por unidad para tu simulación
                {esProyectoCompleto ? " (afecta la inversión total del proyecto)." : "."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50 mb-2">
                Escenario de ocupación
              </label>
              <SegmentedControl
                options={ESCENARIOS.map((e) => ({
                  id: e.id,
                  label: `${e.label} · ${formatPct(getOcupacion(e.id, anio), 0)}`,
                }))}
                value={escenario}
                onChange={setEscenario}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50">
                  % Ocupación — {ESCENARIOS.find((e) => e.id === escenario)?.label} ·{" "}
                  {ANIOS.find((a) => a.id === anio)?.label}
                </label>
                <button
                  type="button"
                  onClick={() => setOcupacion(escenario, anio, OCUPACION[escenario][anio])}
                  className="text-xs text-copper font-medium underline underline-offset-2"
                >
                  Restablecer
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(ocupacionActual * 100)}
                  onChange={(e) => setOcupacion(escenario, anio, Number(e.target.value) / 100)}
                  className="flex-1 accent-copper h-2"
                />
                <span className="w-14 shrink-0 text-right font-semibold text-navy text-sm">
                  {formatPct(ocupacionActual, 0)}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50 mb-2">
                  Horizonte de tiempo
                </label>
                <SegmentedControl options={ANIOS} value={anio} onChange={setAnio} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50">
                    Días efectivos de operación al año
                  </label>
                  <button
                    type="button"
                    onClick={() => setDiasEfectivos(DIAS_EFECTIVOS)}
                    className="text-xs text-copper font-medium underline underline-offset-2"
                  >
                    Restablecer
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={280}
                    max={365}
                    step={1}
                    value={diasEfectivos}
                    onChange={(e) => setDiasEfectivos(Number(e.target.value))}
                    className="flex-1 accent-copper h-2"
                  />
                  <span className="w-16 shrink-0 text-right font-semibold text-navy text-sm">
                    {diasEfectivos} días
                  </span>
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between rounded-xl bg-navy/5 px-4 py-3 cursor-pointer">
              <span className="text-sm font-medium text-navy">
                Incluir rendimiento Fondo FARA <span className="text-navy/40">(9% E.A.)</span>
              </span>
              <span
                onClick={() => setIncluirFara((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  incluirFara ? "bg-optimista" : "bg-navy/20"
                }`}
              >
                <span
                  className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform ${
                    incluirFara ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </label>

            <AdvancedParamsPanel value={advancedParams} onChange={setAdvancedParams} />
          </div>
        </div>

        {/* Resultados */}
        <div>
          <p className="text-copper text-xs font-semibold tracking-[0.2em] uppercase mb-2">Resultados</p>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-navy font-medium">
            Proyección de rentabilidad
          </h2>
          <p className="text-navy/50 text-sm mt-1">
            Tipología {TIPOLOGIA_OPTS.find((t) => t.id === tipologia)?.label} · Escenario{" "}
            {ESCENARIOS.find((e) => e.id === escenario)?.label} · {ANIOS.find((a) => a.id === anio)?.label}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatTile icon={<IconBuilding />} label="Inversión total" value={money(montoInvertido)} />
          <StatTile icon={<IconTrendUp />} label="Ingresos mensuales" value={money(desglose.ventasBrutas / 12)} tone="positive" />
          <StatTile icon={<IconTrendUp />} label="Ingresos anuales" value={money(desglose.ventasBrutas)} tone="positive" />
          <StatTile icon={<IconReceipt />} label="Costos y gastos mensuales" value={money(totalCostosYGastos / 12)} />
          <StatTile icon={<IconReceipt />} label="Costos y gastos anuales" value={money(totalCostosYGastos)} />
          <StatTile icon={<IconWallet />} label="Utilidad neta mensual" value={money(desglose.utilidadNeta / 12)} tone="positive" />
          <StatTile icon={<IconWallet />} label="Utilidad neta anual" value={money(desglose.utilidadNeta)} tone="positive" />
          <StatTile icon={<IconPercent />} label="Rentabilidad mensual" value={formatPct(resultado.roiAnual / 12)} />
          <StatTile icon={<IconPercent />} label="Rentabilidad anual" value={formatPct(resultado.roiAnual)} />
          <StatTile
            icon={<IconDollar />}
            label="Utilidad neta anual con FARA"
            value={money(resultado.utilidadTotalConFara)}
            subValue={incluirFara ? `Incluye ${money(resultado.faraAcumulado)} de FARA` : "FARA no incluido"}
            tone="positive"
          />
        </div>

        {/* Tabla financiera detallada */}
        <div className="rounded-2xl bg-white border border-navy/10 p-5 sm:p-8 shadow-sm">
          <h3 className="font-serif-display text-xl sm:text-2xl text-navy font-medium">Tabla financiera detallada</h3>
          <p className="text-navy/45 text-sm mt-1 mb-5">
            Desglose mensual y anual de ingresos, costos y gastos de tu participación.
          </p>
          <OperationalVariablesSummary
            escenario={escenario}
            anio={anio}
            moneda={moneda}
            tasaCambio={tasaCambio}
            diasEfectivos={diasEfectivos}
            ocupacion={ocupacionActual}
          />
          <DetailedFinancialTable desglose={desglose} moneda={moneda} tasaCambio={tasaCambio} />
        </div>

        {/* Comparador de escenarios */}
        <div className="rounded-2xl bg-white border border-navy/10 p-5 sm:p-8 shadow-sm">
          <h3 className="font-serif-display text-xl sm:text-2xl text-navy font-medium">Comparador de escenarios</h3>
          <p className="text-navy/45 text-sm mt-1 mb-5">
            Pesimista, conservador y optimista, con ADR y ocupación propios de cada uno sobre tu tipología seleccionada.
          </p>
          <ScenarioComparatorCards
            tipologia={tipologia}
            anio={anio}
            nUnidades={unidadesEfectivas}
            montoInvertido={montoInvertido}
            advancedParams={advancedParams}
            diasEfectivos={diasEfectivos}
            ocupacionPorEscenario={ocupacionPorEscenario}
            escenarioActivo={escenario}
            moneda={moneda}
            tasaCambio={tasaCambio}
          />
        </div>

        {/* Gráficas */}
        <ChartsSection
          desglose={desglose}
          tipologia={tipologia}
          anio={anio}
          nUnidades={unidadesEfectivas}
          montoInvertido={montoInvertido}
          advancedParams={advancedParams}
          diasEfectivos={diasEfectivos}
          ocupacionPorEscenario={ocupacionPorEscenario}
          moneda={moneda}
          tasaCambio={tasaCambio}
        />
      </div>
    </section>
    <ActionBar resumenTexto={resumenTexto} />
    </>
  );
}

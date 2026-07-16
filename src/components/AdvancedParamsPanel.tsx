"use client";

import { useState } from "react";
import { AdvancedParams, ADVANCED_PARAMS_DEFAULT } from "@/lib/data";

interface FieldConfig {
  key: keyof AdvancedParams;
  label: string;
  help: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: "comisionCanalesPct",
    label: "Comisión canales (% sobre ventas)",
    help: "Base sugerida 15% sobre ingresos por reservas en canales de distribución (Booking, Airbnb, Web, Agencias).",
  },
  {
    key: "faraPct",
    label: "Fondo FARA (% sobre ventas)",
    help: "Base sugerida 2% sobre ventas, destinado a reposición y reparación. Mientras no se usa, genera 9% E.A. adicional.",
  },
  {
    key: "operadorComercialFeePct",
    label: "Fee Operador comercial (% sobre ventas)",
    help: "Base sugerida 10%; fee variable de operación comercial del proyecto.",
  },
  {
    key: "impuestoPct",
    label: "Impuesto de renta (% utilidad operacional)",
    help: "Base sugerida 35%, aplicado sobre el EBITDA del proyecto conforme a la normativa vigente.",
  },
];

export function AdvancedParamsPanel({
  value,
  onChange,
}: {
  value: AdvancedParams;
  onChange: (next: AdvancedParams) => void;
}) {
  const [open, setOpen] = useState(false);
  const isModified = FIELDS.some((f) => value[f.key] !== ADVANCED_PARAMS_DEFAULT[f.key]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-navy transition-colors"
      >
        <span className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>›</span>
        Parámetros avanzados de gastos e impuestos
        {isModified && <span className="h-1.5 w-1.5 rounded-full bg-copper" />}
      </button>

      {open && (
        <div className="mt-4 rounded-xl bg-arena-dark/40 border border-navy/10 p-4 sm:p-5">
          <div className="grid sm:grid-cols-2 gap-5">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold uppercase tracking-wide text-navy/50 mb-1.5">
                  {field.label}
                </label>
                <div className="flex items-center rounded-xl border border-navy/15 bg-white px-4 py-2.5">
                  <span className="text-navy/40 mr-1">%</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={Number((value[field.key] * 100).toFixed(2))}
                    onChange={(e) => {
                      const pct = Number(e.target.value);
                      onChange({ ...value, [field.key]: Number.isFinite(pct) ? pct / 100 : 0 });
                    }}
                    className="w-full outline-none text-navy font-medium"
                  />
                </div>
                <p className="text-xs text-navy/45 mt-1.5 leading-relaxed">{field.help}</p>
              </div>
            ))}
          </div>

          {isModified && (
            <button
              type="button"
              onClick={() => onChange(ADVANCED_PARAMS_DEFAULT)}
              className="mt-4 text-xs font-medium text-navy/50 hover:text-copper underline underline-offset-2"
            >
              Restablecer valores base del modelo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

const CONTACT_EMAIL = "ventas@smartstay.com";

export function ActionBar({ resumenTexto }: { resumenTexto: string }) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(resumenTexto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles no disponible; se ignora silenciosamente.
    }
  };

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Solicito asesoría — Condo Resort Heritage"
  )}&body=${encodeURIComponent(resumenTexto)}`;

  return (
    <section className="bg-navy-deep py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-arena font-medium">
            ¿Listo para invertir en Heritage?
          </h2>
          <p className="text-arena/60 text-sm mt-1 max-w-md">
            Comparte tu simulación con nuestro equipo o guárdala para tomar la mejor decisión de
            inversión.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-arena/20 text-arena px-5 py-3 text-sm font-medium hover:bg-arena/5 transition-colors"
          >
            ↓ Descargar PDF
          </button>
          <button
            type="button"
            onClick={handleCopiar}
            className="inline-flex items-center gap-2 rounded-xl border border-arena/20 text-arena px-5 py-3 text-sm font-medium hover:bg-arena/5 transition-colors"
          >
            {copiado ? "✓ Copiado" : "⧉ Copiar resumen"}
          </button>
          <a
            href={mailtoHref}
            className="inline-flex items-center gap-2 rounded-xl bg-gold hover:bg-gold-light transition-colors text-navy-deep px-5 py-3 text-sm font-semibold"
          >
            Solicitar asesoría
          </a>
        </div>
      </div>
    </section>
  );
}

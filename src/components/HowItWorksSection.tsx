import { DISCLAIMER } from "@/lib/data";

const STEPS = [
  {
    title: "Ingresos por hospedaje",
    body: "Tarifa promedio diaria (ADR) × 350 días efectivos × % de ocupación proyectada, por cada tipología.",
  },
  {
    title: "Costos comerciales",
    body: "Comisión de canales online (OTAs) y aporte al Fondo FARA de mantenimiento, sobre las ventas brutas.",
  },
  {
    title: "Gastos operativos",
    body: "Nómina, servicios públicos, marketing, administración, seguros y demás gastos de operación del resort.",
  },
  {
    title: "Comisión de administración",
    body: "Honorarios de Smart Stay sobre la utilidad operacional, por la gestión hotelera de las 108 unidades.",
  },
  {
    title: "Utilidad y rentabilidad",
    body: "Utilidad neta del inversionista frente al monto invertido, en términos mensuales y anuales.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-arena py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-2xl border border-navy/10 bg-white p-6 sm:p-8">
          <h2 className="font-serif-display text-2xl sm:text-3xl text-navy font-medium mb-3">
            ¿Cómo se calcula la rentabilidad?
          </h2>
          <p className="text-navy/60 leading-relaxed max-w-3xl">
            Este simulador estima los ingresos potenciales de un apartamento en Condo Resort
            Heritage operado en pool hotelero, tomando como base la tarifa promedio diaria,
            la ocupación proyectada, los costos comerciales, los gastos operativos y la comisión
            de administración de Smart Stay. El resultado muestra la utilidad neta estimada del
            inversionista y su rentabilidad frente al valor de inversión.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-xl bg-arena/60 p-4">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-navy text-xs font-semibold mb-2">
                  {i + 1}
                </span>
                <p className="font-medium text-navy text-sm mb-1">{step.title}</p>
                <p className="text-navy/55 text-xs leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-6 sm:p-8">
          <p className="text-copper text-xs font-semibold uppercase tracking-wide mb-2">
            Aviso legal y comercial
          </p>
          <p className="text-navy/60 text-sm leading-relaxed">
            Las cifras presentadas son proyecciones estimadas con base en supuestos operativos y
            comerciales del modelo de Smart Stay. No constituyen promesa de rentabilidad fija,
            garantía financiera ni oferta pública de valores. {DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  );
}

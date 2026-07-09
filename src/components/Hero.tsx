"use client";

export function Hero() {
  const handleSimularClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 15% 0%, rgba(198,161,91,0.22), transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(47,109,92,0.28), transparent 50%), linear-gradient(180deg, #0d2438 0%, #081729 100%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <span className="inline-block rounded-full border border-arena/20 px-4 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase text-arena/70 mb-6">
          Inversión inmobiliaria · Renta corta · Cartagena
        </span>

        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl text-arena font-medium leading-[1.08] max-w-3xl">
          Simulador de rentabilidad
        </h1>

        <p className="text-arena/70 text-base sm:text-lg mt-5 max-w-2xl leading-relaxed">
          Proyecta tus ingresos por renta corta, costos operativos y rentabilidad neta estimada,
          mensual y anual, de acuerdo con cuánto inviertes en Condo Resort Heritage.
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-8">
          <a
            href="#simulador"
            onClick={handleSimularClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold hover:bg-gold-light transition-colors text-navy-deep font-semibold px-6 py-3.5 text-sm uppercase tracking-wide shadow-lg shadow-gold/20"
          >
            Simular mi rentabilidad
            <span aria-hidden>→</span>
          </a>
          <span className="text-arena/50 text-sm">
            108 apartamentos de 1 y 2 habitaciones · Operación hotelera Smart Stay
          </span>
        </div>

        <p className="text-arena/35 text-xs mt-8">
          Modelo financiero estimado sujeto a variaciones comerciales, operativas y de mercado.
        </p>
      </div>
    </section>
  );
}

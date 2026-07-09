import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="relative z-10 bg-navy-deep border-b border-arena/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        <a href="#" className="flex items-center">
          <Image
            src="/smart-stay-logo.svg"
            alt="Smart Stay"
            width={383}
            height={198}
            className="h-9 sm:h-10 w-auto"
            priority
          />
        </a>

        <div className="flex items-center gap-3">
          <span className="text-arena/30 text-xs hidden sm:inline">Proyecto</span>
          <Image
            src="/logo_karibana_cartagena.png"
            alt="Karibana Cartagena"
            width={229}
            height={70}
            className="h-6 sm:h-7 w-auto"
          />
        </div>
      </div>
    </header>
  );
}

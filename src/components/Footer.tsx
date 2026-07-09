import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-navy-deep py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src="/smart-stay-logo.svg"
            alt="Smart Stay"
            width={383}
            height={198}
            className="h-6 w-auto"
          />
          <span className="h-5 w-px bg-arena/15" />
          <Image
            src="/logo_karibana_cartagena.png"
            alt="Karibana Cartagena"
            width={229}
            height={70}
            className="h-4 w-auto"
          />
        </div>
        <p className="text-arena/40 text-xs text-center sm:text-right">
          © {new Date().getFullYear()} Condo Resort Heritage · Comercializado por Smart Stay. Todos
          los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

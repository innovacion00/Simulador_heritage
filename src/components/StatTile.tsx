import { ReactNode } from "react";

export function StatTile({
  icon,
  label,
  value,
  subValue,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  subValue?: ReactNode;
  tone?: "neutral" | "positive";
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4 sm:p-5">
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full mb-3 ${
          tone === "positive" ? "bg-optimista/10 text-optimista" : "bg-navy/5 text-navy/60"
        }`}
      >
        {icon}
      </span>
      <p className="text-xs font-medium uppercase tracking-wide text-navy/45 leading-snug">{label}</p>
      <p
        className={`text-lg sm:text-xl font-semibold mt-1.5 num-transition break-words ${
          tone === "positive" ? "text-optimista" : "text-navy"
        }`}
      >
        {value}
      </p>
      {subValue && <p className="text-xs text-navy/40 mt-0.5">{subValue}</p>}
    </div>
  );
}

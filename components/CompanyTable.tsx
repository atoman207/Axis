"use client";

import { useI18n } from "@/components/PreferencesProvider";

/** The company facts as a definition list. */
export default function CompanyTable() {
  const { t } = useI18n();
  const rows = t.company.rows;

  return (
    <dl className="overflow-hidden rounded-2xl border border-line bg-surface">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex flex-col gap-1.5 px-6 py-5 sm:flex-row sm:gap-8 ${
            i < rows.length - 1 ? "border-b border-line-soft" : ""
          }`}
        >
          <dt className="w-28 flex-shrink-0 text-sm font-semibold text-sumi">{row.label}</dt>
          <dd className="text-sm leading-relaxed text-ink-soft">
            {row.href ? (
              <a
                href={row.href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-accent underline underline-offset-4 hover:text-accent-strong"
              >
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

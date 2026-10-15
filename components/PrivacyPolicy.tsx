"use client";

import { useI18n } from "@/components/PreferencesProvider";

export default function PrivacyPolicy() {
  const { t } = useI18n();
  const policy = t.privacy;

  return (
    <section className="section-padding relative">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-lg font-bold leading-snug text-sumi sm:text-xl md:text-2xl">
          {policy.policyTitle}
        </h2>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-soft sm:mt-6 sm:leading-loose md:text-base">
          {policy.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 space-y-10 sm:mt-14 sm:space-y-12">
          {policy.sections.map((section) => (
            <article key={section.title}>
              <h3 className="border-l-4 border-accent pl-3 text-base font-bold leading-snug sm:pl-4 sm:text-lg md:text-xl">
                {section.title}
              </h3>

              <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-soft sm:leading-loose md:text-base">
                {"body" in section &&
                  section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

                {"table" in section && section.table && (
                  <>
                    {/* Mobile: stacked rows (no horizontal scroll) */}
                    <dl className="space-y-3 sm:hidden">
                      {section.table.map((row) => (
                        <div
                          key={row.label}
                          className="rounded-xl border border-line bg-surface px-4 py-3"
                        >
                          <dt className="text-xs font-semibold tracking-wide text-sumi">
                            {row.label}
                          </dt>
                          <dd className="mt-1.5 break-words text-ink-soft">{row.value}</dd>
                        </div>
                      ))}
                    </dl>

                    {/* Tablet / desktop: table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-line sm:block">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          {section.table.map((row) => (
                            <tr key={row.label} className="border-b border-line last:border-b-0">
                              <th className="w-[34%] whitespace-nowrap bg-sunken px-4 py-3 align-top font-semibold text-sumi md:w-[38%]">
                                {row.label}
                              </th>
                              <td className="break-words px-4 py-3 text-ink-soft">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {"numbered" in section && section.numbered && (
                  <ol className="list-decimal space-y-2 pl-5 marker:text-muted">
                    {section.numbered.map((item) => (
                      <li key={item} className="pl-1">
                        {item}
                      </li>
                    ))}
                  </ol>
                )}

                {"bullets" in section && section.bullets && (
                  <ul className="list-disc space-y-2 pl-5 marker:text-muted">
                    {section.bullets.map((item) => (
                      <li key={item} className="pl-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {"subsections" in section &&
                  section.subsections?.map((sub) => (
                    <div key={sub.heading} className="space-y-3">
                      <p className="font-semibold text-sumi">{sub.heading}</p>
                      {"body" in sub &&
                        sub.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      {"bullets" in sub && sub.bullets && (
                        <ul className="list-disc space-y-2 pl-5 marker:text-muted">
                          {sub.bullets.map((item) => (
                            <li key={item} className="pl-1">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {"numbered" in sub && sub.numbered && (
                        <ol className="list-decimal space-y-2 pl-5 marker:text-muted">
                          {sub.numbered.map((item) => (
                            <li key={item} className="pl-1">
                              {item}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}

                {"after" in section &&
                  section.after?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

                {"links" in section &&
                  section.links?.map((link) => (
                    <p key={link.href} className="break-all">
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline underline-offset-2 hover:text-accent-strong"
                      >
                        {link.label}
                      </a>
                    </p>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

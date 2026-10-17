"use client";

import Link from "next/link";
import { useI18n } from "@/components/PreferencesProvider";
import SiteButton from "@/components/SiteButton";
import SiteLogo from "@/components/SiteLogo";
import { COMPANY, GOOGLE_MAP_URL } from "@/lib/company";
import { NAV_ITEMS } from "@/lib/navigation";

const contactChannels = [
  {
    name: "Email",
    href: null,
    icon: "/icons/mail.svg",
    chip: "bg-white",
    iconClass: "h-5 w-5 object-contain",
    external: false,
  },
  {
    name: "Chatwork",
    href: "https://www.chatwork.com/koholab",
    icon: "/icons/chatwork.svg",
    chip: "bg-transparent p-0",
    iconClass: "h-10 w-10 rounded-lg object-contain",
    external: true,
  },
  {
    name: "note",
    href: "https://note.com/koholab",
    icon: "/icons/note.svg",
    chip: "bg-white",
    iconClass: "h-5 w-5 object-contain",
    external: true,
  },
  {
    name: "LINE",
    href: "https://line.me/ti/p/XSUZTyrXGh",
    icon: "/icons/line.svg",
    chip: "bg-white",
    iconClass: "h-5 w-5 object-contain",
    external: true,
  },
  {
    name: "YOUTRUST",
    href: "https://youtrust.jp/users/4c12c75a8320d69bbca6ef854e6cf876",
    icon: "/icons/youtrust.png",
    chip: "bg-white",
    iconClass: "h-6 w-6 object-contain",
    external: true,
  },
] as const;

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export default function Footer() {
  const { lang, t } = useI18n();
  const showJa = lang === "ja";
  const address = showJa ? COMPANY.address : COMPANY.addressEn;

  return (
    <footer className="relative bg-footer overflow-hidden space:backdrop-blur-sm">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative mx-auto max-w-screen-2xl px-5 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16">
        <div className="mb-10 grid grid-cols-1 gap-10 md:mb-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" aria-label={t.header.home} className="mb-5 flex w-fit items-center">
              <SiteLogo tone="onDark" />
            </Link>
            <p className="text-sm leading-relaxed text-white/70">
              {t.footer.tagline[0]}<br />{t.footer.tagline[1]}
            </p>
            <address className="mt-5 text-sm not-italic leading-relaxed text-white/70">
              {address}
            </address>
            <a
              href={GOOGLE_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
            >
              {t.access.openMap}
              <ExternalIcon />
            </a>
          </div>

          {/* Sitemap */}
          <nav className="md:col-span-3" aria-label={t.footer.sitemap}>
            <p className="mb-4 text-xs tracking-widest text-white/50 uppercase">{t.footer.sitemap}</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 md:grid-cols-1">
              <li>
                <Link href="/" className="text-sm text-white/70 transition-colors hover:text-white">
                  {showJa ? t.nav.home : "HOME"}
                </Link>
              </li>
              {NAV_ITEMS.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {showJa ? t.nav[link.key] : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="mb-4 text-xs tracking-widest text-white/50 uppercase">{t.footer.contact}</p>

            <SiteButton href="/contact" tone="onDark" className="px-6 py-2.5">
              {t.footer.contactButton}
            </SiteButton>

            <a
              href={COMPANY.lancersUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.footer.lancers}
              title={t.footer.lancers}
              className="group mt-5 flex w-fit items-center gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMPANY.logo}
                alt={t.footer.lancers}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-white/20 transition group-hover:ring-white/50 group-hover:scale-105"
                draggable={false}
              />
              <span className="text-sm text-white/85 transition-colors group-hover:text-white">
                {t.footer.lancers}
              </span>
            </a>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {contactChannels.map((channel) => {
                const chipClass = `flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${channel.chip}`;
                const icon = (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={channel.icon}
                    alt={channel.name}
                    className={channel.iconClass}
                    draggable={false}
                  />
                );

                // Email is display-only for now (no mailto)
                if (!channel.href) {
                  return (
                    <span
                      key={channel.name}
                      role="img"
                      aria-label={channel.name}
                      title={channel.name}
                      className={`${chipClass} cursor-default`}
                    >
                      {icon}
                    </span>
                  );
                }

                return (
                  <a
                    key={channel.name}
                    href={channel.href}
                    aria-label={channel.name}
                    title={channel.name}
                    {...(channel.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={`${chipClass} transition hover:scale-105`}
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 sm:pt-8">
          {/* inset so the floating chat / back-to-top buttons never cover the small print */}
          <div className="flex flex-col items-center justify-between gap-4 px-14 sm:flex-row sm:px-20">
          <p className="text-white/45 text-xs">© {new Date().getFullYear()} {COMPANY.name}</p>
          <Link href="/privacy" className="text-xs text-white/45 hover:text-white/80 transition-colors">
            {t.footer.privacy}
          </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

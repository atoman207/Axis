import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource/noto-sans-jp/300.css";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-serif-jp/400.css";
import "@fontsource/noto-serif-jp/600.css";
import "@fontsource/noto-serif-jp/700.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import PreferencesProvider from "@/components/PreferencesProvider";
import SpaceBackground from "@/components/SpaceBackground";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { DEFAULT_LANG, DEFAULT_THEME } from "@/lib/preferences/config";

const meta = dictionaries[DEFAULT_LANG].meta;

export const metadata: Metadata = {
  title: {
    default: meta.title,
    template: `%s | ${meta.siteName}`,
  },
  description: meta.description,
  keywords: meta.keywords,
  openGraph: {
    title: meta.title,
    description: meta.description,
    siteName: meta.siteName,
    locale: meta.ogLocale,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: meta.title,
    description: meta.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Defaults keep the whole tree static (Hobby ≤12 serverless functions).
  // Cookies are applied before paint via the bootstrap script, then hydrated in PreferencesProvider.
  return (
    <html
      lang={DEFAULT_LANG}
      data-theme={DEFAULT_THEME}
      data-scroll-behavior="smooth"
      className="h-full"
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <Script id="pref-bootstrap" strategy="beforeInteractive">{`
          (function () {
            try {
              var c = document.cookie || "";
              function get(n) {
                var m = c.match(new RegExp("(?:^|; )" + n + "=([^;]*)"));
                return m ? decodeURIComponent(m[1]) : "";
              }
              var lang = get("axis-lang");
              var theme = get("axis-theme");
              if (lang === "ja" || lang === "en") document.documentElement.lang = lang;
              if (theme === "space" || theme === "light") document.documentElement.dataset.theme = theme;
            } catch (e) {}
          })();
        `}</Script>
        <Script id="clear-stale-sw" strategy="beforeInteractive">{`
          (function () {
            if (!("serviceWorker" in navigator)) return;
            navigator.serviceWorker.getRegistrations().then(function (regs) {
              var hadWorker = regs.length > 0;
              return Promise.all(regs.map(function (r) { return r.unregister(); })).then(function () {
                if (!("caches" in window)) return hadWorker;
                return caches.keys().then(function (keys) {
                  return Promise.all(keys.map(function (k) { return caches.delete(k); }));
                }).then(function () { return hadWorker; });
              });
            }).then(function (hadWorker) {
              if (hadWorker) window.location.reload();
            });
          })();
        `}</Script>
        <PreferencesProvider initialLang={DEFAULT_LANG} initialTheme={DEFAULT_THEME}>
          <SpaceBackground />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingWidgets />
          </div>
        </PreferencesProvider>
      </body>
    </html>
  );
}

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
import { getPreferences } from "@/lib/preferences/server";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getPreferences();
  const { meta } = dictionaries[lang];

  return {
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Language and background come from cookies, so the first paint is already right.
  const { lang, theme } = await getPreferences();

  return (
    // data-scroll-behavior: page-to-page navigation jumps to the top instead of smooth-scrolling there
    <html lang={lang} data-theme={theme} data-scroll-behavior="smooth" className="h-full">
      <body className="min-h-full antialiased">
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
        <PreferencesProvider initialLang={lang} initialTheme={theme}>
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

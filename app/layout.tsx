import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import ClickRipples from "@/components/motion/ClickRipples";
import FlightCursor from "@/components/motion/FlightCursor";
import MotionProvider from "@/components/motion/MotionProvider";
import NavigationProgress from "@/components/motion/NavigationProgress";
import PreferencesProvider from "@/components/PreferencesProvider";
import SpaceBackground from "@/components/SpaceBackground";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { DEFAULT_LANG, DEFAULT_THEME } from "@/lib/preferences/config";

const meta = dictionaries[DEFAULT_LANG].meta;

// Load fonts via CSS links (not next/font/google). Next 16 intermittently fails
// builds when Google returns extensionless /l/font?kit=… URLs
// (turbopack: "queries have exactly one entry"). Links keep fonts off the
// serverless bundle and make Vercel builds deterministic.
const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Jost:wght@400;500&family=Noto+Sans+JP:wght@300;400;500;700&family=Shippori+Mincho:wght@500;600;700&display=swap";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_STYLESHEET} />
      </head>
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
          <MotionProvider>
            <NavigationProgress />
            <ClickRipples />
            <FlightCursor />
            <SpaceBackground />
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingWidgets />
            </div>
          </MotionProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/react";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/sanity/queries";
import { pickLocale } from "@/lib/sanity/locale";
import { urlFor } from "@/lib/sanity/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-display-local",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const bodyFont = Inter({
  variable: "--font-body-local",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono-local",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const settings = await getSiteSettings();

  const siteName = settings?.name || t("name");
  const description =
    pickLocale(settings?.tagline, locale as Locale) ||
    `${t("role")} — ${t("location")}`;
  const ogImages = settings?.defaultOgImage
    ? [urlFor(settings.defaultOgImage).width(1200).height(630).fit("crop").url()]
    : undefined;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: siteName,
      template: `%s — ${siteName}`,
    },
    description,
    openGraph: { title: siteName, description, images: ogImages },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, l === routing.defaultLocale ? "/" : `/${l}`]),
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-bg font-sans text-fg antialiased">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

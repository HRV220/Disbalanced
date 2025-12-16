import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Disbalanced - Анализ глубины рынка",
    template: "%s | Disbalanced",
  },
  description:
    "Профессиональный инструмент для анализа глубины рынка криптовалют. Order Book индикаторы для BTC, ETH и альткоинов.",
  keywords: [
    "криптовалюта",
    "трейдинг",
    "order book",
    "глубина рынка",
    "BTC",
    "ETH",
    "индикаторы",
  ],
  authors: [{ name: "Disbalanced" }],
  creator: "Disbalanced",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <Script
          src="/charting_library/charting_library.standalone.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

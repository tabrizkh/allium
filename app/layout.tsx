import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

import Providers from "../components/Providers";
import SessionSync from "../components/SessionSync";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "allium",
  description: "Интернет-магазин цветов allium — лаконичный и красивый",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning data-theme="light">
      <body className={`${raleway.variable} antialiased`}>
        {/* Инициализация темы до гидратации: читаем localStorage и ставим data-theme */}
        <script dangerouslySetInnerHTML={{
          __html: `(() => { try { const t = localStorage.getItem('allium-theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch(_){} })();`
        }} />
        <Providers>
          <SessionSync />
          <Header />
          {children}
        </Providers>
        <div id="contacts">
          <Footer />
        </div>
      </body>
    </html>
  );
}

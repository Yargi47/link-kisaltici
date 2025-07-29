import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Link Kısaltıcı - Hızlı ve Güvenilir URL Kısaltma",
  description: "Uzun linklerinizi saniyeler içinde kısaltın. QR kod oluşturma, detaylı istatistikler ve özel kodlar ile modern link kısaltıcı hizmeti.",
  keywords: "link kısaltıcı, url kısaltma, qr kod, istatistik, bitly alternatifu",
  authors: [{ name: "Link Kısaltıcı" }],
  openGraph: {
    title: "Link Kısaltıcı - Hızlı ve Güvenilir URL Kısaltma",
    description: "Uzun linklerinizi saniyeler içinde kısaltın. QR kod oluşturma, detaylı istatistikler ve özel kodlar ile modern link kısaltıcı hizmeti.",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Kısaltıcı - Hızlı ve Güvenilir URL Kısaltma",
    description: "Uzun linklerinizi saniyeler içinde kısaltın. QR kod oluşturma, detaylı istatistikler ve özel kodlar ile modern link kısaltıcı hizmeti.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

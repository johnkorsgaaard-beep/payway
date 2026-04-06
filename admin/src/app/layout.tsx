import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  title: "Payway Admin",
  description: "Administration dashboard for Payway - Faroe Islands payment platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

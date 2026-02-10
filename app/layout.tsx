import type { Metadata } from "next";
import { Outfit, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUKI - Your Anime Degen Analyst",
  description: "Analyze your Solana wallet trades with SUKI, an AI-powered anime analyst that calculates your Degen Score, tracks PnL, and roasts your trading habits.",
  keywords: ["Solana", "crypto", "trading", "wallet analyzer", "degen score", "PnL tracker"],
  authors: [{ name: "SUKI" }],
  openGraph: {
    title: "SUKI - Your Anime Degen Analyst",
    description: "Get your Degen Score and analyze your Solana trading patterns with an anime AI assistant.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUKI - Your Anime Degen Analyst",
    description: "Analyze your Solana wallet with SUKI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body className="anime-bg noise antialiased">
        {children}
      </body>
    </html>
  );
}

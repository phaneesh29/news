import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono, Playfair_Display, UnifrakturMaguntia } from "next/font/google";
import { SettingsProvider } from "@/components/SettingsProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const blackletter = UnifrakturMaguntia({
  variable: "--font-blackletter",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "DevBits | Retro-Cyber Editorial News Curation",
  description: "AI-enriched engineering news briefs, acquisitions, and strategic deep dives.",
};

export default function RootLayout({
  children,
  ...props
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable} ${playfair.variable} ${blackletter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}


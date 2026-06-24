import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono, Playfair_Display, UnifrakturMaguntia } from "next/font/google";
import { SettingsProvider } from "@/components/SettingsProvider";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  metadataBase: new URL("https://devbits.com"),
  title: {
    template: "%s | DevBits",
    default: "DevBits | Retro-Cyber Editorial News Curation",
  },
  description: "AI-enriched engineering news briefs, acquisitions, and strategic deep dives.",
  openGraph: {
    title: "DevBits | Retro-Cyber Editorial News Curation",
    description: "AI-enriched engineering news briefs, acquisitions, and strategic deep dives.",
    url: "https://devbits.com",
    siteName: "DevBits",
    images: [
      {
        url: "/devbits-logo.png",
        width: 1200,
        height: 630,
        alt: "DevBits Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevBits | Retro-Cyber Editorial News Curation",
    description: "AI-enriched engineering news briefs, acquisitions, and strategic deep dives.",
    images: ["/devbits-logo.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
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
        <TooltipProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Playfair_Display, Old_Standard_TT, Alegreya, Courier_Prime, VT323 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
 subsets: ["latin"],
 variable: "--font-playfair",
});

const oldStandard = Old_Standard_TT({
 weight: ["400", "700"],
 subsets: ["latin"],
 variable: "--font-old-standard",
});

const alegreya = Alegreya({
 subsets: ["latin"],
 variable: "--font-alegreya",
});

const courier = Courier_Prime({
 weight: ["400", "700"],
 subsets: ["latin"],
 variable: "--font-courier",
});

const vt323 = VT323({
 weight: ["400"],
 subsets: ["latin"],
 variable: "--font-vt323",
});

export const metadata: Metadata = {
 title: "DEV.NEWS | Neural Archive",
 description: "Dossier & Cybermag fusion admin portal.",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="en"
 className={`${playfair.variable} ${oldStandard.variable} ${alegreya.variable} ${courier.variable} ${vt323.variable} h-full antialiased`}
 >
 <body className="min-h-full flex flex-col">{children}</body>
 </html>
 );
}




import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mittagessen Ranking",
  description: "Bewerte das tägliche Mittagessen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-cream text-charcoal`}
      >
        <main className="mx-auto max-w-[480px] min-h-screen px-6">
          {children}
        </main>
      </body>
    </html>
  );
}

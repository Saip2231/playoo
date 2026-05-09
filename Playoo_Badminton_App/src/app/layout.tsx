import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../components/layout/Providers";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Playoo — Premium Badminton Matchmaker",
  description: "Book premium Badminton courts and discover matching local players in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

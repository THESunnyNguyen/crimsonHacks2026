import type { Metadata, Viewport } from "next";
import { Nunito, Shrikhand } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const display = Shrikhand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-shrikhand",
});
const body = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: site.name,
  description: site.tagline,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-cream font-body text-cocoa antialiased">
        {children}
      </body>
    </html>
  );
}

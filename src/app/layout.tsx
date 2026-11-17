import type { Metadata } from "next";
import { Fira_Sans, Raleway } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/utils";

const display = Raleway({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

const sans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Kapchorwa Senior Secondary School | Knowledge Is Our Future Light",
    template: "%s | Kapchorwa Senior Secondary School",
  },
  description:
    "Kapchorwa Senior Secondary School is a government-aided mixed day secondary school in Kawowo, Kapchorwa Municipality, Uganda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}

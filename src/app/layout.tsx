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
    default: "Jinja College | Strive to Excel",
    template: "%s | Jinja College",
  },
  description:
    "Jinja College is a government-aided boys' boarding secondary school on Rubaga Hill, Jinja City, Uganda.",
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

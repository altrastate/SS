import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "College administration",
    template: "%s | KSS admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-full bg-ivory text-charcoal">{children}</div>;
}

import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light" | "gold";
};

export function PrimaryButton({ href, children, className, tone = "dark" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors",
        tone === "light"
          ? "border-ivory bg-ivory text-navy hover:bg-white"
          : tone === "gold"
            ? "border-gold bg-gold text-navy hover:bg-gold-soft"
            : "border-navy bg-navy text-white hover:bg-navy-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({ href, children, className, tone = "light" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors",
        tone === "light"
          ? "border-gold text-ivory hover:bg-white/10"
          : "border-navy/20 text-navy hover:border-gold hover:text-gold-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function GhostButton({ href, children, className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full border border-navy/20 bg-transparent px-5 py-2.5 text-sm font-semibold tracking-wide text-navy transition-colors hover:border-gold hover:text-gold-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

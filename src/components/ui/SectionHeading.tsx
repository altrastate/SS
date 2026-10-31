import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light,
}: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-bold uppercase tracking-[0.18em]",
            light ? "text-gold-soft" : "text-gold-ink",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-serif text-3xl leading-tight sm:text-4xl",
          light ? "text-ivory" : "text-navy",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 text-base sm:text-lg", light ? "text-ivory/80" : "text-muted")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

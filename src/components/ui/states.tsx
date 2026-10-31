import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("border border-dashed border-navy/20 bg-white px-6 py-10 text-center", className)}>
      <p className="font-serif text-2xl text-navy">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-muted">{description}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="border border-navy/10 bg-white px-6 py-10 text-center" role="status">
      <p className="text-muted">{label}…</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <div className="border border-danger/30 bg-white px-6 py-10 text-center" role="alert">
      <p className="font-serif text-2xl text-navy">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-muted">{description}</p>
    </div>
  );
}

export function VerifyNotice({ children }: { children: React.ReactNode }) {
  return <aside className="notice text-sm">{children}</aside>;
}

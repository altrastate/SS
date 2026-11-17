import { GhostButton, PrimaryButton } from "@/components/ui/buttons";

export default function SiteNotFound() {
  return (
    <div className="container-page py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-ink">Page not found</p>
      <h1 className="mt-4 font-serif text-4xl text-navy">This page is not available</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        The address may be incorrect, or the page may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <PrimaryButton href="/">Back to homepage</PrimaryButton>
        <GhostButton href="/contact">Contact the school</GhostButton>
      </div>
    </div>
  );
}

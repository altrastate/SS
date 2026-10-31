import { GhostButton, PrimaryButton } from "@/components/ui/buttons";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-ink">Page not found</p>
        <h1 className="mt-4 font-serif text-4xl text-navy">This page is not available</h1>
        <p className="mt-4 text-muted">
          The address may be incorrect, or the page may have been moved. Return to the college homepage
          or browse the main sections of the website.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <PrimaryButton href="/">Back to homepage</PrimaryButton>
          <GhostButton href="/contact">Contact the college</GhostButton>
        </div>
      </div>
    </main>
  );
}

"use client";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="font-serif text-4xl text-navy">This page could not be loaded</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        Please try again. If the problem continues, contact the college office.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 bg-navy px-5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}

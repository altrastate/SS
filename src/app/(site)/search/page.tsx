import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/states";
import { recordAnalyticsEvent, sanitizeSearchTerm } from "@/lib/analytics";
import { searchPublishedContent } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  return pageMetadata({
    title: "Search",
    description: "Search published Kapchorwa Senior Secondary School pages, news, events, documents, and alumni content.",
    path: "/search",
  });
}

const TYPE_LABELS: Record<string, string> = {
  page: "Page",
  news: "News",
  event: "Event",
  document: "Document",
  alumni: "Alumni",
  project: "Project",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const page = Number(params.page || 1) || 1;
  const results = query ? await searchPublishedContent(query, page, 12) : { items: [], total: 0, page: 1, pageCount: 1, pageSize: 12 };

  if (query) {
    const term = sanitizeSearchTerm(query);
    await recordAnalyticsEvent("search", "/search", term);
  }

  return (
    <>
      <PageHero
        eyebrow="Find published information"
        title="Search"
        description="Search covers published pages, news, events, approved documents, and alumni or development content. Drafts and private records are not included."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/search", label: "Search" },
        ]}
      />
      <section className="py-16">
        <div className="container-narrow">
          <form method="get" className="flex flex-col gap-3 sm:flex-row" role="search">
            <label className="sr-only" htmlFor="site-search">
              Search the website
            </label>
            <input
              id="site-search"
              name="q"
              defaultValue={query}
              placeholder="Search published content"
              className="min-h-11 flex-1 border border-navy/20 px-3"
            />
            <button type="submit" className="min-h-11 bg-navy px-5 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          {query ? (
            <p className="mt-6 text-sm text-muted">
              {results.total === 1 ? "1 result" : `${results.total} results`} for “{query}”
            </p>
          ) : (
            <p className="mt-6 text-muted">Enter a word or phrase to search published college information.</p>
          )}

          {query && !results.items.length ? (
            <div className="mt-8">
              <EmptyState
                title="No published matches"
                description="Try a simpler term, or browse news, events, and downloads. Unpublished drafts never appear here."
              />
            </div>
          ) : null}

          <ul className="mt-8 space-y-4">
            {results.items.map((item) => (
              <li key={`${item.type}-${item.href}-${item.title}`} className="border border-navy/10 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">{TYPE_LABELS[item.type]}</p>
                <h2 className="mt-2 font-serif text-2xl">
                  <Link href={item.href} className="text-navy hover:underline">
                    {item.title}
                  </Link>
                </h2>
                <p className="mt-2 text-muted">{item.summary}</p>
              </li>
            ))}
          </ul>

          {results.pageCount > 1 ? (
            <nav aria-label="Search pages" className="mt-10 flex flex-wrap gap-2">
              {Array.from({ length: results.pageCount }, (_, index) => {
                const number = index + 1;
                return (
                  <Link
                    key={number}
                    href={`/search?q=${encodeURIComponent(query)}&page=${number}`}
                    className={cn(
                      "inline-flex min-h-11 min-w-11 items-center justify-center border px-3 text-sm",
                      number === results.page ? "border-navy bg-navy text-white" : "border-navy/20 text-navy",
                    )}
                    aria-current={number === results.page ? "page" : undefined}
                  >
                    {number}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}

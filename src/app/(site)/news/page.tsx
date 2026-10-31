import Link from "next/link";
import { EventCard } from "@/components/ui/cards";
import { NewsGrid } from "@/components/ui/NewsGrid";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/states";
import { getPublishedEvents, getPublishedNews } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  return pageMetadata({
    title: "News & Events",
    description: "Official news, announcements, and events from Jinja College.",
    path: "/news",
  });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page || 1) || 1;
  const query = params.q?.trim() || "";
  const category = params.category?.trim() || "";

  const [{ items, total, pageCount, categories }, events] = await Promise.all([
    getPublishedNews({ query, category, page, pageSize: 9 }),
    getPublishedEvents(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="College notices"
        title="News and events"
        description="Only content approved for public release is listed here."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/news", label: "News" },
        ]}
      />

      <section className="py-16">
        <div className="container-page">
          <form className="grid gap-3 border border-navy/10 bg-white p-4 sm:grid-cols-[1fr_12rem_auto]" method="get">
            <label className="sr-only" htmlFor="news-search">
              Search articles
            </label>
            <input
              id="news-search"
              name="q"
              defaultValue={query}
              placeholder="Search published articles"
              className="min-h-11 border border-navy/20 px-3"
            />
            <label className="sr-only" htmlFor="news-category">
              Category
            </label>
            <select
              id="news-category"
              name="category"
              defaultValue={category}
              className="min-h-11 border border-navy/20 px-3"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button type="submit" className="min-h-11 bg-navy px-4 text-sm font-semibold text-white">
              Filter
            </button>
          </form>

          <div className="mt-10">
            {items.length ? (
              <NewsGrid items={items} />
            ) : (
              <EmptyState
                title={query || category ? "No matching articles" : "No news has been published yet"}
                description="When the school publishes notices, they will appear here. Draft articles are not shown to the public."
              />
            )}
          </div>

          {pageCount > 1 ? (
            <nav aria-label="News pages" className="mt-10 flex flex-wrap gap-2">
              {Array.from({ length: pageCount }, (_, index) => {
                const number = index + 1;
                const href = `/news?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&page=${number}`;
                return (
                  <Link
                    key={number}
                    href={href}
                    className={cn(
                      "inline-flex min-h-11 min-w-11 items-center justify-center border px-3 text-sm",
                      number === page ? "border-navy bg-navy text-white" : "border-navy/20 text-navy",
                    )}
                    aria-current={number === page ? "page" : undefined}
                  >
                    {number}
                  </Link>
                );
              })}
            </nav>
          ) : null}
          <p className="mt-4 text-sm text-muted">
            {total === 1 ? "1 published article" : `${total} published articles`}
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Diary" title="Events" />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {events.length ? (
              events.map((event) => (
                <EventCard
                  key={event.id}
                  href={`/events/${event.slug}`}
                  title={event.cancelled ? `Cancelled: ${event.title}` : event.title}
                  summary={event.summary}
                  date={event.startAt}
                  location={event.location}
                />
              ))
            ) : (
              <EmptyState
                className="md:col-span-2"
                title="No public events have been listed"
                description="Approved college events can be published from the content manager."
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

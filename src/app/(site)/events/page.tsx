import Link from "next/link";
import { EventCard } from "@/components/ui/cards";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/states";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { kampalaDayStamp, kampalaYearMonth, SCHOOL_TIMEZONE } from "@/lib/timezone";
import { isPublished } from "@/lib/utils";

export async function generateMetadata() {
  return pageMetadata({
    title: "Events",
    description: "Published Jinja College events and school calendar. Dates are shown in Africa/Kampala time.",
    path: "/events",
  });
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SCHOOL_TIMEZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1, 12)));
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; q?: string; category?: string; view?: string }>;
}) {
  const params = await searchParams;
  const now = kampalaYearMonth();
  const year = Number(params.year) || now.year;
  const month = Math.min(12, Math.max(1, Number(params.month) || now.month));
  const query = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const view = params.view === "calendar" ? "calendar" : "list";

  const published = await prisma.eventItem.findMany({
    where: {
      status: "published",
      archived: false,
      audience: { not: "alumni" },
    },
    orderBy: [{ startAt: "asc" }, { createdAt: "desc" }],
  });
  const live = published.filter((item) => isPublished(item.status, item.publishedAt));
  const categories = Array.from(new Set(live.map((item) => item.category))).sort();
  const filtered = live.filter((item) => {
    if (category && item.category !== category) return false;
    if (query && !`${item.title} ${item.summary} ${item.location || ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const nowDate = new Date();
  const upcoming = filtered.filter((item) => !item.startAt || item.startAt >= nowDate || (item.endAt && item.endAt >= nowDate));
  const past = filtered.filter((item) => item.startAt && item.startAt < nowDate && (!item.endAt || item.endAt < nowDate));

  const start = new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00${"+03:00"}`);
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = new Date(`${endYear}-${String(endMonth).padStart(2, "0")}-01T00:00:00${"+03:00"}`);
  const monthEvents = filtered.filter((item) => item.startAt && item.startAt >= start && item.startAt < end);
  const weekdayLabel = new Intl.DateTimeFormat("en-US", { timeZone: SCHOOL_TIMEZONE, weekday: "short" }).format(
    new Date(`${year}-${String(month).padStart(2, "0")}-01T12:00:00+03:00`),
  );
  const firstWeekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayLabel);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  return (
    <>
      <PageHero
        eyebrow="School calendar"
        title="Events"
        description="Only events published by authorised staff are listed. Times are Africa/Kampala."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/events", label: "Events" },
        ]}
      />
      <section className="py-16">
        <div className="container-page">
          <form className="grid gap-3 border border-navy/10 bg-white p-4 md:grid-cols-[1fr_12rem_auto_auto]" method="get">
            <label className="sr-only" htmlFor="event-search">
              Search events
            </label>
            <input id="event-search" name="q" defaultValue={query} placeholder="Search published events" className="min-h-11 border border-navy/20 px-3" />
            <select name="category" defaultValue={category} className="min-h-11 border border-navy/20 px-3" aria-label="Category">
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input type="hidden" name="view" value={view} />
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="month" value={month} />
            <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
              Filter
            </button>
            <Link
              href={`/events?view=${view === "calendar" ? "list" : "calendar"}&year=${year}&month=${month}&q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`}
              className="inline-flex min-h-11 items-center justify-center border border-navy px-4 text-sm font-semibold text-navy"
            >
              {view === "calendar" ? "List view" : "Calendar view"}
            </Link>
          </form>

          {view === "calendar" ? (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Link href={`/events?view=calendar&year=${prev.year}&month=${prev.month}`} className="text-sm font-semibold text-navy underline">
                  Previous month
                </Link>
                <h2 className="font-serif text-2xl text-navy">{monthLabel(year, month)}</h2>
                <Link href={`/events?view=calendar&year=${next.year}&month=${next.month}`} className="text-sm font-semibold text-navy underline">
                  Next month
                </Link>
              </div>
              <div className="grid grid-cols-7 border border-navy/10 bg-white text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="border-b border-navy/10 px-2 py-2 font-semibold text-navy">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstWeekday }, (_, index) => (
                  <div key={`empty-${index}`} className="min-h-24 border-b border-navy/10 p-2" />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const stamp = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = monthEvents.filter((item) => item.startAt && kampalaDayStamp(item.startAt) === stamp);
                  return (
                    <div key={stamp} className="min-h-24 border-b border-l border-navy/10 p-2">
                      <p className="text-xs font-semibold text-navy">{day}</p>
                      {dayEvents.map((item) => (
                        <Link key={item.id} href={`/events/${item.slug}`} className="mt-1 block truncate text-xs text-navy underline">
                          {item.cancelled ? `Cancelled: ${item.title}` : item.title}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="mt-12">
                <SectionHeading title="Upcoming events" />
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {upcoming.length ? (
                    upcoming.map((event) => (
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
                      title="No upcoming published events"
                      description="Approved college events will appear here. Draft or private diary items are not shown."
                    />
                  )}
                </div>
              </div>
              <div className="mt-16">
                <SectionHeading title="Past events" />
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {past.length ? (
                    past.map((event) => (
                      <EventCard
                        key={event.id}
                        href={`/events/${event.slug}`}
                        title={event.title}
                        summary={event.summary}
                        date={event.startAt}
                        location={event.location}
                      />
                    ))
                  ) : (
                    <EmptyState className="md:col-span-2" title="No past events in this archive" description="Published events remain listed after they have taken place." />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

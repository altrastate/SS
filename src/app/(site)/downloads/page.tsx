import { DownloadCard } from "@/components/ui/cards";
import { PageHero } from "@/components/ui/PageHero";
import { EmptyState } from "@/components/ui/states";
import { getDownloads } from "@/lib/content";
import { formatFileSize, fileTypeLabel } from "@/lib/files";
import { pageMetadata } from "@/lib/seo";
import { formatSchoolDate } from "@/lib/timezone";

export async function generateMetadata() {
  return pageMetadata({
    title: "Downloads",
    description: "Approved public documents from Jinja College.",
    path: "/downloads",
  });
}

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const items = await getDownloads(category || undefined, query || undefined);
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))) as string[];

  return (
    <>
      <PageHero
        eyebrow="Documents"
        title="Downloads"
        description="Only documents approved for public release are listed. Unpublished files are not shown."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/downloads", label: "Downloads" },
        ]}
      />
      <section className="py-16">
        <div className="container-page">
          <form className="grid gap-3 border border-navy/10 bg-white p-4 md:grid-cols-[1fr_14rem_auto]" method="get">
            <label className="sr-only" htmlFor="download-search">
              Search documents
            </label>
            <input id="download-search" name="q" defaultValue={query} placeholder="Search published documents" className="min-h-11 border border-navy/20 px-3" />
            <select name="category" defaultValue={category} className="min-h-11 border border-navy/20 px-3" aria-label="Category">
              <option value="">All categories</option>
              {["Admissions", "Academic information", "School notices", "Policies", "General documents", ...categories]
                .filter((item, index, all) => all.indexOf(item) === index)
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
            <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
              Filter
            </button>
          </form>
          <div className="mt-8 space-y-4">
            {items.length ? (
              items.map((item) => (
                <div key={item.id} id={item.id}>
                  <DownloadCard
                    title={item.title}
                    description={[
                      item.description,
                      fileTypeLabel(item.mimeType, item.fileName),
                      formatFileSize(item.fileSize),
                      item.createdAt ? `Added ${formatSchoolDate(item.createdAt)}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    href={`/downloads/file/${item.id}`}
                  />
                </div>
              ))
            ) : (
              <EmptyState
                title={query || category ? "No matching documents" : "No public documents have been published"}
                description="Approved files can be added from the content manager. This website does not invent school documents."
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { deleteNews } from "@/app/actions/admin";
import { AdminTable, AdminTitle, EmptyAdmin, StatusBadge } from "@/app/admin/_ui";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { canPublish } from "@/lib/permissions";
import { formatSchoolDateTime } from "@/lib/timezone";
import { isPublished, isScheduledPublication } from "@/lib/utils";

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const session = await requirePermission("news");
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const status = params.status?.trim() || "";
  const category = params.category?.trim() || "";
  const items = await prisma.newsArticle.findMany({ orderBy: { updatedAt: "desc" } });
  const categories = Array.from(new Set(items.map((item) => item.category))).sort();
  const filtered = items.filter((item) => {
    if (status && item.status !== status) return false;
    if (category && item.category !== category) return false;
    if (query && !`${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <AdminTitle
        title="News and announcements"
        description="Only published articles with a publication date that has passed appear on the public website. Future dates are treated as scheduled publication."
        action={
          <Link href="/admin/news/new" className="inline-flex min-h-11 items-center bg-navy px-4 text-sm font-semibold text-white">
            New article
          </Link>
        }
      />
      <form className="mb-6 grid gap-3 border border-navy/10 bg-white p-4 md:grid-cols-4" method="get">
        <input name="q" defaultValue={query} placeholder="Search titles" className="min-h-11 border border-navy/20 px-3" aria-label="Search articles" />
        <select name="status" defaultValue={status} className="min-h-11 border border-navy/20 px-3" aria-label="Status">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select name="category" defaultValue={category} className="min-h-11 border border-navy/20 px-3" aria-label="Category">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
          Filter
        </button>
      </form>
      <AdminTable headers={["Title", "Category", "Status", "Updated", ""]}>
        {filtered.map((item) => {
          const scheduled = isScheduledPublication(item.status, item.publishedAt);
          return (
            <tr key={item.id} className="border-t border-navy/10">
              <td className="px-4 py-3">
                <Link href={`/admin/news/${item.id}`} className="font-semibold text-navy underline">
                  {item.title}
                </Link>
                {item.featured ? <p className="text-xs text-gold-ink">Featured</p> : null}
              </td>
              <td className="px-4 py-3">{item.category}</td>
              <td className="px-4 py-3">
                <StatusBadge status={scheduled ? "scheduled" : item.status} />
                {isPublished(item.status, item.publishedAt) ? <p className="text-xs text-ok">Public</p> : null}
              </td>
              <td className="px-4 py-3">{formatSchoolDateTime(item.updatedAt)}</td>
              <td className="px-4 py-3">
                {canPublish(session.role, "news") ? <ConfirmDelete action={deleteNews} id={item.id} label={item.title} /> : null}
              </td>
            </tr>
          );
        })}
      </AdminTable>
      {!filtered.length ? (
        <EmptyAdmin title="No articles match this view" description="Create a draft when approved copy is ready. Do not invent school news." />
      ) : null}
    </>
  );
}

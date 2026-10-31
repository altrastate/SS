import { deleteTimeline, saveTimeline } from "@/app/actions/admin";
import { AdminTable, AdminTitle, Field, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requirePermission("timeline");
  const { id } = await searchParams;
  const items = await prisma.timelineEvent.findMany({ orderBy: { sortOrder: "asc" } });
  const item = items.find((entry) => entry.id === id);

  return (
    <>
      <AdminTitle title="Historical timeline" />
      <AdminTable headers={["Year", "Title", "Verified", "Status", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">{entry.year}</td>
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/timeline?id=${entry.id}`}>
                {entry.title}
              </a>
            </td>
            <td className="px-4 py-3">{entry.verified ? "Yes" : "No"}</td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              <form action={deleteTimeline}>
                <input type="hidden" name="id" value={entry.id} />
                <button className="text-sm text-danger underline" type="submit">
                  Delete
                </button>
              </form>
            </td>
          </tr>
        ))}
      </AdminTable>
      <form action={saveTimeline} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit milestone" : "New milestone"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Year" name="year" required defaultValue={item?.year} />
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Description" name="description" textarea required defaultValue={item?.description} />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="verified" defaultChecked={item?.verified} />
          Wording confirmed from school sources
        </label>
        <Field label="Status" name="status">
          <select name="status" defaultValue={item?.status || "published"} className="min-h-11 w-full border border-navy/20 px-3">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save milestone
        </button>
      </form>
    </>
  );
}

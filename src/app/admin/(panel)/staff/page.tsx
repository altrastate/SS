import { deleteStaff, saveStaff } from "@/app/actions/admin";
import { AdminTable, AdminTitle, Field, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requirePermission("staff");
  const { id } = await searchParams;
  const items = await prisma.staffProfile.findMany({ orderBy: { sortOrder: "asc" } });
  const item = items.find((entry) => entry.id === id);

  return (
    <>
      <AdminTitle
        title="Leadership and board"
        description="Keep profiles in draft until names and portraits are confirmed. Do not invent current office-holders."
      />
      <AdminTable headers={["Title", "Name", "Category", "Status", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/staff?id=${entry.id}`}>
                {entry.title}
              </a>
            </td>
            <td className="px-4 py-3">{entry.name || "Pending"}</td>
            <td className="px-4 py-3">{entry.category}</td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              <form action={deleteStaff}>
                <input type="hidden" name="id" value={entry.id} />
                <button className="text-sm text-danger underline" type="submit">
                  Delete
                </button>
              </form>
            </td>
          </tr>
        ))}
      </AdminTable>
      <form action={saveStaff} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit profile" : "New profile"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Name" name="name" defaultValue={item?.name} />
        <Field label="Biography" name="bio" textarea defaultValue={item?.bio} />
        <Field label="Photograph URL" name="photoUrl" defaultValue={item?.photoUrl} />
        <Field label="Category" name="category" defaultValue={item?.category} hint="leadership or board" />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="namePending" defaultChecked={item?.namePending ?? true} />
          Name pending confirmation
        </label>
        <Field label="Status" name="status">
          <select name="status" defaultValue={item?.status || "draft"} className="min-h-11 w-full border border-navy/20 px-3">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save profile
        </button>
      </form>
    </>
  );
}

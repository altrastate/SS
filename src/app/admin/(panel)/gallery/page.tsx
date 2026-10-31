import { deleteGallery, saveGallery } from "@/app/actions/admin";
import { AdminTable, AdminTitle, Field, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requirePermission("gallery");
  const { id } = await searchParams;
  const items = await prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
  const item = items.find((entry) => entry.id === id);

  return (
    <>
      <AdminTitle title="Gallery" description="Use approved photographs only. Do not name students in captions." />
      <AdminTable headers={["Title", "Status", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/gallery?id=${entry.id}`}>
                {entry.title}
              </a>
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              <form action={deleteGallery}>
                <input type="hidden" name="id" value={entry.id} />
                <button className="text-sm text-danger underline" type="submit">
                  Delete
                </button>
              </form>
            </td>
          </tr>
        ))}
      </AdminTable>
      <form action={saveGallery} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit image" : "New image"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Image URL" name="imageUrl" required defaultValue={item?.imageUrl} />
        <Field label="Alternative text" name="altText" required defaultValue={item?.altText} />
        <Field label="Caption" name="caption" defaultValue={item?.caption} />
        <Field label="Category" name="category" defaultValue={item?.category} />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        <Field label="Status" name="status">
          <select name="status" defaultValue={item?.status || "draft"} className="min-h-11 w-full border border-navy/20 px-3">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save image
        </button>
      </form>
    </>
  );
}

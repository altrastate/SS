import { deleteAlumni, saveAlumni } from "@/app/actions/admin";
import { AdminTable, AdminTitle, EmptyAdmin, Field, StatusBadge, StatusSelect } from "@/app/admin/_ui";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { canPublish } from "@/lib/permissions";

export default async function AdminAlumniPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await requirePermission("alumni");
  const { id } = await searchParams;
  const items = await prisma.alumniStory.findMany({ orderBy: { updatedAt: "desc" } });
  const item = items.find((entry) => entry.id === id);
  const allowPublish = canPublish(session.role, "alumni");

  return (
    <>
      <AdminTitle title="Alumni stories" description="Publish only with the person’s approval. Do not invent identities, graduation years, or testimonials." />
      <AdminTable headers={["Title", "Person", "Status", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/alumni?id=${entry.id}`}>
                {entry.title}
              </a>
            </td>
            <td className="px-4 py-3">
              {entry.personName || "Name pending"}
              {entry.graduationYear ? ` · ${entry.graduationYear}` : ""}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              {allowPublish ? <ConfirmDelete action={deleteAlumni} id={entry.id} label={entry.title} /> : null}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!items.length ? <EmptyAdmin title="No alumni stories" description="Leave this empty until the school approves a profile." /> : null}
      <form action={saveAlumni} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit story" : "New story"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Slug" name="slug" defaultValue={item?.slug} />
        <Field label="Summary" name="summary" textarea rows={3} required defaultValue={item?.summary} />
        <Field label="Biography / story" name="body" textarea required defaultValue={item?.body} />
        <Field label="Person name" name="personName" defaultValue={item?.personName} hint="Only if approved for publication." />
        <Field label="Graduation year" name="graduationYear" defaultValue={item?.graduationYear} hint="Only if confirmed." />
        <Field label="Approved photograph URL" name="coverImageUrl" defaultValue={item?.coverImageUrl} />
        <Field label="Photograph alternative text" name="coverAltText" defaultValue={item?.coverAltText} />
        <Field label="Status" name="status">
          <StatusSelect defaultValue={item?.status} canPublishContent={allowPublish} />
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save story
        </button>
      </form>
    </>
  );
}

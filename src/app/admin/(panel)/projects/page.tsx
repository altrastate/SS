import { deleteProject, saveProject } from "@/app/actions/admin";
import { AdminTable, AdminTitle, EmptyAdmin, Field, StatusBadge, StatusSelect } from "@/app/admin/_ui";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { canPublish } from "@/lib/permissions";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await requirePermission("projects");
  const { id } = await searchParams;
  const items = await prisma.developmentProject.findMany({ orderBy: { sortOrder: "asc" } });
  const item = items.find((entry) => entry.id === id);
  const allowPublish = canPublish(session.role, "projects");

  return (
    <>
      <AdminTitle
        title="Development projects"
        description="Do not publish fundraising totals, budgets, completion percentages, or payment account numbers unless the school has approved them. Online donations stay disabled until a payment provider is configured."
      />
      <AdminTable headers={["Title", "Status label", "Visibility", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/projects?id=${entry.id}`}>
                {entry.title}
              </a>
            </td>
            <td className="px-4 py-3">{entry.statusLabel || "—"}</td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              {allowPublish ? <ConfirmDelete action={deleteProject} id={entry.id} label={entry.title} /> : null}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!items.length ? <EmptyAdmin title="No projects" description="Add a project only when the college has approved the description." /> : null}
      <form action={saveProject} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit project" : "New project"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Slug" name="slug" defaultValue={item?.slug} />
        <Field label="Summary" name="summary" textarea rows={3} required defaultValue={item?.summary} />
        <Field label="Description" name="body" textarea required defaultValue={item?.body} />
        <Field
          label="Public updates"
          name="publicUpdates"
          textarea
          rows={5}
          defaultValue={item?.publicUpdates}
          hint="Plain language updates only. No invented figures."
        />
        <Field label="Status label" name="statusLabel" defaultValue={item?.statusLabel} hint="For example: Planning. Do not add fake percentages." />
        <Field label="Approved image URL" name="coverImageUrl" defaultValue={item?.coverImageUrl} />
        <Field label="Image alternative text" name="coverAltText" defaultValue={item?.coverAltText} />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="acceptDonations" defaultChecked={item?.acceptDonations} />
          This published project may show a support call-to-action (online payment still requires an approved provider)
        </label>
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        <Field label="Visibility" name="status">
          <StatusSelect defaultValue={item?.status} canPublishContent={allowPublish} />
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save project
        </button>
      </form>
    </>
  );
}

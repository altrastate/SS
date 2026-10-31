import { deleteDepartment, saveDepartment, savePathway } from "@/app/actions/admin";
import { AdminTable, AdminTitle, Field, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";

export default async function AdminAcademicsPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; pathway?: string }>;
}) {
  await requirePermission("academics");
  const params = await searchParams;
  const [pathways, departments] = await Promise.all([
    prisma.academicPathway.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.academicDepartment.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const pathway = pathways.find((entry) => entry.id === params.pathway);
  const department = departments.find((entry) => entry.id === params.dept);

  return (
    <>
      <AdminTitle title="Academics" description="Keep unverified subject combinations in draft." />
      <h2 className="mb-3 font-serif text-2xl text-navy">Pathways</h2>
      <AdminTable headers={["Name", "Status", ""]}>
        {pathways.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/academics?pathway=${entry.id}`}>
                {entry.name}
              </a>
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3 text-muted">Edit via the form below</td>
          </tr>
        ))}
      </AdminTable>
      <form action={savePathway} className="mt-6 max-w-3xl border border-navy/10 bg-white p-6">
        <h3 className="mb-4 font-serif text-xl text-navy">{pathway ? "Edit pathway" : "New pathway"}</h3>
        {pathway ? <input type="hidden" name="id" value={pathway.id} /> : null}
        <Field label="Name" name="name" required defaultValue={pathway?.name} />
        <Field label="Level label" name="levelLabel" required defaultValue={pathway?.levelLabel} />
        <Field label="Summary" name="summary" textarea rows={3} required defaultValue={pathway?.summary} />
        <Field label="Body" name="body" textarea required defaultValue={pathway?.body} />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={pathway?.sortOrder ?? 0} />
        <Field label="Status" name="status">
          <select name="status" defaultValue={pathway?.status || "published"} className="min-h-11 w-full border border-navy/20 px-3">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save pathway
        </button>
      </form>

      <h2 className="mb-3 mt-12 font-serif text-2xl text-navy">Departments</h2>
      <AdminTable headers={["Name", "Status", ""]}>
        {departments.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/academics?dept=${entry.id}`}>
                {entry.name}
              </a>
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              <form action={deleteDepartment}>
                <input type="hidden" name="id" value={entry.id} />
                <button className="text-sm text-danger underline" type="submit">
                  Delete
                </button>
              </form>
            </td>
          </tr>
        ))}
      </AdminTable>
      <form action={saveDepartment} className="mt-6 max-w-3xl border border-navy/10 bg-white p-6">
        <h3 className="mb-4 font-serif text-xl text-navy">{department ? "Edit department" : "New department"}</h3>
        {department ? <input type="hidden" name="id" value={department.id} /> : null}
        <Field label="Name" name="name" required defaultValue={department?.name} />
        <Field label="Summary" name="summary" textarea rows={3} required defaultValue={department?.summary} />
        <Field label="Body" name="body" textarea defaultValue={department?.body} />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={department?.sortOrder ?? 0} />
        <Field label="Status" name="status">
          <select name="status" defaultValue={department?.status || "draft"} className="min-h-11 w-full border border-navy/20 px-3">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save department
        </button>
      </form>
    </>
  );
}

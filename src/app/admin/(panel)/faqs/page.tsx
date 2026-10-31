import { deleteFaq, saveFaq } from "@/app/actions/admin";
import { AdminTable, AdminTitle, Field, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";

export default async function FaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requirePermission("faqs");
  const { id } = await searchParams;
  const items = await prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } });
  const item = items.find((entry) => entry.id === id);

  return (
    <>
      <AdminTitle title="FAQs" />
      <AdminTable headers={["Question", "Category", "Status", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/faqs?id=${entry.id}`}>
                {entry.question}
              </a>
            </td>
            <td className="px-4 py-3">{entry.category}</td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              <form action={deleteFaq}>
                <input type="hidden" name="id" value={entry.id} />
                <button className="text-sm text-danger underline" type="submit">
                  Delete
                </button>
              </form>
            </td>
          </tr>
        ))}
      </AdminTable>
      <form action={saveFaq} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit FAQ" : "New FAQ"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Question" name="question" required defaultValue={item?.question} />
        <Field label="Answer" name="answer" textarea required defaultValue={item?.answer} />
        <Field label="Category" name="category" defaultValue={item?.category || "general"} hint="general or admissions" />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
        <Field label="Status" name="status">
          <select name="status" defaultValue={item?.status || "published"} className="min-h-11 w-full border border-navy/20 px-3">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save FAQ
        </button>
      </form>
    </>
  );
}

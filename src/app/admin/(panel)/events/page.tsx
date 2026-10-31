import { deleteEvent, saveEvent } from "@/app/actions/admin";
import { AdminTable, AdminTitle, EmptyAdmin, Field, StatusBadge, StatusSelect } from "@/app/admin/_ui";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { canPublish } from "@/lib/permissions";
import { formatSchoolDateTime, toDatetimeLocalValue } from "@/lib/timezone";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await requirePermission("events");
  const { id } = await searchParams;
  const items = await prisma.eventItem.findMany({ orderBy: { updatedAt: "desc" } });
  const item = id ? items.find((entry) => entry.id === id) : undefined;
  const allowPublish = canPublish(session.role, "events");

  return (
    <>
      <AdminTitle title="Events and calendar" description="Dates are stored and displayed in Africa/Kampala. Only published, non-archived events appear publicly." />
      <AdminTable headers={["Title", "When", "Status", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="font-semibold text-navy underline" href={`/admin/events?id=${entry.id}`}>
                {entry.title}
              </a>
              <p className="text-xs text-muted">{entry.category}</p>
            </td>
            <td className="px-4 py-3">{entry.startAt ? formatSchoolDateTime(entry.startAt) : "Date to confirm"}</td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.cancelled ? "cancelled" : entry.status} />
            </td>
            <td className="px-4 py-3">
              {allowPublish ? <ConfirmDelete action={deleteEvent} id={entry.id} label={entry.title} /> : null}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!items.length ? <EmptyAdmin title="No events yet" description="Do not invent term dates, examinations, or holidays." /> : null}
      <form action={saveEvent} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit event" : "New event"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Slug" name="slug" defaultValue={item?.slug} />
        <Field label="Category" name="category" defaultValue={item?.category || "School"} />
        <Field label="Summary" name="summary" textarea rows={3} required defaultValue={item?.summary} />
        <Field label="Body" name="body" textarea required defaultValue={item?.body} />
        <Field label="Location" name="location" defaultValue={item?.location} />
        <Field label="Information or registration link" name="infoUrl" defaultValue={item?.infoUrl} />
        <Field label="Start (Africa/Kampala)" name="startAt" type="datetime-local" defaultValue={toDatetimeLocalValue(item?.startAt)} />
        <Field label="End (Africa/Kampala)" name="endAt" type="datetime-local" defaultValue={toDatetimeLocalValue(item?.endAt)} />
        <Field label="Audience" name="audience">
          <select name="audience" defaultValue={item?.audience || "public"} className="min-h-11 w-full border border-navy/20 px-3">
            <option value="public">Public calendar</option>
            <option value="alumni">Alumni portal only</option>
            <option value="both">Public and alumni portal</option>
          </select>
        </Field>
        <Field label="Cover image URL" name="coverImageUrl" defaultValue={item?.coverImageUrl} />
        <Field label="Cover alternative text" name="coverAltText" defaultValue={item?.coverAltText} />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="cancelled" defaultChecked={item?.cancelled} />
          Mark as cancelled
        </label>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="archived" defaultChecked={item?.archived} />
          Archive (hide from public calendar)
        </label>
        <Field label="Status" name="status">
          <StatusSelect defaultValue={item?.status} canPublishContent={allowPublish} />
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save event
        </button>
      </form>
    </>
  );
}

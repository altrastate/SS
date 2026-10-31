import { notFound } from "next/navigation";
import { addEnquiryNote, assignEnquiry, deleteEnquiry, updateEnquiryStatus } from "@/app/actions/admin";
import { AdminTitle, Field, StatusBadge } from "@/app/admin/_ui";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { can } from "@/lib/permissions";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission("enquiries");
  const { id } = await params;
  const item = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true, email: true } } } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) notFound();

  const staff = await prisma.user.findMany({
    where: { active: true, role: { in: ["super_admin", "school_admin", "admissions_officer", "admin"] } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <AdminTitle
        title={item.name}
        description="Internal enquiry record. Do not copy private notes into public pages."
        action={can(session.role, "enquiries") ? <ConfirmDelete action={deleteEnquiry} id={item.id} label="this enquiry" /> : null}
      />
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-navy/10 bg-white p-6">
          <p className="text-sm text-muted">Received {formatSchoolDateTime(item.createdAt)}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-navy">Email</dt>
              <dd>{item.email || "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Telephone</dt>
              <dd>{item.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Type</dt>
              <dd>{item.type}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Admission level</dt>
              <dd>{item.admissionLevel || "Not specified"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Category</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Status</dt>
              <dd>
                <StatusBadge status={item.status} />
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Responded</dt>
              <dd>{item.respondedAt ? formatSchoolDateTime(item.respondedAt) : "Not recorded"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Closed</dt>
              <dd>{item.closedAt ? formatSchoolDateTime(item.closedAt) : "Open"}</dd>
            </div>
          </dl>
          <h2 className="mt-8 font-serif text-2xl text-navy">Message</h2>
          <p className="mt-3 whitespace-pre-wrap text-muted">{item.message}</p>
        </section>

        <div className="space-y-6">
          <section className="border border-navy/10 bg-white p-6">
            <h2 className="font-serif text-2xl text-navy">Update status</h2>
            <form action={updateEnquiryStatus} className="mt-4">
              <input type="hidden" name="id" value={item.id} />
              <select name="status" defaultValue={item.status === "read" ? "in_progress" : item.status === "archived" ? "closed" : item.status} className="min-h-11 w-full border border-navy/20 px-3">
                <option value="new">New</option>
                <option value="in_progress">In progress</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
              <button className="mt-3 min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
                Save status
              </button>
            </form>
          </section>

          <section className="border border-navy/10 bg-white p-6">
            <h2 className="font-serif text-2xl text-navy">Assign</h2>
            <form action={assignEnquiry} className="mt-4">
              <input type="hidden" name="id" value={item.id} />
              <select name="assignedToId" defaultValue={item.assignedToId || ""} className="min-h-11 w-full border border-navy/20 px-3">
                <option value="">Unassigned</option>
                {staff.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <button className="mt-3 min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
                Save assignment
              </button>
            </form>
          </section>
        </div>
      </div>

      <section className="mt-8 border border-navy/10 bg-white p-6">
        <h2 className="font-serif text-2xl text-navy">Internal notes</h2>
        <form action={addEnquiryNote} className="mt-4 max-w-3xl">
          <input type="hidden" name="id" value={item.id} />
          <Field label="Add a note" name="note" textarea rows={4} hint="Visible only to authorised staff. Do not paste this onto public pages." />
          <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
            Add note
          </button>
        </form>
        <ul className="mt-6 divide-y divide-navy/10">
          {item.notes.map((note) => (
            <li key={note.id} className="py-4">
              <p className="text-sm text-muted">
                {note.author?.name || "Staff"} · {formatSchoolDateTime(note.createdAt)}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{note.body}</p>
            </li>
          ))}
        </ul>
        {!item.notes.length ? <p className="mt-4 text-muted">No internal notes yet.</p> : null}
      </section>

      <section className="mt-8 border border-navy/10 bg-white p-6">
        <h2 className="font-serif text-2xl text-navy">Status history</h2>
        <ul className="mt-4 divide-y divide-navy/10 text-sm">
          {item.statusHistory.map((entry) => (
            <li key={entry.id} className="py-3">
              {entry.fromStatus} → {entry.toStatus} · {entry.actorEmail || "Staff"} · {formatSchoolDateTime(entry.createdAt)}
            </li>
          ))}
        </ul>
        {!item.statusHistory.length ? <p className="mt-4 text-muted">No status changes recorded yet.</p> : null}
      </section>
    </>
  );
}

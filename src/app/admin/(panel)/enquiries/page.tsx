import Link from "next/link";
import { AdminTable, AdminTitle, EmptyAdmin, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { formatSchoolDateTime } from "@/lib/timezone";

const LEVELS = ["S1", "S5", "general"];
const STATUSES = ["new", "in_progress", "responded", "closed"];

function matchesStatus(stored: string, filter: string) {
  if (!filter) return true;
  if (filter === "in_progress") return stored === "in_progress" || stored === "read";
  if (filter === "closed") return stored === "closed" || stored === "archived";
  return stored === filter;
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; level?: string; type?: string }>;
}) {
  await requirePermission("enquiries");
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const status = params.status?.trim() || "";
  const level = params.level?.trim() || "";
  const type = params.type?.trim() || "";

  const items = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true, email: true } } },
  });

  const filtered = items.filter((item) => {
    if (type && item.type !== type) return false;
    if (level && item.admissionLevel !== level) return false;
    if (status && !matchesStatus(item.status, status)) return false;
    if (query) {
      const haystack = `${item.name} ${item.email || ""} ${item.phone || ""} ${item.category}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <>
      <AdminTitle
        title="Enquiries"
        description="Private submissions from the public contact and admissions forms. Messages are never shown on the public website."
      />
      <form className="mb-6 grid gap-3 border border-navy/10 bg-white p-4 md:grid-cols-5" method="get">
        <label className="sr-only" htmlFor="enquiry-search">
          Search enquiries
        </label>
        <input
          id="enquiry-search"
          name="q"
          defaultValue={query}
          placeholder="Name, email, or telephone"
          className="min-h-11 border border-navy/20 px-3 md:col-span-2"
        />
        <select name="status" defaultValue={status} className="min-h-11 border border-navy/20 px-3" aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item.replace("_", " ")}
            </option>
          ))}
        </select>
        <select name="level" defaultValue={level} className="min-h-11 border border-navy/20 px-3" aria-label="Admission level">
          <option value="">All levels</option>
          {LEVELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="submit" className="min-h-11 bg-navy px-4 text-sm font-semibold text-white">
          Filter
        </button>
      </form>
      <AdminTable headers={["Received", "From", "Type / level", "Status", "Assigned", ""]}>
        {filtered.map((item) => (
          <tr key={item.id} className="border-t border-navy/10 align-top">
            <td className="px-4 py-3">{formatSchoolDateTime(item.createdAt)}</td>
            <td className="px-4 py-3">
              <p className="font-semibold text-navy">{item.name}</p>
              <p>{item.email || "No email"}</p>
              <p>{item.phone || "No telephone"}</p>
            </td>
            <td className="px-4 py-3">
              {item.type}
              {item.admissionLevel ? ` · ${item.admissionLevel}` : ""}
              <p className="text-muted">{item.category}</p>
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-3">{item.assignedTo?.name || "Unassigned"}</td>
            <td className="px-4 py-3">
              <Link href={`/admin/enquiries/${item.id}`} className="text-sm font-semibold text-navy underline">
                Open
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
      {!filtered.length ? (
        <EmptyAdmin
          title={items.length ? "No matching enquiries" : "No enquiries yet"}
          description="Public forms store submissions here. Enquiry messages are never indexed for analytics."
        />
      ) : null}
    </>
  );
}

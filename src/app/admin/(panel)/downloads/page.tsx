import { deleteDownload, saveDownload, uploadMedia } from "@/app/actions/admin";
import { AdminTable, AdminTitle, EmptyAdmin, Field, StatusBadge, StatusSelect } from "@/app/admin/_ui";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { formatFileSize } from "@/lib/files";
import { canPublish } from "@/lib/permissions";
import { formatSchoolDate, toDatetimeLocalValue } from "@/lib/timezone";

const CATEGORIES = ["Admissions", "Academic information", "School notices", "Policies", "General documents"];

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; uploaded?: string; error?: string }>;
}) {
  const session = await requirePermission("downloads");
  const { id, uploaded, error } = await searchParams;
  const items = await prisma.downloadItem.findMany({ orderBy: { createdAt: "desc" } });
  const item = items.find((entry) => entry.id === id);
  const allowPublish = canPublish(session.role, "content");

  return (
    <>
      <AdminTitle title="Downloads and documents" description="Publish only documents the school has approved for public release. Executables are blocked." />
      {uploaded ? (
        <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          File stored at <code>{uploaded}</code>. Paste this path into the file URL field.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <form action={uploadMedia} className="mb-8 max-w-xl border border-navy/10 bg-white p-5">
        <input type="hidden" name="redirectTo" value="/admin/downloads" />
        <Field label="Upload a file" name="file">
          <input id="file" name="file" type="file" required className="w-full" />
        </Field>
        <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
          Upload file
        </button>
      </form>
      <AdminTable headers={["Title", "Category", "File", "Status", ""]}>
        {items.map((entry) => (
          <tr key={entry.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="text-navy underline" href={`/admin/downloads?id=${entry.id}`}>
                {entry.title}
              </a>
            </td>
            <td className="px-4 py-3">{entry.category || "—"}</td>
            <td className="px-4 py-3">
              {entry.fileName || entry.fileUrl}
              {entry.fileSize ? ` · ${formatFileSize(entry.fileSize)}` : ""}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={entry.status} />
            </td>
            <td className="px-4 py-3">
              {allowPublish ? <ConfirmDelete action={deleteDownload} id={entry.id} label={entry.title} /> : null}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!items.length ? <EmptyAdmin title="No documents yet" description="Do not fabricate school documents." /> : null}
      <form action={saveDownload} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{item ? "Edit download" : "New download"}</h2>
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Description" name="description" textarea rows={3} defaultValue={item?.description} />
        <Field label="File URL" name="fileUrl" required defaultValue={item?.fileUrl || uploaded} />
        <Field label="Original file name" name="fileName" defaultValue={item?.fileName} />
        <Field label="File size (bytes)" name="fileSize" type="number" defaultValue={item?.fileSize ?? ""} />
        <Field label="MIME type" name="mimeType" defaultValue={item?.mimeType} />
        <Field label="Category" name="category">
          <select name="category" defaultValue={item?.category || "General documents"} className="min-h-11 w-full border border-navy/20 px-3">
            {CATEGORIES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Review date" name="reviewAt" type="datetime-local" defaultValue={toDatetimeLocalValue(item?.reviewAt)} />
        <Field label="Expiry date" name="expiresAt" type="datetime-local" defaultValue={toDatetimeLocalValue(item?.expiresAt)} />
        <Field label="Status" name="status">
          <StatusSelect defaultValue={item?.status} canPublishContent={allowPublish} />
        </Field>
        <p className="mb-4 text-sm text-muted">Uploaded {item ? formatSchoolDate(item.createdAt) : "on save"}.</p>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save download
        </button>
      </form>
    </>
  );
}

import { deleteMedia, updateMedia, uploadMedia } from "@/app/actions/admin";
import { AdminTitle, EmptyAdmin, Field } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { formatFileSize, fileTypeLabel } from "@/lib/files";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string; id?: string; q?: string; type?: string; referenced?: string; error?: string; saved?: string; deleted?: string }>;
}) {
  await requirePermission("media");
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const type = params.type?.trim() || "";
  const items = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  const filtered = items.filter((item) => {
    if (type === "image" && !item.mimeType.startsWith("image/")) return false;
    if (type === "document" && item.mimeType.startsWith("image/")) return false;
    if (query && !`${item.title} ${item.filename} ${item.altText || ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const selected = items.find((item) => item.id === params.id);

  return (
    <>
      <AdminTitle
        title="Media library"
        description="JPEG, PNG, WebP, GIF, PDF, Word, Excel, and text files. Images up to 5MB, documents up to 10MB. Public pages use Next.js image optimisation for raster images."
      />
      {params.uploaded ? (
        <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          Uploaded: <code>{params.uploaded}</code>
        </p>
      ) : null}
      {params.saved ? (
        <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          Media details saved.
        </p>
      ) : null}
      {params.deleted ? (
        <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          Media removed.
        </p>
      ) : null}
      {params.error ? (
        <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {params.error}
        </p>
      ) : null}
      {params.referenced ? (
        <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          This file is referenced by {params.referenced} content record(s). Confirm deletion below if you still need to remove it.
        </p>
      ) : null}

      <form action={uploadMedia} className="max-w-xl border border-navy/10 bg-white p-6">
        <Field label="Title" name="title" />
        <Field label="Alternative text" name="altText" hint="Required for informative images used on public pages." />
        <Field label="Caption" name="caption" />
        <label htmlFor="file" className="mb-2 block text-sm font-semibold text-navy">
          File
        </label>
        <input id="file" name="file" type="file" required className="w-full" />
        <button className="mt-4 min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Upload
        </button>
      </form>

      <form className="mt-8 grid gap-3 border border-navy/10 bg-white p-4 md:grid-cols-[1fr_12rem_auto]" method="get">
        <input name="q" defaultValue={query} placeholder="Search filename or title" className="min-h-11 border border-navy/20 px-3" aria-label="Search media" />
        <select name="type" defaultValue={type} className="min-h-11 border border-navy/20 px-3" aria-label="Media type">
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
        </select>
        <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
          Filter
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="border border-navy/10 bg-white p-4">
            {item.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.altText || ""} className="mb-3 aspect-video w-full object-cover bg-ivory-dark" />
            ) : (
              <p className="mb-3 bg-ivory px-3 py-8 text-center text-sm font-semibold text-navy">{fileTypeLabel(item.mimeType, item.filename)}</p>
            )}
            <h2 className="font-serif text-xl text-navy">{item.title}</h2>
            <p className="text-sm text-muted">
              {item.filename} · {formatFileSize(item.size)} · {formatSchoolDateTime(item.createdAt)}
            </p>
            <p className="mt-2 break-all text-xs text-muted">{item.url}</p>
            <a className="mt-3 inline-block text-sm font-semibold text-navy underline" href={`/admin/media?id=${item.id}`}>
              Edit details
            </a>
          </article>
        ))}
      </div>
      {!filtered.length ? (
        <EmptyAdmin title="No media in this view" description="Upload approved photographs and documents. Do not add private student photographs." />
      ) : null}

      {selected ? (
        <form action={updateMedia} className="mt-8 max-w-xl border border-navy/10 bg-white p-6">
          <h2 className="mb-4 font-serif text-2xl text-navy">Edit media</h2>
          <input type="hidden" name="id" value={selected.id} />
          <Field label="Title" name="title" required defaultValue={selected.title} />
          <Field label="Alternative text" name="altText" defaultValue={selected.altText} />
          <Field label="Caption" name="caption" defaultValue={selected.caption} />
          <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
            Save details
          </button>
        </form>
      ) : null}

      {selected ? (
        <form action={deleteMedia} className="mt-4 max-w-xl border border-danger/20 bg-white p-6">
          <input type="hidden" name="id" value={selected.id} />
          {params.referenced ? <input type="hidden" name="confirmReferenced" value="true" /> : null}
          <p className="text-sm text-muted">
            Deleting a file that is still used on a published page can leave a broken image. Check references first.
          </p>
          <button className="mt-4 min-h-11 bg-danger px-5 text-sm font-semibold text-white" type="submit">
            {params.referenced ? "Delete anyway" : "Delete media"}
          </button>
        </form>
      ) : null}
    </>
  );
}

import { notFound } from "next/navigation";
import { saveNews } from "@/app/actions/admin";
import { AdminTitle, Field, StatusSelect } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { canPublish } from "@/lib/permissions";
import { formatSchoolDateTime, toDatetimeLocalValue } from "@/lib/timezone";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission("news");
  const { id } = await params;
  const item = id === "new" ? null : await prisma.newsArticle.findUnique({
    where: { id },
    include: { revisions: { orderBy: { createdAt: "desc" }, take: 12, include: { editor: { select: { name: true } } } } },
  });
  if (id !== "new" && !item) notFound();
  const allowPublish = canPublish(session.role, "news");

  return (
    <>
      <AdminTitle
        title={item ? "Edit article" : "New article"}
        description="Use draft until the school has approved the wording. A future publication date keeps a published article hidden until that time (Africa/Kampala)."
      />
      <form action={saveNews} className="max-w-3xl border border-navy/10 bg-white p-6">
        {item ? <input type="hidden" name="id" value={item.id} /> : null}
        <Field label="Title" name="title" required defaultValue={item?.title} />
        <Field label="Slug" name="slug" defaultValue={item?.slug} hint="Leave blank to generate from the title." />
        <Field label="Category" name="category" defaultValue={item?.category || "News"} />
        <Field label="Summary" name="summary" textarea rows={3} required defaultValue={item?.summary} />
        <Field label="Body" name="body" textarea rows={16} required defaultValue={item?.body} hint="Basic Markdown is supported." />
        <Field label="Cover image URL" name="coverImageUrl" defaultValue={item?.coverImageUrl} hint="Choose a path from the media library." />
        <Field label="Cover image alternative text" name="coverAltText" defaultValue={item?.coverAltText} />
        <Field label="Author / editor" name="authorName" defaultValue={item?.authorName} />
        <Field
          label="Publication date (Africa/Kampala)"
          name="publishedAt"
          type="datetime-local"
          defaultValue={toDatetimeLocalValue(item?.publishedAt)}
          hint="If this is in the future and status is published, the article stays hidden until that time."
        />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={item?.featured} />
          Featured article
        </label>
        <Field label="Status" name="status">
          <StatusSelect defaultValue={item?.status} canPublishContent={allowPublish} />
        </Field>
        {!allowPublish ? (
          <p className="mb-4 text-sm text-muted">Your role can save drafts and submit for review, but cannot publish.</p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
            Save article
          </button>
          {item ? (
            <a className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline" href={`/admin/news/${item.id}/preview`}>
              Preview
            </a>
          ) : null}
        </div>
      </form>
      {item?.revisions?.length ? (
        <section className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
          <h2 className="font-serif text-2xl text-navy">Revision history</h2>
          <ul className="mt-4 divide-y divide-navy/10 text-sm">
            {item.revisions.map((revision) => (
              <li key={revision.id} className="py-3">
                {revision.status} · {revision.editor?.name || "Editor"} · {formatSchoolDateTime(revision.createdAt)}
                <p className="text-muted">{revision.title}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

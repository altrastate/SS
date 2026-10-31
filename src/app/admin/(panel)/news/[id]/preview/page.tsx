import { notFound } from "next/navigation";
import { NewsArticleBody } from "@/components/ui/NewsGrid";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

export default async function PreviewNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("news");
  const { id } = await params;
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl bg-white p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">
        Preview · {article.status} · not public unless published
      </p>
      <h1 className="mt-3 font-serif text-4xl text-navy">{article.title}</h1>
      <p className="mt-3 text-muted">{article.summary}</p>
      <p className="mt-2 text-sm text-muted">
        {formatDate(article.publishedAt || article.createdAt)}
        {article.authorName ? ` · ${article.authorName}` : ""}
      </p>
      <div className="mt-8">
        <NewsArticleBody html={renderMarkdown(article.body)} />
      </div>
    </article>
  );
}

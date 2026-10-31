import { notFound } from "next/navigation";
import { NewsArticleBody, NewsGrid } from "@/components/ui/NewsGrid";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getNewsBySlug, getRelatedNews } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) {
    return pageMetadata({
      title: "Article not found",
      description: "This news article is not available.",
      path: `/news/${slug}`,
      noIndex: true,
    });
  }
  return pageMetadata({
    title: article.title,
    description: article.summary,
    path: `/news/${article.slug}`,
    image: article.coverImageUrl,
  });
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedNews(article.slug, article.category);

  return (
    <>
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={article.summary}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/news", label: "News" },
          { href: `/news/${article.slug}`, label: article.title },
        ]}
      />
      <article className="py-16">
        <div className="container-narrow">
          <p className="text-sm text-muted">
            {formatDate(article.publishedAt || article.createdAt)}
            {article.authorName ? ` · ${article.authorName}` : ""}
          </p>
          {article.coverImageUrl ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-ivory-dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.coverImageUrl} alt={article.coverAltText || ""} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div className="mt-8">
            <NewsArticleBody html={renderMarkdown(article.body)} />
          </div>
        </div>
      </article>
      {related.length ? (
        <section className="bg-white py-16">
          <div className="container-page">
            <SectionHeading title="Related articles" />
            <div className="mt-8">
              <NewsGrid items={related} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

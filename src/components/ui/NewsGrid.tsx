import { NewsCard } from "@/components/ui/cards";

type Item = {
  slug: string;
  title: string;
  summary: string;
  publishedAt?: Date | string | null;
  category?: string;
  coverImageUrl?: string | null;
  coverAltText?: string | null;
};

export function NewsGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <NewsCard
          key={item.slug}
          href={`/news/${item.slug}`}
          title={item.title}
          summary={item.summary}
          date={item.publishedAt}
          category={item.category}
          imageUrl={item.coverImageUrl}
          imageAlt={item.coverAltText}
        />
      ))}
    </div>
  );
}

export function NewsArticleBody({ html }: { html: string }) {
  return <div className="prose-jico max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

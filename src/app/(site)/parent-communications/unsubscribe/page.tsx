import { unsubscribeNotices } from "@/app/actions/communications";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Unsubscribe",
    description: "Stop receiving Kapchorwa Senior Secondary School notice emails.",
    path: "/parent-communications/unsubscribe",
    noIndex: true,
  });
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  const result = email ? await unsubscribeNotices(email) : null;

  return (
    <>
      <PageHero title="Unsubscribe" crumbs={[{ href: "/", label: "Home" }, { href: "/parent-communications", label: "Notices" }]} />
      <section className="py-16">
        <div className="container-narrow">
          {result ? <p className="mb-6 text-ok">{result.message}</p> : null}
          <p className="mb-6 text-muted">Enter the email address that should stop receiving notices. The same confirmation is shown whether or not the address was subscribed.</p>
          <form method="get" className="space-y-4">
            <label className="block text-sm font-semibold text-navy">
              Email
              <input name="email" type="email" required defaultValue={email || ""} className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" />
            </label>
            <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
              Unsubscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

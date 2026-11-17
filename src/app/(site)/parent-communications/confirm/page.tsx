import { confirmSubscription } from "@/app/actions/communications";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata() {
  return pageMetadata({
    title: "Confirm subscription",
    description: "Confirm a Kapchorwa Senior Secondary School notices subscription.",
    path: "/parent-communications/confirm",
    noIndex: true,
  });
}

export default async function ConfirmSubscriptionPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = token
    ? await confirmSubscription(token)
    : { ok: false, message: "This confirmation link is missing a token." };

  return (
    <>
      <PageHero title="Subscription confirmation" crumbs={[{ href: "/", label: "Home" }, { href: "/parent-communications", label: "Notices" }]} />
      <section className="py-16">
        <div className="container-narrow">
          <p className={result.ok ? "text-ok" : "text-danger"}>{result.message}</p>
          <Link href="/parent-communications" className="mt-6 inline-flex min-h-11 items-center font-semibold text-navy underline">
            Return to notices
          </Link>
        </div>
      </section>
    </>
  );
}

import { PageHero } from "@/components/ui/PageHero";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({ title: "Donation status", description: "Payment confirmation depends on the provider, not this page.", path: "/support/donate/return", noIndex: true });
}

export default async function DonateReturnPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const donation = ref ? await prisma.donation.findUnique({ where: { providerRef: ref } }) : null;
  const status = donation?.status || "unknown";
  const message =
    status === "succeeded"
      ? "The payment provider has confirmed this donation. A receipt is available from the email used on the form, if email delivery is configured."
      : status === "pending" || status === "created"
        ? "This donation is pending. This website will not mark it successful until the payment provider confirms it."
        : status === "failed" || status === "cancelled"
          ? "This donation was not completed. No receipt has been issued."
          : "No matching donation was found for that reference.";

  return (
    <>
      <PageHero title="Donation status" crumbs={[{ href: "/", label: "Home" }, { href: "/support/donate", label: "Donate" }]} />
      <section className="py-16">
        <div className="container-narrow">
          <p className="text-muted">{message}</p>
          {donation?.status === "succeeded" ? (
            <p className="mt-4">
              <a className="font-semibold text-navy underline" href={`/support/receipt/${donation.receiptToken}`}>
                Open receipt
              </a>
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}

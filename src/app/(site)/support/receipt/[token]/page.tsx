import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { formatSchoolDateTime } from "@/lib/timezone";

export async function generateMetadata() {
  return pageMetadata({ title: "Donation receipt", description: "Verified donation receipt.", path: "/support/receipt", noIndex: true });
}

export default async function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 20) notFound();
  const donation = await prisma.donation.findUnique({
    where: { receiptToken: token },
    include: { project: true },
  });
  if (!donation || donation.status !== "succeeded" || !donation.confirmedAt) notFound();

  return (
    <>
      <PageHero title="Donation receipt" crumbs={[{ href: "/", label: "Home" }, { href: "/support", label: "Support" }]} />
      <article className="py-16">
        <div className="container-narrow border border-navy/10 bg-white p-8">
          <p className="text-sm text-muted">Issued only after payment-provider confirmation. Tax deductibility is not claimed here.</p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div><dt className="font-semibold text-navy">Receipt</dt><dd>{donation.receiptToken}</dd></div>
            <div><dt className="font-semibold text-navy">Amount</dt><dd>{donation.amount} {donation.currency}</dd></div>
            <div><dt className="font-semibold text-navy">Confirmed</dt><dd>{formatSchoolDateTime(donation.confirmedAt)}</dd></div>
            <div><dt className="font-semibold text-navy">Designation</dt><dd>{donation.project?.title || "General college development"}</dd></div>
          </dl>
        </div>
      </article>
    </>
  );
}

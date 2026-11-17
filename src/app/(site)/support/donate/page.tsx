import { DonateForm } from "@/components/support/DonateForm";
import { PageHero } from "@/components/ui/PageHero";
import { VerifyNotice } from "@/components/ui/states";
import { getProjects } from "@/lib/content";
import { getModuleFlags } from "@/lib/integrations/registry";
import { paymentsConfigured } from "@/lib/integrations/payments";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "Donate",
    description: "Support Kapchorwa Senior Secondary School through an approved payment provider when one is configured.",
    path: "/support/donate",
  });
}

export default async function DonatePage() {
  const [flags, projects] = await Promise.all([getModuleFlags(), getProjects()]);
  const open = projects.filter((item) => item.acceptDonations).map((item) => ({ id: item.id, title: item.title }));
  const enabled = flags.donationsPage && paymentsConfigured();

  return (
    <>
      <PageHero
        eyebrow="Development support"
        title="Donate"
        description="Card numbers and mobile-money PINs are never collected on this website."
        crumbs={[{ href: "/", label: "Home" }, { href: "/support", label: "Support" }, { href: "/support/donate", label: "Donate" }]}
      />
      <section className="py-16">
        <div className="container-narrow">
          {enabled ? (
            <DonateForm projects={open} />
          ) : (
            <VerifyNotice>
              Online donations are not enabled. Kapchorwa Senior Secondary School has not approved a payment provider for this website. Do not send money through unofficial channels.
            </VerifyNotice>
          )}
        </div>
      </section>
    </>
  );
}

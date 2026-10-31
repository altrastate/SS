import { AlumniResetForm } from "@/components/alumni/AlumniForms";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({ title: "Choose a new password", description: "Set a new alumni portal password.", path: "/alumni/portal/reset", noIndex: true });
}

export default async function AlumniResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Alumni portal" title="New password" crumbs={[{ href: "/", label: "Home" }, { href: "/alumni/portal/login", label: "Sign in" }]} />
      <section className="py-16">
        <div className="container-narrow">
          {token ? <AlumniResetForm token={token} /> : <p className="text-muted">This reset link is missing a token.</p>}
        </div>
      </section>
    </>
  );
}

import { AlumniForgotForm } from "@/components/alumni/AlumniForms";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({ title: "Reset alumni password", description: "Request an alumni portal password reset.", path: "/alumni/portal/forgot", noIndex: true });
}

export default function AlumniForgotPage() {
  return (
    <>
      <PageHero eyebrow="Alumni portal" title="Password reset" crumbs={[{ href: "/", label: "Home" }, { href: "/alumni/portal/login", label: "Sign in" }]} />
      <section className="py-16">
        <div className="container-narrow">
          <p className="mb-6 text-muted">For privacy, the same confirmation is shown whether or not the email is registered.</p>
          <AlumniForgotForm />
        </div>
      </section>
    </>
  );
}

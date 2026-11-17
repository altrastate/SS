import Link from "next/link";
import { AlumniRegisterForm } from "@/components/alumni/AlumniForms";
import { PageHero } from "@/components/ui/PageHero";
import { VerifyNotice } from "@/components/ui/states";
import { getModuleFlags } from "@/lib/integrations/registry";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({ title: "Alumni registration", description: "Register a private Kapchorwa Senior Secondary School alumni account.", path: "/alumni/portal/register", noIndex: true });
}

export default async function AlumniRegisterPage() {
  const flags = await getModuleFlags();
  return (
    <>
      <PageHero eyebrow="Alumni portal" title="Register" crumbs={[{ href: "/", label: "Home" }, { href: "/alumni", label: "Alumni" }, { href: "/alumni/portal/register", label: "Register" }]} />
      <section className="py-16">
        <div className="container-narrow">
          {!flags.alumniPortal ? (
            <VerifyNotice>Alumni registration is not open until the college enables the portal.</VerifyNotice>
          ) : (
            <>
              <p className="mb-6 text-muted">Accounts are private by default. Stories are reviewed before publication. This is not access to student records.</p>
              <AlumniRegisterForm />
              <p className="mt-6 text-sm">
                <Link href="/alumni/portal/login" className="underline">Already registered? Sign in</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}

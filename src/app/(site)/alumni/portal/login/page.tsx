import Link from "next/link";
import { AlumniLoginForm } from "@/components/alumni/AlumniForms";
import { PageHero } from "@/components/ui/PageHero";
import { VerifyNotice } from "@/components/ui/states";
import { getModuleFlags } from "@/lib/integrations/registry";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({ title: "Alumni sign in", description: "Sign in to the Jinja College alumni portal.", path: "/alumni/portal/login", noIndex: true });
}

export default async function AlumniLoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const flags = await getModuleFlags();
  const { from } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Alumni portal" title="Sign in" crumbs={[{ href: "/", label: "Home" }, { href: "/alumni", label: "Alumni" }, { href: "/alumni/portal/login", label: "Sign in" }]} />
      <section className="py-16">
        <div className="container-narrow">
          {!flags.alumniPortal ? (
            <VerifyNotice>The alumni portal is not enabled. The college has not activated alumni accounts yet.</VerifyNotice>
          ) : (
            <>
              <AlumniLoginForm from={from && from.startsWith("/alumni/portal") ? from : "/alumni/portal"} />
              <p className="mt-6 text-sm text-muted">
                <Link href="/alumni/portal/register" className="underline">Register</Link>
                {" · "}
                <Link href="/alumni/portal/forgot" className="underline">Forgot password</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}

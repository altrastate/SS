import Link from "next/link";
import { verifyAlumniEmail } from "@/app/actions/alumni";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({ title: "Verify alumni email", description: "Confirm an alumni portal email address.", path: "/alumni/portal/verify", noIndex: true });
}

export default async function AlumniVerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = token ? await verifyAlumniEmail(token) : { ok: false, message: "This verification link is missing a token." };
  return (
    <>
      <PageHero eyebrow="Alumni portal" title="Email verification" crumbs={[{ href: "/", label: "Home" }, { href: "/alumni/portal/login", label: "Sign in" }]} />
      <section className="py-16">
        <div className="container-narrow">
          <p className={result.ok ? "text-ok" : "text-danger"}>{result.message}</p>
          <Link href="/alumni/portal/login" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline">
            Sign in
          </Link>
        </div>
      </section>
    </>
  );
}

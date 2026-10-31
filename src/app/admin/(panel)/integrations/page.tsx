import { testSchoolSystemIntegration, testSmtpIntegration } from "@/app/actions/integrations";
import { AdminTable, AdminTitle, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { listIntegrations } from "@/lib/integrations/registry";
import { prisma } from "@/lib/db";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ smtp?: string; school?: string }>;
}) {
  await requirePermission("integrations");
  const params = await searchParams;
  const integrations = listIntegrations();
  const logs = await prisma.integrationLog.findMany({ orderBy: { createdAt: "desc" }, take: 40 });

  return (
    <>
      <AdminTitle
        title="Integrations"
        description="Credentials stay in environment variables. This screen never shows secret values and does not claim an integration is live unless configuration actually exists."
      />
      {params.smtp === "ok" ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">SMTP accepted a test connection.</p> : null}
      {params.smtp === "fail" ? <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">SMTP test failed. Check the host, port, and credentials in the server environment.</p> : null}
      {params.school === "ok" ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">The school-system URL responded. No student data was imported.</p> : null}
      {params.school === "fail" ? <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">School-system connection test failed. No student records were synchronised.</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {integrations.map((item) => (
          <article key={item.id} className="border border-navy/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-ink">{item.category}</p>
            <h2 className="mt-2 font-serif text-2xl text-navy">{item.name}</h2>
            <p className="mt-2">
              <StatusBadge status={item.configured ? "configured" : "missing"} />{" "}
              <StatusBadge status={item.live ? "live" : "disabled"} />
            </p>
            <p className="mt-3 text-sm text-muted">{item.message}</p>
            {item.id === "smtp" ? (
              <form action={testSmtpIntegration} className="mt-4">
                <button className="min-h-11 border border-navy px-4 text-sm font-semibold text-navy" type="submit">
                  Test SMTP
                </button>
              </form>
            ) : null}
            {item.id === "school-system" ? (
              <form action={testSchoolSystemIntegration} className="mt-4">
                <button className="min-h-11 border border-navy px-4 text-sm font-semibold text-navy" type="submit">
                  Test school-system URL
                </button>
              </form>
            ) : null}
          </article>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-3 font-serif text-2xl text-navy">Required environment variables</h2>
        <p className="mb-4 max-w-3xl text-sm text-muted">
          Secrets are not stored in the browser or returned through public APIs. Set them on the server, then restart the application.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM</li>
          <li>PAYMENTS_PROVIDER, PAYMENTS_WEBHOOK_SECRET, optional PAYMENTS_CHECKOUT_URL and PAYMENTS_STATUS_URL</li>
          <li>SCHOOL_SYSTEM_BASE_URL, SCHOOL_SYSTEM_API_KEY, optional SCHOOL_SYSTEM_NAME</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-serif text-2xl text-navy">Operational log</h2>
        <AdminTable headers={["When", "Provider", "Action", "Result"]}>
          {logs.map((item) => (
            <tr key={item.id} className="border-t border-navy/10">
              <td className="px-4 py-3 text-sm">{formatSchoolDateTime(item.createdAt)}</td>
              <td className="px-4 py-3">{item.provider}</td>
              <td className="px-4 py-3">{item.action}</td>
              <td className="px-4 py-3 text-sm text-muted">
                {item.success ? "OK" : "Failed"} {item.message || ""}
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>
    </>
  );
}

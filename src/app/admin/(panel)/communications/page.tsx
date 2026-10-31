import { cancelCampaign, saveCampaign, sendCampaign, sendCampaignTest } from "@/app/actions/communications";
import { AdminTable, AdminTitle, EmptyAdmin, Field, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { smtpReady } from "@/lib/integrations/email";
import { can, COMMUNICATION_CATEGORIES } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function CommunicationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; error?: string; count?: string; tested?: string; sent?: string; cancelled?: string }>;
}) {
  const session = await requirePermission("communications");
  const params = await searchParams;
  const campaigns = await prisma.campaign.findMany({ orderBy: { updatedAt: "desc" } });
  const campaign = campaigns.find((item) => item.id === params.id);
  const canSend = can(session.role, "communications.send");
  const subscribers = await prisma.subscriber.findMany({ where: { status: "active", verifiedAt: { not: null } } });
  const eligible = campaign
    ? subscribers.filter((item) => {
        let cats: string[] = [];
        try {
          const parsed = JSON.parse(item.categoriesJson || "[]");
          cats = Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
          cats = [];
        }
        return cats.includes(campaign.category) || cats.includes("general");
      }).length
    : 0;
  const deliveries = campaign
    ? await prisma.campaignDelivery.findMany({ where: { campaignId: campaign.id }, orderBy: { createdAt: "desc" }, take: 50 })
    : [];

  return (
    <>
      <AdminTitle
        title="Communications"
        description="Draft notices here. A bulk send requires typing the exact confirmation shown. Messages are not sent automatically during development."
      />
      {params.tested ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">A test message was sent to your administrator email.</p> : null}
      {params.sent ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">Campaign send finished. Check delivery rows for failures.</p> : null}
      {params.cancelled ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">Campaign cancelled.</p> : null}
      {params.error === "smtp" ? (
        <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">SMTP is not configured. Delivery was not simulated.</p>
      ) : null}
      {params.error === "confirm" ? (
        <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Confirmation did not match. Type exactly: SEND {params.count || eligible}
        </p>
      ) : null}
      {params.error === "draft" ? (
        <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">Enter a title, subject, and message body.</p>
      ) : null}

      <AdminTable headers={["Title", "Category", "Status", "Sent"]}>
        {campaigns.map((item) => (
          <tr key={item.id} className="border-t border-navy/10">
            <td className="px-4 py-3">
              <a className="font-semibold text-navy underline" href={`/admin/communications?id=${item.id}`}>
                {item.title}
              </a>
            </td>
            <td className="px-4 py-3">{item.category}</td>
            <td className="px-4 py-3">
              <StatusBadge status={item.status} />
            </td>
            <td className="px-4 py-3 text-sm text-muted">
              {item.sentAt ? `${item.sentCount}/${item.recipientCount} · ${formatSchoolDateTime(item.sentAt)}` : "—"}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!campaigns.length ? <EmptyAdmin title="No campaigns" description="Create a draft. Nothing is emailed until you confirm a send." /> : null}

      <form action={saveCampaign} className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">{campaign ? "Edit campaign" : "New campaign"}</h2>
        {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}
        <Field label="Internal title" name="title" required defaultValue={campaign?.title} />
        <Field label="Email subject" name="subject" required defaultValue={campaign?.subject} />
        <Field label="Message" name="body" textarea required defaultValue={campaign?.body} hint="Plain text. An unsubscribe link is added automatically." />
        <Field label="Category" name="category">
          <select name="category" defaultValue={campaign?.category || "general"} className="min-h-11 w-full border border-navy/20 px-3">
            {COMMUNICATION_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Save draft
        </button>
      </form>

      {campaign && campaign.status !== "sent" && canSend ? (
        <section className="mt-8 max-w-3xl border border-navy/10 bg-white p-6">
          <h2 className="font-serif text-2xl text-navy">Send</h2>
          <p className="mt-3 text-sm text-muted">
            Eligible verified subscribers for this category: <strong>{eligible}</strong>. SMTP is {smtpReady() ? "configured" : "not configured"}.
          </p>
          <form action={sendCampaignTest} className="mt-4">
            <input type="hidden" name="id" value={campaign.id} />
            <button className="min-h-11 border border-navy px-4 text-sm font-semibold text-navy" type="submit">
              Send a test to my email only
            </button>
          </form>
          <form action={sendCampaign} className="mt-6 space-y-3">
            <input type="hidden" name="id" value={campaign.id} />
            <label className="block text-sm font-semibold text-navy">
              Type SEND {eligible} to confirm a bulk send
              <input name="confirm" required className="mt-1 min-h-11 w-full border border-navy/20 px-3 font-normal" autoComplete="off" />
            </label>
            <button className="min-h-11 bg-navy px-4 text-sm font-semibold text-white" type="submit">
              Send to eligible subscribers
            </button>
          </form>
          <form action={cancelCampaign} className="mt-4">
            <input type="hidden" name="id" value={campaign.id} />
            <button className="text-sm text-danger underline" type="submit">
              Cancel this campaign
            </button>
          </form>
        </section>
      ) : null}

      {deliveries.length ? (
        <section className="mt-8">
          <h2 className="mb-3 font-serif text-2xl text-navy">Delivery log</h2>
          <AdminTable headers={["Email", "Status", "Detail"]}>
            {deliveries.map((item) => (
              <tr key={item.id} className="border-t border-navy/10">
                <td className="px-4 py-3">{item.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted">{item.error || (item.sentAt ? formatSchoolDateTime(item.sentAt) : "")}</td>
              </tr>
            ))}
          </AdminTable>
        </section>
      ) : null}
    </>
  );
}

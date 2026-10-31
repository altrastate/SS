import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { adminNav } from "@/lib/nav";
import { can, ROLE_LABELS, normalizeRole } from "@/lib/permissions";
import { SCHOOL_CREST } from "@/lib/site-media";
import { cn } from "@/lib/utils";

export function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  const items = adminNav.filter((item) => can(role, item.permission));
  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-navy/10 bg-navy text-ivory lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <img src={SCHOOL_CREST} alt="" width={40} height={40} className="h-10 w-10 bg-transparent object-contain" />
            <div>
              <p className="font-serif text-xl text-ivory">Jinja College</p>
              <p className="text-xs uppercase tracking-[0.16em] text-gold-soft">Operations</p>
            </div>
          </div>
        </div>
        <details className="px-3 pb-4 lg:hidden">
          <summary className="cursor-pointer px-2 py-2 text-sm text-ivory/85">Administration menu</summary>
          <AdminNavGroups groups={groups} />
        </details>
        <nav aria-label="Administration" className="hidden px-3 pb-6 lg:block">
          <AdminNavGroups groups={groups} />
        </nav>
        <form action={logoutAction} className="px-5 pb-6">
          <p className="mb-1 truncate text-xs text-ivory/60">{email}</p>
          <p className="mb-2 text-xs text-gold-soft">{ROLE_LABELS[normalizeRole(role)]}</p>
          <button type="submit" className="text-sm text-gold-soft underline">
            Sign out
          </button>
        </form>
      </aside>
      <div className="min-w-0">
        <div className="h-1 bg-gold" />
        <div className="px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

function AdminNavGroups({ groups }: { groups: Record<string, typeof adminNav> }) {
  return (
    <ul className="space-y-4">
      {Object.entries(groups).map(([group, items]) => (
        <li key={group}>
          <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-soft/80">{group}</p>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 text-sm text-ivory/85 hover:bg-white/10 hover:text-ivory"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function AdminTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-navy">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-navy/10 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-navy/10 bg-ivory">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold text-navy">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const positive = ["published", "responded", "ok", "active", "succeeded", "sent"];
  const warning = ["new", "review", "in_progress", "read", "scheduled", "pending", "pending_verification", "created", "draft"];
  const danger = ["cancelled", "closed", "archived", "inactive", "failed", "disabled", "unsubscribed", "deletion_requested"];
  return (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        positive.includes(status)
          ? "bg-ok/10 text-ok"
          : warning.includes(status)
            ? "bg-gold/20 text-gold-ink"
            : danger.includes(status)
              ? "bg-danger/10 text-danger"
              : "bg-navy/10 text-navy",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  textarea,
  rows = 6,
  hint,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  hint?: string;
  children?: React.ReactNode;
}) {
  const id = name;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-navy">
        {label}
      </label>
      {children ? (
        children
      ) : textarea ? (
        <textarea
          id={id}
          name={name}
          required={required}
          rows={rows}
          defaultValue={defaultValue ?? ""}
          className="w-full border border-navy/20 bg-white px-3 py-2"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue ?? ""}
          className="min-h-11 w-full border border-navy/20 bg-white px-3 py-2"
        />
      )}
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function StatusSelect({
  name = "status",
  defaultValue,
  canPublishContent,
}: {
  name?: string;
  defaultValue?: string | null;
  canPublishContent: boolean;
}) {
  return (
    <select name={name} defaultValue={defaultValue || "draft"} className="min-h-11 w-full border border-navy/20 px-3">
      <option value="draft">Draft</option>
      <option value="review">Awaiting review</option>
      {canPublishContent ? <option value="published">Published</option> : null}
      {canPublishContent ? <option value="archived">Archived</option> : null}
    </select>
  );
}

export function EmptyAdmin({ title, description }: { title: string; description: string }) {
  return (
    <p className="mt-4 border border-dashed border-navy/20 bg-white px-4 py-6 text-muted">
      <strong className="block font-semibold text-navy">{title}</strong>
      {description}
    </p>
  );
}

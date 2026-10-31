import { createUser, setUserActive, updateUserRole } from "@/app/actions/users";
import { AdminTable, AdminTitle, EmptyAdmin, Field, StatusBadge } from "@/app/admin/_ui";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { ROLE_LABELS, ROLES } from "@/lib/permissions";
import { formatSchoolDateTime } from "@/lib/timezone";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; updated?: string }>;
}) {
  const session = await requirePermission("users");
  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const messages: Record<string, string> = {
    invalid: "Check the name, email, password (8+ characters), and role.",
    exists: "That email is already registered.",
    self: "You cannot change your own role or deactivate your own account.",
    "last-admin": "The last Super Admin cannot be demoted or deactivated.",
  };

  return (
    <>
      <AdminTitle
        title="Users and roles"
        description="Roles are enforced on the server. Users cannot assign a role to themselves. Role changes are written to the audit log."
      />
      {params.created ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">Administrator created.</p> : null}
      {params.updated ? <p className="mb-4 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok">User updated.</p> : null}
      {params.error ? (
        <p className="mb-4 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {messages[params.error] || "The change was not saved."}
        </p>
      ) : null}
      <AdminTable headers={["Name", "Email", "Role", "Status", ""]}>
        {users.map((user) => (
          <tr key={user.id} className="border-t border-navy/10 align-top">
            <td className="px-4 py-3 font-semibold text-navy">{user.name}</td>
            <td className="px-4 py-3">{user.email}</td>
            <td className="px-4 py-3">
              {user.id === session.sub ? (
                ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role
              ) : (
                <form action={updateUserRole} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={user.id} />
                  <select name="role" defaultValue={user.role === "admin" ? "super_admin" : user.role} className="min-h-11 border border-navy/20 px-2">
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <button className="text-sm text-navy underline" type="submit">
                    Save role
                  </button>
                </form>
              )}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={user.active ? "active" : "inactive"} />
              <p className="text-xs text-muted">{formatSchoolDateTime(user.createdAt)}</p>
            </td>
            <td className="px-4 py-3">
              {user.id === session.sub ? (
                <span className="text-sm text-muted">Current user</span>
              ) : (
                <form action={setUserActive}>
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="active" value={user.active ? "false" : "true"} />
                  <button className="text-sm text-navy underline" type="submit">
                    {user.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>
      {!users.length ? <EmptyAdmin title="No users" description="Seed created the first Super Admin." /> : null}

      <form action={createUser} className="mt-8 max-w-xl border border-navy/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl text-navy">Add administrator</h2>
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Temporary password" name="password" type="password" required hint="Minimum 8 characters. The user should change this after first sign-in." />
        <Field label="Role" name="role">
          <select name="role" defaultValue="editor" className="min-h-11 w-full border border-navy/20 px-3">
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </Field>
        <button className="min-h-11 bg-navy px-5 text-sm font-semibold text-white" type="submit">
          Create user
        </button>
      </form>
    </>
  );
}

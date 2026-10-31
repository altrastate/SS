"use client";

export function ConfirmDelete({
  action,
  id,
  label,
  extra,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  extra?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {extra
        ? Object.entries(extra).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}
      <button className="text-sm text-danger underline" type="submit">
        Delete
      </button>
    </form>
  );
}

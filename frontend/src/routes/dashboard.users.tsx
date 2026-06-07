import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/users")({
  head: () => ({ meta: [{ title: "Users · MediStock" }] }),
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage administrators, pharmacists, and staff access.</p>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint-soft text-mint-foreground mx-auto">
          <Users className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-serif text-2xl">User management coming soon</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create accounts, assign roles, and manage access controls from this module.</p>
      </div>
    </div>
  );
}

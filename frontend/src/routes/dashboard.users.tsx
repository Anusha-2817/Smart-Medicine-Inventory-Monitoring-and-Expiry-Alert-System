import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
import { getUsers, deleteUser } from "@/lib/services/users.service";
import { UserDialog } from "@/components/app/UserDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/users")({
  head: () => ({ meta: [{ title: "Users · MediStock" }] }),
  component: UsersPage,
});

const roleStyle: Record<string, string> = {
  ADMIN: "bg-mint-soft text-mint-foreground",
  PHARMACIST: "bg-navy-soft text-primary-foreground",
  STAFF: "bg-secondary text-muted-foreground",
};

function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", search, page],
    queryFn: () => getUsers({ search, page, limit: 20 }),
  });

  const del = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully!");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete user");
    },
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      del.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} registered users</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setDialogOpen(true); }}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Search users by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registered</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/60" />
                    <p className="font-medium text-base">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleStyle[u.role] ?? "bg-secondary"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      u.isActive ? "bg-mint-soft text-mint-foreground" : "bg-danger-soft text-danger"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-mint" : "bg-danger"}`} />
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditTarget(u); setDialogOpen(true); }}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-border hover:bg-secondary transition-colors"
                        title="Edit User"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-border text-danger hover:bg-danger-soft transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {total > 20 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-border px-3 py-1 text-xs disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="rounded-lg border border-border px-3 py-1 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      <UserDialog user={editTarget} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

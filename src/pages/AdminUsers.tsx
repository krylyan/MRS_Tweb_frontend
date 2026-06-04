import {
  AlertCircle,
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { adminApi, type AdminUser, type UserRole } from "../services/adminApi";
import AuthUtils from "../utils/authUtils";

export default function AdminUsers() {
  const currentUserId = AuthUtils.getSession()?.userId;

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");

  useEffect(() => {
    setLoading(true);
    adminApi.getAll().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(normalized) ||
        user.fullName.toLowerCase().includes(normalized),
    );
  }, [searchQuery, users]);

  const showResult = (ok: boolean, successMessage: string, errorMessage?: string) => {
    setStatusTone(ok ? "success" : "error");
    setStatusMessage(ok ? successMessage : errorMessage ?? "Action failed");
  };

  const handleRoleChange = async (user: AdminUser) => {
    const newRole: UserRole = user.role === "Admin" ? "User" : "Admin";
    const updated = await adminApi.setRole(user.id, newRole);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showResult(true, `${user.fullName} is now ${newRole}.`);
    } else {
      showResult(false, "", "Failed to update role.");
    }
  };

  const handleToggleBlocked = async (user: AdminUser) => {
    const updated = await adminApi.toggleBlocked(user.id);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showResult(
        true,
        updated.blocked
          ? `${user.fullName} has been blocked.`
          : `${user.fullName} has been unblocked.`,
      );
    } else {
      showResult(false, "", "Failed to update block status.");
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete account for ${user.fullName}? This cannot be undone.`)) return;
    const ok = await adminApi.delete(user.id);
    if (ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showResult(true, `${user.fullName} has been deleted.`);
    } else {
      showResult(false, "", "Failed to delete user.");
    }
  };

  return (
    <main className="min-h-screen text-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <section className="reveal-up mb-6 rounded-3xl border border-amber-400/25 bg-amber-500/15 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Mode Active
              </div>
              <h1 className="text-4xl font-bold text-white">User Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Review registered accounts, search by name or email, update roles, block users, and remove accounts directly from the admin panel.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard icon={<Users className="h-5 w-5" />} label="Total users" value={users.length.toString()} />
              <StatCard
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Admins"
                value={users.filter((u) => u.role === "Admin").length.toString()}
              />
              <StatCard
                icon={<AlertCircle className="h-5 w-5" />}
                label="Blocked"
                value={users.filter((u) => u.blocked).length.toString()}
              />
            </div>
          </div>
        </section>

        <section className="reveal-up reveal-delay-1 mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search users by email or full name..."
              className="h-12 w-full rounded-[14px] border border-white/12 bg-white/4 pl-12 pr-4 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400/60 focus:shadow-[0_0_16px_rgba(251,191,36,0.16)]"
            />
          </div>

          {statusMessage ? (
            <p
              className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
                statusTone === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              {statusMessage}
            </p>
          ) : null}
        </section>

        <section className="reveal-up reveal-delay-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Registered Users</h2>
            <span className="text-sm text-slate-400">{filteredUsers.length} visible</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading users...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            user.role === "Admin"
                              ? "bg-amber-400/20 text-amber-200"
                              : "bg-emerald-500/20 text-emerald-200"
                          }`}
                        >
                          {user.role}
                        </span>
                        {user.blocked ? (
                          <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-200">
                            blocked
                          </span>
                        ) : (
                          <span className="rounded-full bg-sky-500/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200">
                            active
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{user.username}</p>
                    </div>

                    <div className="flex flex-col gap-3 xl:min-w-[420px]">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleRoleChange(user)}
                          disabled={user.id === currentUserId}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <UserCog className="h-4 w-4" />
                          {user.role === "Admin" ? "Set as user" : "Set as admin"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBlocked(user)}
                          disabled={user.id === currentUserId}
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            user.blocked
                              ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
                              : "border border-rose-400/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20"
                          }`}
                        >
                          <Shield className="h-4 w-4" />
                          {user.blocked ? "Unblock account" : "Block account"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === currentUserId}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-rose-500/15 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete account
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {filteredUsers.length === 0 && !loading ? (
                <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-10 text-center text-slate-400">
                  No users match your search.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-200">
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}


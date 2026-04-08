"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Search, CheckCircle, XCircle, Star, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPut } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  isVerified: boolean;
  isPremium: boolean;
  averageRating: number | null;
};

type UsersResponse = {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
};

const ROLES = ["ALL", "STUDENT", "TUTOR", "ADMIN"];

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [role, setRole] = useState(searchParams.get("role") ?? "ALL");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (role && role !== "ALL") params.set("role", role);
      const res = await apiGet<UsersResponse>(`/admin/users?${params}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleActive(user: UserRow) {
    setActionLoading(user.id + "-active");
    try {
      await apiPut(`/admin/users/${user.id}`, { isActive: !user.isActive });
      toast({ title: user.isActive ? "User deactivated" : "User reactivated", variant: "success" });
      load();
    } catch (e) {
      toast({ title: "Failed to update user", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTogglePremium(user: UserRow) {
    if (user.role !== "TUTOR") return;
    setActionLoading(user.id + "-premium");
    try {
      await apiPut(`/admin/users/${user.id}`, { isPremium: !user.isPremium });
      toast({ title: user.isPremium ? "Premium removed" : "User marked as premium", variant: "success" });
      load();
    } catch {
      toast({ title: "Failed to update premium status", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-cyan-400" />
          User Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage accounts, roles, and status</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email..."
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setPage(1); }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    role === r ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">
            {data ? `${data.total} users` : "Loading..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !data || data.users.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-xs">
                    <th className="text-left pb-3 font-medium">User</th>
                    <th className="text-left pb-3 font-medium">Role</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Joined</th>
                    <th className="text-left pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/3 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">
                            {(user.name ?? user.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          {user.isVerified && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                          {user.isPremium && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          user.role === "ADMIN" ? "bg-amber-500/20 text-amber-400" :
                          user.role === "TUTOR" ? "bg-purple-500/20 text-purple-400" :
                          "bg-blue-500/20 text-blue-400"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          user.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-muted-foreground"
                        )}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-7 px-2 text-xs gap-1",
                              user.isActive ? "text-red-400 hover:text-red-400 hover:bg-red-500/10" : "text-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                            )}
                            onClick={() => handleToggleActive(user)}
                            disabled={actionLoading === user.id + "-active"}
                          >
                            {actionLoading === user.id + "-active" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : user.isActive ? (
                              <><XCircle className="h-3.5 w-3.5" />Deactivate</>
                            ) : (
                              <><CheckCircle className="h-3.5 w-3.5" />Activate</>
                            )}
                          </Button>
                          {user.role === "TUTOR" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 px-2 text-xs gap-1",
                                user.isPremium ? "text-amber-400 hover:bg-amber-500/10" : "text-muted-foreground"
                              )}
                              onClick={() => handleTogglePremium(user)}
                              disabled={actionLoading === user.id + "-premium"}
                            >
                              {actionLoading === user.id + "-premium" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <><Star className="h-3.5 w-3.5" />{user.isPremium ? "Unfeature" : "Feature"}</>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-muted-foreground">
                Page {data.page} of {data.totalPages} · {data.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-white/10"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-white/10"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4" onClick={() => setSelectedUser(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm glass-card rounded-2xl p-6 h-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-lg font-bold text-cyan-400">
                  {(selectedUser.name ?? selectedUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">{selectedUser.name ?? "No Name"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Role", value: selectedUser.role },
                  { label: "Status", value: selectedUser.isActive ? "Active" : "Inactive" },
                  { label: "Verified", value: selectedUser.isVerified ? "Yes" : "No" },
                  { label: "Premium", value: selectedUser.isPremium ? "Yes" : "No" },
                  { label: "Rating", value: selectedUser.averageRating ? selectedUser.averageRating.toFixed(1) + " / 5" : "No reviews" },
                  { label: "Joined", value: new Date(selectedUser.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs border-white/10"
                  onClick={() => handleToggleActive(selectedUser)}
                  disabled={actionLoading === selectedUser.id + "-active"}
                >
                  {selectedUser.isActive ? "Deactivate" : "Activate"}
                </Button>
                {selectedUser.role === "TUTOR" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-amber-500/20 text-amber-400"
                    onClick={() => handleTogglePremium(selectedUser)}
                    disabled={actionLoading === selectedUser.id + "-premium"}
                  >
                    {selectedUser.isPremium ? "Remove Featured" : "Make Featured"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

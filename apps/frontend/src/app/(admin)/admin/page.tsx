"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Briefcase,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Stats = {
  totalUsers: number;
  studentCount: number;
  tutorCount: number;
  connections: number;
  openRequests: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  newUsersThisMonth: number;
  fulfillmentsThisMonth: number;
  monthlyRevenueByMonth: { month: string; revenue: number }[];
};

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  trend,
  href,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
  href?: string;
}) {
  const card = (
    <Card className={`glass-card border-white/5 hover:border-white/10 transition-all ${href ? "cursor-pointer" : ""}`}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
                {trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
                {sub}
              </p>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${color.replace("text-", "bg-").replace("-400", "-500/20")}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Stats>("/admin/stats")
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load stats</p>
      </div>
    );
  }

  const revenueTrend = stats.lastMonthRevenue > 0
    ? `৳${stats.monthlyRevenue.toLocaleString()} this month`
    : `৳${stats.monthlyRevenue.toLocaleString()} this month`;

  const revenueDelta = stats.lastMonthRevenue > 0
    ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.newUsersThisMonth} this month`}
          icon={Users}
          color="text-cyan-400"
          trend="up"
          href="/admin/users"
        />
        <KpiCard
          title="Students"
          value={stats.studentCount.toLocaleString()}
          icon={GraduationCap}
          color="text-blue-400"
          href="/admin/users?role=STUDENT"
        />
        <KpiCard
          title="Tutors"
          value={stats.tutorCount.toLocaleString()}
          icon={Briefcase}
          color="text-purple-400"
          href="/admin/users?role=TUTOR"
        />
        <KpiCard
          title="Connections Made"
          value={stats.connections.toLocaleString()}
          sub={`${stats.fulfillmentsThisMonth} this month`}
          icon={TrendingUp}
          color="text-emerald-400"
          trend="up"
        />
        <KpiCard
          title="Total Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          sub={revenueDelta ? `${revenueDelta}% vs last month` : revenueTrend}
          icon={CreditCard}
          color="text-amber-400"
          trend={stats.monthlyRevenue >= stats.lastMonthRevenue ? "up" : "down"}
          href="/admin/payments"
        />
        <KpiCard
          title="Open Requests"
          value={stats.openRequests.toLocaleString()}
          icon={BookOpen}
          color="text-orange-400"
          href="/admin/requests"
        />
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            Monthly Revenue (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyRevenueByMonth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `৳${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,15,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: "/admin/users", label: "Manage Users", desc: "View and manage all accounts", icon: Users, color: "text-cyan-400" },
          { href: "/admin/payments", label: "Payment Logs", desc: "Review transactions", icon: CreditCard, color: "text-amber-400" },
          { href: "/admin/documents", label: "Verify Documents", desc: "Approve/reject tutor docs", icon: BookOpen, color: "text-emerald-400" },
          { href: "/admin/reviews", label: "Moderate Reviews", desc: "Remove inappropriate content", icon: BarChart3, color: "text-purple-400" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="glass-card border-white/5 hover:border-white/15 transition-all cursor-pointer h-full">
              <CardContent className="pt-5">
                <item.icon className={`h-8 w-8 ${item.color} mb-3`} />
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

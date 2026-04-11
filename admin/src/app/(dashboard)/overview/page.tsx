"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Store,
  ArrowLeftRight,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDKK, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

interface Analytics {
  totalUsers: number;
  totalMerchants: number;
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  volumeByType: Array<{
    type: string;
    _sum: { amount: number | null; fee: number | null };
    _count: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    fee: number;
    type: string;
    status: string;
    createdAt: string;
    fromWallet?: { user: { name: string } };
    toWallet?: { user: { name: string } };
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  TOPUP: "Optankning",
  P2P: "P2P",
  MERCHANT_PAYMENT: "Butiksbetaling",
  WITHDRAWAL: "Udbetaling",
  REFUND: "Refundering",
  FEE: "Gebyr",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "info"> = {
  COMPLETED: "success",
  PENDING: "warning",
  FAILED: "danger",
  REFUNDED: "info",
};

const COLORS = ["#0a2f5b", "#2ec964", "#f59e0b", "#ef4444", "#1a4a7a"];

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Analytics>("/admin/analytics")
      .then(setData)
      .catch(() => {
        setData({
          totalUsers: 0,
          totalMerchants: 0,
          totalTransactions: 0,
          totalVolume: 0,
          totalFees: 0,
          volumeByType: [],
          recentTransactions: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const pieData = data.volumeByType.map((v) => ({
    name: TYPE_LABELS[v.type] || v.type,
    value: v._count,
  }));

  const barData = data.volumeByType.map((v) => ({
    name: TYPE_LABELS[v.type] || v.type,
    volume: (v._sum.amount || 0) / 100,
    fees: (v._sum.fee || 0) / 100,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2f5b]">
          Dashboard
        </h1>
        <p className="text-[#0a2f5b]/40">
          Oversigt over PayWay platformen
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Brugere"
          value={data.totalUsers.toLocaleString("da-DK")}
          icon={<Users className="h-6 w-6 text-[#0a2f5b]/50" />}
        />
        <StatCard
          title="Butikker"
          value={data.totalMerchants.toLocaleString("da-DK")}
          icon={<Store className="h-6 w-6 text-[#2ec964]" />}
        />
        <StatCard
          title="Transaktioner"
          value={data.totalTransactions.toLocaleString("da-DK")}
          icon={<ArrowLeftRight className="h-6 w-6 text-[#0a2f5b]/50" />}
        />
        <StatCard
          title="Samlet omsætning"
          value={formatDKK(data.totalVolume)}
          subtitle={`Gebyrer: ${formatDKK(data.totalFees)}`}
          icon={<DollarSign className="h-6 w-6 text-[#2ec964]" />}
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volumen pr. type (DKK)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0a2f5b10" />
                  <XAxis dataKey="name" fontSize={12} tick={{ fill: "#0a2f5b80" }} />
                  <YAxis fontSize={12} tick={{ fill: "#0a2f5b80" }} />
                  <Tooltip
                    formatter={(value) =>
                      `${Number(value).toLocaleString("da-DK")} DKK`
                    }
                    contentStyle={{ borderRadius: "12px", border: "1px solid #0a2f5b10", boxShadow: "0 4px 12px #0a2f5b08" }}
                  />
                  <Bar dataKey="volume" fill="#0a2f5b" radius={[6, 6, 0, 0]} name="Volumen" />
                  <Bar dataKey="fees" fill="#2ec964" radius={[6, 6, 0, 0]} name="Gebyrer" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaktioner pr. type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #0a2f5b10" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seneste transaktioner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#0a2f5b]/[0.06] text-left text-xs uppercase text-[#0a2f5b]/35">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Fra</th>
                  <th className="px-4 py-3">Til</th>
                  <th className="px-4 py-3 text-right">Beløb</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2f5b]/[0.04]">
                {data.recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#0a2f5b]/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Badge variant="info">
                        {TYPE_LABELS[tx.type] || tx.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#0a2f5b]/60">
                      {tx.fromWallet?.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-[#0a2f5b]/60">
                      {tx.toWallet?.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#0a2f5b]">
                      {formatDKK(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[tx.status] || "default"}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#0a2f5b]/35">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatDKK } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  Store,
  ArrowLeftRight,
  Loader2,
} from "lucide-react";

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
}

const PIE_COLORS = ["#0a2f5b", "#2ec964", "#f59e0b", "#ef4444", "#1a4a7a"];

const TYPE_LABELS: Record<string, string> = {
  TOPUP: "Optankning",
  P2P: "P2P",
  MERCHANT_PAYMENT: "Butiksbetaling",
  WITHDRAWAL: "Udbetaling",
  CASHBACK: "Cashback",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ totalUsers: 0, totalMerchants: 0, totalTransactions: 0, totalVolume: 0, totalFees: 0, volumeByType: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2ec964]" />
      </div>
    );
  }

  if (!data) return null;

  const pieData = data.volumeByType
    .filter((v) => (v._sum.amount || 0) > 0)
    .map((v) => ({
      name: TYPE_LABELS[v.type] || v.type,
      value: v._sum.amount || 0,
      count: v._count,
    }));

  const barData = data.volumeByType
    .filter((v) => (v._sum.amount || 0) > 0)
    .map((v) => ({
      name: TYPE_LABELS[v.type] || v.type,
      volume: (v._sum.amount || 0) / 100,
      fees: (v._sum.fee || 0) / 100,
      count: v._count,
    }));

  const hasData = data.totalTransactions > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2f5b]">Analytics</h1>
        <p className="text-[#0a2f5b]/40">Detaljeret oversigt over platformens performance</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total profit (gebyrer)"
          value={formatDKK(data.totalFees)}
          icon={<TrendingUp className="h-6 w-6 text-[#2ec964]" />}
        />
        <StatCard
          title="Samlet volumen"
          value={formatDKK(data.totalVolume)}
          subtitle={`${data.totalTransactions} transaktioner`}
          icon={<ArrowLeftRight className="h-6 w-6 text-[#0a2f5b]/50" />}
        />
        <StatCard
          title="Butikker"
          value={data.totalMerchants.toString()}
          icon={<Store className="h-6 w-6 text-[#0a2f5b]/50" />}
        />
        <StatCard
          title="Brugere"
          value={data.totalUsers.toString()}
          icon={<Users className="h-6 w-6 text-[#2ec964]" />}
        />
      </div>

      {!hasData ? (
        <Card>
          <CardContent>
            <div className="flex h-64 flex-col items-center justify-center text-[#0a2f5b]/25">
              <ArrowLeftRight className="mb-3 h-10 w-10" />
              <p className="text-[15px] font-medium">Ingen transaktionsdata endnu</p>
              <p className="text-[13px]">Data vises her når der er transaktioner i systemet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Volumen pr. type (DKK)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0a2f5b10" />
                    <XAxis dataKey="name" fontSize={12} tick={{ fill: "#0a2f5b80" }} />
                    <YAxis fontSize={12} tick={{ fill: "#0a2f5b80" }} />
                    <Tooltip
                      formatter={(value) => `${Number(value).toLocaleString("da-DK")} DKK`}
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
            <CardHeader><CardTitle>Transaktioner pr. type</CardTitle></CardHeader>
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
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatDKK(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

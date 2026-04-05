"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatDKK } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  ArrowLeftRight,
  Wallet,
  Store,
  Repeat,
} from "lucide-react";
import { api } from "@/lib/api";

interface MerchantProfit {
  id: string;
  businessName: string;
  feeRate: number;
  transactionCount: number;
  totalVolume: number;
  totalProfit: number;
  avgTransaction: number;
}

interface Analytics {
  totalUsers: number;
  totalMerchants: number;
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  avgTransactionAmount: number;
  volumeByType: Array<{
    type: string;
    _sum: { amount: number | null; fee: number | null };
    _count: number;
    _avg?: { amount: number | null };
  }>;
  merchantPayments: {
    count: number;
    totalVolume: number;
    totalProfit: number;
    avgAmount: number;
  };
  p2p: {
    count: number;
    totalVolume: number;
    avgAmount: number;
  };
  profitByMerchant: MerchantProfit[];
}

const DEMO_DAILY_DATA = [
  { date: "28 Mar", transactions: 89, volume: 124000, users: 3 },
  { date: "29 Mar", transactions: 102, volume: 156000, users: 5 },
  { date: "30 Mar", transactions: 95, volume: 132000, users: 2 },
  { date: "31 Mar", transactions: 118, volume: 178000, users: 7 },
  { date: "1 Apr", transactions: 134, volume: 195000, users: 4 },
  { date: "2 Apr", transactions: 121, volume: 167000, users: 6 },
  { date: "3 Apr", transactions: 145, volume: 212000, users: 8 },
];

const PIE_COLORS = ["#0a2f5b", "#2ec964", "#f59e0b", "#ef4444"];

const TYPE_LABELS: Record<string, string> = {
  TOPUP: "Optankning",
  P2P: "P2P",
  MERCHANT_PAYMENT: "Butik",
  WITHDRAWAL: "Udbetaling",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Analytics>("/admin/analytics")
      .then(setData)
      .catch(() => {
        setData({
          totalUsers: 127,
          totalMerchants: 14,
          totalTransactions: 2843,
          totalVolume: 4285000,
          totalFees: 58200,
          avgTransactionAmount: 150700,
          volumeByType: [
            { type: "TOPUP", _sum: { amount: 1850000, fee: 18500 }, _count: 892, _avg: { amount: 207400 } },
            { type: "P2P", _sum: { amount: 1235000, fee: 3200 }, _count: 1205, _avg: { amount: 10200 } },
            { type: "MERCHANT_PAYMENT", _sum: { amount: 1200000, fee: 36500 }, _count: 746, _avg: { amount: 160900 } },
          ],
          merchantPayments: {
            count: 746,
            totalVolume: 1200000,
            totalProfit: 36500,
            avgAmount: 160900,
          },
          p2p: {
            count: 1205,
            totalVolume: 1235000,
            avgAmount: 10200,
          },
          profitByMerchant: [
            { id: "1", businessName: "Brugsen Tórshavn", feeRate: 1.0, transactionCount: 234, totalVolume: 468000, totalProfit: 4680, avgTransaction: 200000 },
            { id: "2", businessName: "SMS Supermarket", feeRate: 1.0, transactionCount: 189, totalVolume: 312000, totalProfit: 3120, avgTransaction: 165100 },
            { id: "3", businessName: "Café Natur", feeRate: 1.5, transactionCount: 156, totalVolume: 195000, totalProfit: 2925, avgTransaction: 125000 },
            { id: "4", businessName: "Steinatún", feeRate: 1.5, transactionCount: 98, totalVolume: 147000, totalProfit: 2205, avgTransaction: 150000 },
            { id: "5", businessName: "Rúsdrekkasøla", feeRate: 1.0, transactionCount: 69, totalVolume: 78000, totalProfit: 780, avgTransaction: 113000 },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const pieData = data.volumeByType
    .filter((v) => v.type !== "FEE")
    .map((v) => ({
      name: TYPE_LABELS[v.type] || v.type,
      value: v._sum.amount || 0,
      count: v._count,
    }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Detaljeret oversigt over platformens performance
        </p>
      </div>

      {/* Top-level KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total profit (gebyrer)"
          value={formatDKK(data.totalFees)}
          subtitle={`Heraf butik: ${formatDKK(data.merchantPayments.totalProfit)}`}
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
        />
        <StatCard
          title="Gns. transaktion (butik)"
          value={formatDKK(data.merchantPayments.avgAmount)}
          subtitle={`${data.merchantPayments.count} betalinger`}
          icon={<Store className="h-6 w-6 text-emerald-600" />}
        />
        <StatCard
          title="P2P volume"
          value={formatDKK(data.p2p.totalVolume)}
          subtitle={`${data.p2p.count} overførsler · gns. ${formatDKK(data.p2p.avgAmount)}`}
          icon={<Repeat className="h-6 w-6 text-emerald-600" />}
        />
        <StatCard
          title="Brugere / Butikker"
          value={data.totalUsers.toString()}
          subtitle={`${data.totalMerchants} aktive butikker`}
          icon={<Users className="h-6 w-6 text-emerald-600" />}
        />
      </div>

      {/* Merchant vs P2P summary */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Volumen fordeling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daglig volumen (DKK)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMO_DAILY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `${(v / 100).toFixed(0)}`} />
                  <Tooltip
                    formatter={(value) => formatDKK(Number(value))}
                    labelFormatter={(label) => `Dato: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#0a2f5b"
                    fill="#0a2f5b"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="Volumen"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit per butik */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profit per butik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500 dark:text-gray-400">
                  <th className="pb-3 font-medium">Butik</th>
                  <th className="pb-3 font-medium text-right">Fee</th>
                  <th className="pb-3 font-medium text-right">Antal</th>
                  <th className="pb-3 font-medium text-right">Volumen</th>
                  <th className="pb-3 font-medium text-right">Gns. transaktion</th>
                  <th className="pb-3 font-medium text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.profitByMerchant.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">
                      {m.businessName}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={m.feeRate <= 1 ? "default" : "secondary"}>
                        {m.feeRate}%
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                      {m.transactionCount}
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                      {formatDKK(m.totalVolume)}
                    </td>
                    <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                      {formatDKK(m.avgTransaction)}
                    </td>
                    <td className="py-3 text-right font-semibold text-green-600">
                      {formatDKK(m.totalProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {data.profitByMerchant.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="pt-3">Total</td>
                    <td className="pt-3" />
                    <td className="pt-3 text-right">
                      {data.profitByMerchant.reduce((s, m) => s + m.transactionCount, 0)}
                    </td>
                    <td className="pt-3 text-right">
                      {formatDKK(data.profitByMerchant.reduce((s, m) => s + m.totalVolume, 0))}
                    </td>
                    <td className="pt-3 text-right" />
                    <td className="pt-3 text-right text-green-600">
                      {formatDKK(data.profitByMerchant.reduce((s, m) => s + m.totalProfit, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daglige transaktioner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DEMO_DAILY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#2ec964"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Transaktioner"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nye brugere pr. dag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMO_DAILY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="users"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    name="Nye brugere"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

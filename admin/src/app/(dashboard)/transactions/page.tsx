"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "@/components/ui/table";
import { formatDKK, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  fee: number;
  type: string;
  status: string;
  description: string | null;
  createdAt: string;
  fromWallet?: { user: { id: string; name: string; phone: string } } | null;
  toWallet?: { user: { id: string; name: string; phone: string } } | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
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

const TYPES = ["", "TOPUP", "P2P", "MERCHANT_PAYMENT", "WITHDRAWAL"];
const STATUSES = ["", "COMPLETED", "PENDING", "FAILED"];

export default function TransactionsPage() {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = (p: number) => {
    setLoading(true);
    let url = `/admin/transactions?page=${p}&limit=20`;
    if (typeFilter) url += `&type=${typeFilter}`;
    if (statusFilter) url += `&status=${statusFilter}`;

    api
      .get<TransactionsResponse>(url)
      .then(setData)
      .catch(() => {
        setData({ transactions: [], total: 0, page: 1, totalPages: 1 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page, typeFilter, statusFilter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2f5b]">
          Transaktioner
        </h1>
        <p className="text-[#0a2f5b]/40">
          Monitor og gennemse alle transaktioner
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Alle transaktioner ({data?.total || 0})
            </CardTitle>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#0a2f5b]/25" />
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-3 py-2 text-sm text-[#0a2f5b]/70"
                >
                  <option value="">Alle typer</option>
                  {TYPES.filter(Boolean).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t] || t}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-[#0a2f5b]/[0.08] bg-white px-3 py-2 text-sm text-[#0a2f5b]/70"
                >
                  <option value="">Alle statusser</option>
                  {STATUSES.filter(Boolean).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
            </div>
          ) : (
            <>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Fra</TableHeaderCell>
                    <TableHeaderCell>Til</TableHeaderCell>
                    <TableHeaderCell className="text-right">Beløb</TableHeaderCell>
                    <TableHeaderCell className="text-right">Gebyr</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Beskrivelse</TableHeaderCell>
                    <TableHeaderCell>Dato</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {data?.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs text-[#0a2f5b]/30">
                        {tx.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">
                          {TYPE_LABELS[tx.type] || tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.fromWallet?.user?.name || "—"}
                      </TableCell>
                      <TableCell>
                        {tx.toWallet?.user?.name || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-[#0a2f5b]">
                        {formatDKK(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right text-[#0a2f5b]/35">
                        {tx.fee > 0 ? formatDKK(tx.fee) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[tx.status] || "default"}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-[#0a2f5b]/35">
                        {tx.description || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-[#0a2f5b]/35">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data && data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-[#0a2f5b]/[0.06] pt-4">
                  <p className="text-sm text-[#0a2f5b]/40">
                    Side {data.page} af {data.totalPages} ({data.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

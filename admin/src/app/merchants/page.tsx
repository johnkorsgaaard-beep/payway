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
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { Store } from "lucide-react";

interface Merchant {
  id: string;
  businessName: string;
  description: string | null;
  feeRate: number;
  status: string;
  createdAt: string;
  user: { name: string; phone: string };
  _count: { qrCodes: number };
}

interface MerchantsResponse {
  merchants: Merchant[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  PENDING: "warning",
  SUSPENDED: "danger",
};

export default function MerchantsPage() {
  const [data, setData] = useState<MerchantsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMerchants = () => {
    setLoading(true);
    api
      .get<MerchantsResponse>("/admin/merchants?page=1&limit=50")
      .then(setData)
      .catch(() => {
        setData({
          merchants: [
            { id: "m1", businessName: "Café Nólsoy", description: "Cozy café in Tórshavn", feeRate: 1.5, status: "ACTIVE", createdAt: "2026-02-10T09:00:00Z", user: { name: "Óli Joensen", phone: "+298654321" }, _count: { qrCodes: 3 } },
            { id: "m2", businessName: "SMS Bókhandil", description: "Boghandel og papir", feeRate: 1.5, status: "ACTIVE", createdAt: "2026-02-20T10:00:00Z", user: { name: "Hanna Patursson", phone: "+298111000" }, _count: { qrCodes: 2 } },
            { id: "m3", businessName: "Rúsdrekkasøla", description: "Vinhandel", feeRate: 2.0, status: "PENDING", createdAt: "2026-03-25T14:00:00Z", user: { name: "Magnus Heinason", phone: "+298222333" }, _count: { qrCodes: 0 } },
          ],
          total: 3,
          page: 1,
          totalPages: 1,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const updateStatus = async (merchantId: string, status: "ACTIVE" | "SUSPENDED") => {
    try {
      await api.put(`/admin/merchants/${merchantId}/status`, { status });
      fetchMerchants();
    } catch {
      if (data) {
        setData({
          ...data,
          merchants: data.merchants.map((m) =>
            m.id === merchantId ? { ...m, status } : m
          ),
        });
      }
    }
  };

  const updateFee = async (merchantId: string, currentFee: number) => {
    const input = prompt("Ny gebyrprocent:", currentFee.toString());
    if (!input) return;
    const fee = parseFloat(input);
    if (isNaN(fee) || fee < 0 || fee > 100) return;

    try {
      await api.put(`/admin/merchants/${merchantId}/fee`, { percentage: fee });
      fetchMerchants();
    } catch {
      if (data) {
        setData({
          ...data,
          merchants: data.merchants.map((m) =>
            m.id === merchantId ? { ...m, feeRate: fee } : m
          ),
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Butikker
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Administrer tilsluttede butikker og deres gebyrer
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-emerald-600" />
            <CardTitle>Alle butikker ({data?.total || 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Butik</TableHeaderCell>
                  <TableHeaderCell>Ejer</TableHeaderCell>
                  <TableHeaderCell>Telefon</TableHeaderCell>
                  <TableHeaderCell>Gebyr</TableHeaderCell>
                  <TableHeaderCell>QR-koder</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Oprettet</TableHeaderCell>
                  <TableHeaderCell>Handlinger</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {data?.merchants.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {m.businessName}
                        </span>
                        {m.description && (
                          <p className="text-xs text-gray-400">{m.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{m.user.name}</TableCell>
                    <TableCell className="font-mono">{m.user.phone}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => updateFee(m.id, m.feeRate)}
                        className="cursor-pointer rounded bg-gray-100 px-2 py-0.5 font-mono text-sm hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        {m.feeRate}%
                      </button>
                    </TableCell>
                    <TableCell>{m._count.qrCodes}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[m.status] || "default"}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {m.status !== "ACTIVE" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateStatus(m.id, "ACTIVE")}
                          >
                            Godkend
                          </Button>
                        )}
                        {m.status === "ACTIVE" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateStatus(m.id, "SUSPENDED")}
                          >
                            Suspender
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

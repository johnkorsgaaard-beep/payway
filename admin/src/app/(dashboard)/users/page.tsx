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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  kycStatus: string;
  isActive: boolean;
  createdAt: string;
  wallet?: { balance: number; status: string };
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const KYC_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  VERIFIED: "success",
  BASIC: "warning",
  NONE: "danger",
};

const ROLE_VARIANT: Record<string, "info" | "success" | "default"> = {
  ADMIN: "info",
  MERCHANT: "success",
  USER: "default",
};

export default function UsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = (p: number) => {
    setLoading(true);
    api
      .get<UsersResponse>(`/admin/users?page=${p}&limit=20`)
      .then(setData)
      .catch(() => {
        setData({
          users: [
            { id: "1", phone: "+298000001", name: "Payway Admin", role: "ADMIN", kycStatus: "VERIFIED", isActive: true, createdAt: "2026-01-15T10:00:00Z", wallet: { balance: 0, status: "ACTIVE" } },
            { id: "2", phone: "+298123456", name: "Demo User", role: "USER", kycStatus: "BASIC", isActive: true, createdAt: "2026-02-01T12:00:00Z", wallet: { balance: 50000, status: "ACTIVE" } },
            { id: "3", phone: "+298654321", name: "Café Nólsoy", role: "MERCHANT", kycStatus: "VERIFIED", isActive: true, createdAt: "2026-02-10T09:00:00Z", wallet: { balance: 125000, status: "ACTIVE" } },
            { id: "4", phone: "+298111222", name: "Anna Hansen", role: "USER", kycStatus: "BASIC", isActive: true, createdAt: "2026-03-01T14:30:00Z", wallet: { balance: 32500, status: "ACTIVE" } },
            { id: "5", phone: "+298333444", name: "Jóhan Petersen", role: "USER", kycStatus: "NONE", isActive: false, createdAt: "2026-03-15T08:00:00Z", wallet: { balance: 0, status: "FROZEN" } },
          ],
          total: 5,
          page: 1,
          totalPages: 1,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const toggleUser = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      fetchUsers(page);
    } catch {
      // Fallback: toggle locally for demo
      if (data) {
        setData({
          ...data,
          users: data.users.map((u) =>
            u.id === userId ? { ...u, isActive: !u.isActive } : u
          ),
        });
      }
    }
  };

  const filteredUsers =
    data?.users.filter(
      (u) =>
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)
    ) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a2f5b]">
          Brugere
        </h1>
        <p className="text-[#0a2f5b]/40">
          Administrer alle PayWay-brugere
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alle brugere ({data?.total || 0})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a2f5b]/25" />
              <input
                type="text"
                placeholder="Søg navn eller telefon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-[#0a2f5b]/[0.08] bg-white py-2 pl-10 pr-4 text-sm text-[#0a2f5b] placeholder-[#0a2f5b]/25 focus:border-[#2ec964]/30 focus:outline-none focus:ring-1 focus:ring-[#2ec964]/10"
              />
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
                    <TableHeaderCell>Navn</TableHeaderCell>
                    <TableHeaderCell>Telefon</TableHeaderCell>
                    <TableHeaderCell>Rolle</TableHeaderCell>
                    <TableHeaderCell>KYC</TableHeaderCell>
                    <TableHeaderCell>Saldo</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Oprettet</TableHeaderCell>
                    <TableHeaderCell>Handlinger</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-[#0a2f5b]">
                        {user.name || "—"}
                      </TableCell>
                      <TableCell className="font-mono">{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant={ROLE_VARIANT[user.role] || "default"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={KYC_VARIANT[user.kycStatus] || "default"}>
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.wallet ? formatDKK(user.wallet.balance) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "danger"}>
                          {user.isActive ? "Aktiv" : "Deaktiveret"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#0a2f5b]/35">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.isActive ? "danger" : "primary"}
                          size="sm"
                          onClick={() => toggleUser(user.id, user.isActive)}
                        >
                          {user.isActive ? "Deaktiver" : "Aktiver"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data && data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-[#0a2f5b]/[0.06] pt-4">
                  <p className="text-sm text-[#0a2f5b]/40">
                    Side {data.page} af {data.totalPages}
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

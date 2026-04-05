"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDKK } from "@/lib/utils";
import { api } from "@/lib/api";
import { Settings, Save } from "lucide-react";

interface FeeConfig {
  id: string;
  name: string;
  percentage: number;
  fixedAmount: number;
  isActive: boolean;
}

const FEE_LABELS: Record<string, { title: string; description: string }> = {
  topup_fee: {
    title: "Optankningsgebyr",
    description: "Gebyr når brugere fylder op via betalingskort",
  },
  p2p_fee: {
    title: "P2P-gebyr",
    description: "Gebyr for person-til-person overførsler (efter gratis grænse)",
  },
  merchant_fee: {
    title: "Butiksgebyr",
    description: "Standardgebyr for butiksbetalinger",
  },
  withdrawal_fee: {
    title: "Udbetalingsgebyr",
    description: "Gebyr for udbetaling til bankkonto",
  },
};

export default function FeesPage() {
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [editing, setEditing] = useState<Record<string, { percentage: string; fixedAmount: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<FeeConfig[]>("/admin/fees")
      .then(setFees)
      .catch(() => {
        setFees([
          { id: "f1", name: "topup_fee", percentage: 1.0, fixedAmount: 0, isActive: true },
          { id: "f2", name: "p2p_fee", percentage: 0.5, fixedAmount: 0, isActive: true },
          { id: "f3", name: "merchant_fee", percentage: 1.5, fixedAmount: 0, isActive: true },
          { id: "f4", name: "withdrawal_fee", percentage: 0.0, fixedAmount: 500, isActive: true },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const startEditing = (fee: FeeConfig) => {
    setEditing((prev) => ({
      ...prev,
      [fee.id]: {
        percentage: fee.percentage.toString(),
        fixedAmount: fee.fixedAmount.toString(),
      },
    }));
  };

  const saveFee = async (feeId: string) => {
    const edit = editing[feeId];
    if (!edit) return;

    setSaving(feeId);
    try {
      await api.put(`/admin/fees/${feeId}`, {
        percentage: parseFloat(edit.percentage),
        fixedAmount: parseInt(edit.fixedAmount) || 0,
      });
      setFees((prev) =>
        prev.map((f) =>
          f.id === feeId
            ? { ...f, percentage: parseFloat(edit.percentage), fixedAmount: parseInt(edit.fixedAmount) || 0 }
            : f
        )
      );
    } catch {
      setFees((prev) =>
        prev.map((f) =>
          f.id === feeId
            ? { ...f, percentage: parseFloat(edit.percentage), fixedAmount: parseInt(edit.fixedAmount) || 0 }
            : f
        )
      );
    }
    setEditing((prev) => {
      const next = { ...prev };
      delete next[feeId];
      return next;
    });
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gebyrer
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Konfigurer platformens gebyrstruktur
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {fees.map((fee) => {
          const label = FEE_LABELS[fee.name] || { title: fee.name, description: "" };
          const isEditing = !!editing[fee.id];

          return (
            <Card key={fee.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-emerald-600" />
                    <div>
                      <CardTitle>{label.title}</CardTitle>
                      <CardDescription>{label.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={fee.isActive ? "success" : "default"}>
                    {fee.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Procent (%)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editing[fee.id].percentage}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [fee.id]: { ...prev[fee.id], percentage: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold dark:border-gray-700 dark:bg-gray-800"
                        />
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                          {fee.percentage}%
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Fast beløb
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editing[fee.id].fixedAmount}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [fee.id]: { ...prev[fee.id], fixedAmount: e.target.value },
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-semibold dark:border-gray-700 dark:bg-gray-800"
                        />
                      ) : (
                        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                          {fee.fixedAmount > 0 ? formatDKK(fee.fixedAmount) : "—"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditing((prev) => {
                              const next = { ...prev };
                              delete next[fee.id];
                              return next;
                            })
                          }
                        >
                          Annuller
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveFee(fee.id)}
                          disabled={saving === fee.id}
                        >
                          <Save className="mr-1 h-4 w-4" />
                          Gem
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEditing(fee)}
                      >
                        Rediger
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

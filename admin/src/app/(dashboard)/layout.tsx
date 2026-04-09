"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state === "unauthenticated") {
      router.replace("/portal");
    } else if (state === "authenticated" && role !== "admin" && role !== "account_manager") {
      router.replace("/portal");
    }
  }, [state, role, router]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2ec964] border-t-transparent" />
      </div>
    );
  }

  if (state !== "authenticated" || (role !== "admin" && role !== "account_manager")) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <main className="ml-64 min-h-screen bg-[#f8fafc] p-8">{children}</main>
    </>
  );
}
